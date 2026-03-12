/**
 * Client-side image optimization using Canvas API
 * Resizes and compresses images before upload to Supabase Storage
 */

interface OptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "image/jpeg" | "image/webp";
}

const DEFAULT_OPTIONS: OptimizeOptions = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.82,
  format: "image/webp",
};

/**
 * Optimize an image file: resize + compress
 * Returns a new File object ready for upload
 */
export async function optimizeImage(
  file: File,
  options: OptimizeOptions = {}
): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Skip non-image files
  if (!file.type.startsWith("image/")) return file;

  // Skip SVGs (vector, no need to optimize)
  if (file.type === "image/svg+xml") return file;

  // Skip GIFs (animated)
  if (file.type === "image/gif") return file;

  // If file is already small (< 200KB), skip optimization
  if (file.size < 200 * 1024) return file;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Calculate new dimensions while maintaining aspect ratio
      if (width > opts.maxWidth! || height > opts.maxHeight!) {
        const ratio = Math.min(
          opts.maxWidth! / width,
          opts.maxHeight! / height
        );
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      // Draw with high quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }

          // If optimized is larger than original, use original
          if (blob.size >= file.size) {
            resolve(file);
            return;
          }

          const ext = opts.format === "image/webp" ? "webp" : "jpg";
          const baseName = file.name.replace(/\.[^.]+$/, "");
          const optimizedFile = new File([blob], `${baseName}.${ext}`, {
            type: opts.format!,
            lastModified: Date.now(),
          });

          resolve(optimizedFile);
        },
        opts.format,
        opts.quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file); // Fallback to original on error
    };

    img.src = url;
  });
}

/**
 * Generate a thumbnail from an image file
 */
export async function generateThumbnail(
  file: File,
  size: number = 400
): Promise<File> {
  return optimizeImage(file, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.75,
    format: "image/webp",
  });
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
