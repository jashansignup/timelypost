"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Upload, Trash2, Play, ImageIcon, Video, Check } from "lucide-react";
import { Media } from "@repo/database";
import { getPresignedUrl } from "@/app/actions/get-presigned-url";
import { Progress } from "@repo/ui/components/progress";
import { addMediaToUser } from "@/app/actions/media";
import { S3_BUCKET_ENDPOINT } from "@/lib/constants";

const ClientView = ({ mediaItems }: { mediaItems: Media[] }) => {
  const router = useRouter();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingFiles, setuploadingFiles] = useState<
    { file: File; id: string; url: string; progress: number }[]
  >([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    setIsUploading(true);
    // Close the dialog as soon as upload starts
    setIsUploadOpen(false);

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
      setuploadingFiles((prev) => [...prev, item]);

      const p = new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", item.url);
        // Ensure correct content type is passed to S3
        if (file.type) xhr.setRequestHeader("Content-Type", file.type);
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            setuploadingFiles((prev) =>
              prev.map((f) => (f.id === item.id ? { ...f, progress } : f))
            );
          }
        };
        xhr.onload = async () => {
          if (xhr.status === 200) {
            await addMediaToUser({ mediaId: item.id });
            resolve(item.id);
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
      // Refresh media list after successful uploads
      router.refresh();
    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setIsUploading(false);
      setSelectedFiles([]);
    }
  };
  const handleDelete = (id: string) => {};

  return (
    <div className="container ">
      <div className="p-6">
        <div className="mx-auto">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Media Library
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your uploaded images and videos
              </p>
            </div>

            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Media
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Upload Media</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="media-file">Select File</Label>
                    <Input
                      id="media-file"
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) => {
                        setSelectedFiles(Array.from(e.target.files || []));
                      }}
                      multiple
                      className="mt-1"
                    />
                  </div>

                  {/* {selectedFiles && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium">
                        {selectedFiles[0].name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(selectedFiles[0].size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </div>
                  )} */}

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleSubmit}
                      disabled={selectedFiles.length === 0 || isUploading}
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                    >
                      Upload
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsUploadOpen(false);
                        setSelectedFiles([]);
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <ImageIcon className="w-8 h-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Images</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {
                        mediaItems.filter((item) => item.type === "IMAGE")
                          .length
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Video className="w-8 h-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Videos</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {
                        mediaItems.filter((item) => item.type === "VIDEO")
                          .length
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Upload className="w-8 h-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">
                      Total Files
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {mediaItems.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-3">
            {uploadingFiles.map((file) => (
              <Card key={file.id}>
                <CardContent className="p-1">
                  <div className="flex items-center">
                    <ImageIcon className="w-8 h-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">
                        {file.file.name}
                      </p>
                    </div>
                    <div className="ml-3 flex-1 flex items-center gap-4 pr-3">
                      <Progress value={file.progress} />
                      {file.progress === 100 && (
                        <Check className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Media Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {mediaItems.map((item) => (
              <Card
                key={item.id}
                className="group hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={S3_BUCKET_ENDPOINT + item.url}
                      alt={item.url}
                      className="w-full h-48 object-contain rounded-t-lg"
                    />

                    {/* Media Type Indicator */}
                    <div className="absolute top-2 left-2">
                      {item.type === "VIDEO" ? (
                        <div className="bg-black/70 text-white px-2 py-1 rounded-md flex items-center text-xs">
                          <Play className="w-3 h-3 mr-1" />
                          Video
                        </div>
                      ) : (
                        <div className="bg-black/70 text-white px-2 py-1 rounded-md flex items-center text-xs">
                          <ImageIcon className="w-3 h-3 mr-1" />
                          Image
                        </div>
                      )}
                    </div>

                    {/* Delete Button */}
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="p-4">
                    <h3
                      className="font-medium text-gray-900 truncate"
                      title={item.name}
                    >
                      {item.name}
                    </h3>
                    <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                      <span>{item.size}</span>
                      <span>{item.createdAt.toISOString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {mediaItems.length === 0 && (
            <div className="text-center py-12">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No media files
              </h3>
              <p className="text-gray-500 mb-4">
                Upload your first image or video to get started
              </p>
              <Button
                onClick={() => setIsUploadOpen(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Media
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientView;
