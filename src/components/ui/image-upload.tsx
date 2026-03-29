'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const CLOUD_NAME = 'dap2zavrb';
const UPLOAD_PRESET = 'unsigned-upload';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ImageUpload({
  value,
  onChange,
  disabled,
  placeholder = 'Upload atau tempel URL gambar...',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function uploadToCloudinary(file: File) {
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );

      if (!res.ok) throw new Error('Upload gagal');

      const data = await res.json();
      onChange(data.secure_url);
    } catch {
      setError('Gagal mengupload gambar. Coba lagi.');
    } finally {
      setUploading(false);
    }
  }

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar.');
      return;
    }
    if (file.size > 1 * 1024 * 1024) {
      setError('Ukuran file maksimal 1MB.');
      return;
    }
    uploadToCloudinary(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div className="space-y-2">
      {/* Preview */}
      {value && (
        <div className="relative rounded-lg overflow-hidden bg-muted group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Preview"
            className="w-full h-auto max-h-[200px] object-contain"
          />
          {!disabled && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Upload area */}
      {!value && (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !disabled && !uploading && fileRef.current?.click()}
          className={cn(
            'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 cursor-pointer transition-colors',
            dragOver ? 'border-primary bg-primary/5' : 'border-border/60 hover:border-border',
            disabled && 'opacity-50 cursor-not-allowed',
            uploading && 'pointer-events-none',
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Mengupload...</p>
            </>
          ) : (
            <>
              <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
              <p className="text-xs text-muted-foreground text-center">
                Klik untuk pilih atau drag &amp; drop gambar
              </p>
              <p className="text-[10px] text-muted-foreground/40">PNG, JPG, WebP — maks 1MB</p>
            </>
          )}
        </div>
      )}

      {/* URL input fallback */}
      {!value && !uploading && (
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-border/50" />
          <span className="text-[10px] text-muted-foreground/40 uppercase tracking-wider">atau</span>
          <div className="h-px flex-1 bg-border/50" />
        </div>
      )}
      {!value && !uploading && (
        <input
          type="url"
          placeholder={placeholder}
          disabled={disabled}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              const url = (e.target as HTMLInputElement).value.trim();
              if (url) onChange(url);
            }
          }}
          onBlur={e => {
            const url = e.target.value.trim();
            if (url) onChange(url);
          }}
          className={cn(
            'w-full h-9 px-3 rounded-lg text-sm transition-colors',
            'bg-muted/40 border border-transparent outline-none',
            'placeholder:text-muted-foreground/40',
            'focus:border-border',
          )}
        />
      )}

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
