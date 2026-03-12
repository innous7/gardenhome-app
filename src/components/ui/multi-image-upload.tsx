"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { optimizeImage, formatFileSize } from "@/lib/image-optimize";
import { cn } from "@/lib/utils";

interface MultiImageUploadProps {
  bucket: string;
  folder?: string;
  value: string[];
  onChange: (urls: string[]) => void;
  className?: string;
  maxImages?: number;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export function MultiImageUpload({
  bucket,
  folder,
  value = [],
  onChange,
  className,
  maxImages = 10,
  maxWidth,
  maxHeight,
  quality,
}: MultiImageUploadProps) {
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

    onChange([...value, urlData.publicUrl]);
    setUploading(false);
    setProgress("");

    // Reset input so the same file can be selected again
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleRemove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {value.map((url, index) => (
          <div
            key={url}
            className="relative aspect-video rounded-xl overflow-hidden bg-gray-100"
          >
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        {value.length < maxImages && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="aspect-video rounded-xl border-2 border-dashed border-gray-200 hover:border-green-400 bg-gray-50 hover:bg-green-50/50 flex flex-col items-center justify-center gap-1.5 transition-colors"
          >
            {uploading ? (
              <>
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                {progress && <span className="text-[10px] text-gray-400 px-2 text-center">{progress}</span>}
              </>
            ) : (
              <>
                <Plus className="w-6 h-6 text-gray-400" />
                <span className="text-xs text-gray-500">추가</span>
              </>
            )}
          </button>
        )}
      </div>

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
