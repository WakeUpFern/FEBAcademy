"use client";

import { useState, useCallback } from "react";
import { UploadCloud, X, Loader2, Image as ImageIcon } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import { cn } from "@/lib/utils";

// Client for storage uploads (requires NEXT_PUBLIC_SUPABASE_URL and ANON_KEY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  onRemove: () => void;
  bucket?: string;
  folder?: string;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  bucket = "public", // default bucket if none specified
  folder = "courses",
  className,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = useCallback(
    async (file: File) => {
      try {
        setIsUploading(true);
        setError(null);

        // Validate file type
        if (!file.type.startsWith("image/")) {
          throw new Error("Por favor sube solo imágenes.");
        }

        // Validate size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error("La imagen debe pesar menos de 5MB.");
        }

        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);

        onChange(publicUrlData.publicUrl);
      } catch (err: any) {
        console.error("Upload error:", err);
        setError(err.message || "Error al subir la imagen. Verifica que el bucket exista y sea público.");
      } finally {
        setIsUploading(false);
      }
    },
    [bucket, folder, onChange]
  );

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  if (value) {
    return (
      <div className={cn("relative rounded-xl overflow-hidden group", className)}>
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 bg-destructive text-destructive-foreground rounded-md shadow-sm hover:bg-destructive/90 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="relative aspect-video w-full bg-muted">
          <Image
            src={value}
            alt="Upload preview"
            fill
            className="object-cover"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          "relative flex flex-col items-center justify-center aspect-video w-full rounded-xl border-2 border-dashed transition-colors",
          isDragOver 
            ? "border-primary bg-primary/5" 
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
          isUploading && "opacity-50 pointer-events-none"
        )}
      >
        <input
          type="file"
          accept="image/*"
          onChange={onFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm font-medium">Subiendo imagen...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 p-6 text-center text-muted-foreground">
            <div className="p-3 bg-muted rounded-full">
              <UploadCloud className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">
                Arrastra una imagen o haz clic para subir
              </p>
              <p className="text-xs">
                SVG, PNG, JPG o GIF (max. 5MB)
              </p>
            </div>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-2 text-xs text-destructive flex items-center gap-1">
          <X className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}
