'use client';

import React, { useRef, useState, useCallback } from 'react';
import { ImageIcon, Upload, X, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

type UploadState =
  | { status: 'idle' }
  | { status: 'uploading' }
  | { status: 'error'; message: string };

export function ImageUpload({ value, onChange, label = 'Image' }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState(value);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [uploadState, setUploadState] = useState<UploadState>({ status: 'idle' });

  const handleUrlSubmit = () => {
    const trimmed = urlInput.trim();
    if (trimmed) {
      onChange(trimmed);
      setPreview(trimmed);
    }
  };

  const handleUrlKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleUrlSubmit();
    }
  };

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type client-side
      if (!file.type.startsWith('image/')) {
        setUploadState({
          status: 'error',
          message: 'Only image files are allowed (JPEG, PNG, GIF, WebP, SVG).',
        });
        e.target.value = '';
        return;
      }

      // Validate file size client-side (5 MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadState({
          status: 'error',
          message: `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 5 MB.`,
        });
        e.target.value = '';
        return;
      }

      setUploadState({ status: 'uploading' });

      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({ error: 'Upload failed.' }));
          throw new Error(body.error ?? `Server returned ${res.status}`);
        }

        const { url } = await res.json();

        setPreview(url);
        onChange(url);
        setUploadState({ status: 'idle' });
      } catch (err: any) {
        setUploadState({
          status: 'error',
          message: err.message ?? 'Upload failed. Please try again.',
        });
      }

      // Reset the input so the same file can be re-selected
      e.target.value = '';
    },
    [onChange],
  );

  const handleRemove = () => {
    setPreview(null);
    setUrlInput('');
    onChange('');
    setUploadState({ status: 'idle' });
  };

  const dismissError = () => setUploadState({ status: 'idle' });

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{label}</Label>

      {/* Error banner */}
      {uploadState.status === 'error' && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="flex-1">{uploadState.message}</span>
          <button
            type="button"
            onClick={dismissError}
            className="shrink-0 text-muted-foreground hover:text-foreground"
            aria-label="Dismiss error"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Preview */}
      {preview ? (
        <div className="relative group w-full max-w-sm rounded-lg border overflow-hidden bg-muted/30">
          <div className="aspect-video w-full">
            <img
              src={preview}
              alt="Preview"
              className="h-full w-full object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleRemove}
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex h-32 w-full max-w-sm items-center justify-center rounded-lg border border-dashed bg-muted/30">
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <ImageIcon className="h-8 w-8" />
            <span className="text-xs">No image</span>
          </div>
        </div>
      )}

      {/* URL Input */}
      <div className="flex gap-2">
        <Input
          type="url"
          placeholder="Paste image URL..."
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={handleUrlKeyDown}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUrlSubmit}
          disabled={!urlInput.trim()}
        >
          Apply
        </Button>
      </div>

      {/* File Upload */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploadState.status === 'uploading'}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="gap-1.5"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadState.status === 'uploading'}
        >
          {uploadState.status === 'uploading' ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <Upload className="h-3.5 w-3.5" />
              Upload File
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
