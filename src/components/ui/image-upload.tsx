"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { optimizeImage, formatFileSize } from "@/lib/image-optimize";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  bucket: string;
  folder?: string;
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  className?: string;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export function ImageUpload({ bucket, folder, value, onChange, onRemove, className, maxWidth, maxHeight, quality }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    // Optimize image before upload
    setProgress(`최적화 중... (${formatFileSize(file.size)})`);
    const optimized = await optimizeImage(file, {
      maxWidth: maxWidth ?? 1920,
      maxHeight: maxHeight ?? 1920,
      quality: quality ?? 0.82,
    });
    setProgress(`업로드 중... (${formatFileSize(optimized.size)})`);

    const supabase = createClient();
    const fileExt = optimized.name.split(".").pop();
    const fileName = `${folder ? folder + "/" : ""}${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, optimized);

    if (error) {
      console.error("Upload error:", error);
      setUploading(false);
      setProgress("");
      return;
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    onChange(urlData.publicUrl);
    setUploading(false);
    setProgress("");
  }

  return (
    <div className={cn("relative", className)}>
      {value ? (
        <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
          <img src={value} alt="" className="w-full h-full object-cover" />
          {onRemove && (
            <button
              onClick={onRemove}
              className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full aspect-video rounded-xl border-2 border-dashed border-gray-200 hover:border-green-400 bg-gray-50 hover:bg-green-50/50 flex flex-col items-center justify-center gap-2 transition-colors"
        >
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              {progress && <span className="text-xs text-gray-400">{progress}</span>}
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400" />
              <span className="text-sm text-gray-500">이미지 업로드</span>
              <span className="text-xs text-gray-400">자동 최적화 (WebP)</span>
            </>
          )}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
}
