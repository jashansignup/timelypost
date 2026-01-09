"use client";
import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Upload, Check, Loader2, AlertTriangle } from "lucide-react";
import { getPresignedUrl } from "@/app/actions/get-presigned-url";
import { addMediaToUser } from "@/app/actions/media";

const MAX_FILE_SIZE_MB = 200;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const SUPPORTED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/x-matroska"];
const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png"];

export type UploadMediaDialogProps = {
  trigger?: React.ReactNode;
  onUploaded?: (mediaIds: string[]) => void;
};

const UploadMediaDialog: React.FC<UploadMediaDialogProps> = ({
  trigger,
  onUploaded,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<
    { file: File; id: string; url: string; progress: number }[]
  >([]);
  const [isUploading, setIsUploading] = useState(false);

  const fileValidation = useMemo(() => {
    const warnings: string[] = [];
    const errors: string[] = [];

    for (const file of selectedFiles) {
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");

      if (file.size > MAX_FILE_SIZE_BYTES) {
        errors.push(`${file.name}: File exceeds ${MAX_FILE_SIZE_MB}MB limit`);
      }

      if (isVideo && !SUPPORTED_VIDEO_TYPES.includes(file.type)) {
        errors.push(`${file.name}: Unsupported video format. Use MP4, MOV, or MKV`);
      }

      if (isImage && !SUPPORTED_IMAGE_TYPES.includes(file.type)) {
        errors.push(`${file.name}: Unsupported image format. Use JPEG or PNG`);
      }

      if (isVideo) {
        const sizeMB = file.size / (1024 * 1024);
        if (sizeMB > 100) {
          warnings.push(`${file.name}: Large video (${sizeMB.toFixed(1)}MB) may take longer to process`);
        }
      }
    }

    return { warnings, errors, hasErrors: errors.length > 0 };
  }, [selectedFiles]);

  const handleSubmit = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    setIsUploading(true);
    // Keep dialog open to show progress

    const uploadedIds: string[] = [];
    const uploadPromises: Promise<unknown>[] = [];

    for (const file of selectedFiles) {
      const res = await getPresignedUrl({
        name: file.name,
        size: file.size,
        contentType: file.type,
        pathKey: "media",
      });
      if (!res.ok) {
        console.error("Presigned URL error:", res.error);
        continue;
      }

      const item = { file, url: res.data.url, id: res.data.id, progress: 0 };
      setUploadingFiles((prev) => [...prev, item]);

      const p = new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", item.url);
        if (file.type) xhr.setRequestHeader("Content-Type", file.type);
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            setUploadingFiles((prev) =>
              prev.map((f) => (f.id === item.id ? { ...f, progress } : f))
            );
          }
        };
        xhr.onload = async () => {
          if (xhr.status === 200) {
            try {
              await addMediaToUser({ mediaId: item.id });
              uploadedIds.push(item.id);
              resolve(item.id);
            } catch (e) {
              reject(e);
            }
          } else {
            reject(
              new Error(`Upload failed for file ${item.id}: ${xhr.statusText}`)
            );
          }
        };
        xhr.onerror = () =>
          reject(new Error(`Upload failed for file ${item.id}`));
        xhr.send(file);
      });

      uploadPromises.push(p);
    }

    try {
      await Promise.all(uploadPromises);
      onUploaded?.(uploadedIds);
    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setIsUploading(false);
      setSelectedFiles([]);
      setUploadingFiles([]);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (isUploading) return; // Prevent closing while uploading
        setOpen(v);
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="secondary" size="sm" className="gap-2">
            <Upload className="w-4 h-4" /> Upload New
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Media</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="media-file">Select File(s)</Label>
            <Input
              id="media-file"
              type="file"
              accept="image/jpeg,image/png,video/mp4,video/quicktime,video/x-matroska"
              onChange={(e) => {
                setSelectedFiles(Array.from(e.target.files || []));
              }}
              multiple
              className="mt-1"
              disabled={isUploading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Supported: JPEG, PNG, MP4, MOV, MKV (max {MAX_FILE_SIZE_MB}MB)
            </p>
          </div>

          {fileValidation.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 space-y-1">
              {fileValidation.errors.map((error, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-red-700">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              ))}
            </div>
          )}

          {fileValidation.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 space-y-1">
              {fileValidation.warnings.map((warning, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-yellow-700">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{warning}</span>
                </div>
              ))}
            </div>
          )}

          {isUploading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading {uploadingFiles.length || selectedFiles.length}{" "}
              file(s)...
            </div>
          )}

          {uploadingFiles.length > 0 && (
            <div className="space-y-2">
              {uploadingFiles.map((file) => (
                <div key={file.id} className="flex items-center gap-3">
                  <div className="text-sm truncate flex-1">
                    {file.file.name}
                  </div>
                  <div className="min-w-[160px] flex items-center gap-2">
                    <Progress value={file.progress} />
                    {file.progress === 100 && (
                      <Check className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {uploadingFiles.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Overall</span>
              <Progress
                value={
                  uploadingFiles.reduce((acc, f) => acc + f.progress, 0) /
                  uploadingFiles.length
                }
              />
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSubmit}
              disabled={selectedFiles.length === 0 || isUploading || fileValidation.hasErrors}
              className="flex-1"
            >
              {isUploading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                </span>
              ) : (
                "Upload"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
                setSelectedFiles([]);
              }}
              className="flex-1"
              disabled={isUploading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadMediaDialog;
