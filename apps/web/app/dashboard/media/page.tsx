"use client";

import type React from "react";

import { useState } from "react";
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
import { Upload, Trash2, Play, ImageIcon, Video } from "lucide-react";

interface MediaItem {
  id: string;
  name: string;
  type: "image" | "video";
  url: string;
  size: string;
  uploadDate: string;
  thumbnail?: string;
}

export default function MediaPage() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([
    {
      id: "1",
      name: "product-demo.mp4",
      type: "video",
      url: "/video-thumbnail.png",
      size: "15.2 MB",
      uploadDate: "2024-01-15",
      thumbnail: "/video-thumbnail.png",
    },
    {
      id: "2",
      name: "brand-logo.png",
      type: "image",
      url: "/generic-brand-logo.png",
      size: "2.1 MB",
      uploadDate: "2024-01-14",
    },
    {
      id: "3",
      name: "social-post-1.jpg",
      type: "image",
      url: "/social-media-post.png",
      size: "1.8 MB",
      uploadDate: "2024-01-13",
    },
    {
      id: "4",
      name: "tutorial-video.mp4",
      type: "video",
      url: "/tutorial-video.png",
      size: "28.5 MB",
      uploadDate: "2024-01-12",
      thumbnail: "/tutorial-video.png",
    },
    {
      id: "5",
      name: "infographic.png",
      type: "image",
      url: "/infographic-design.png",
      size: "3.2 MB",
      uploadDate: "2024-01-11",
    },
    {
      id: "6",
      name: "behind-scenes.mp4",
      type: "video",
      url: "/behind-the-scenes.png",
      size: "42.1 MB",
      uploadDate: "2024-01-10",
      thumbnail: "/behind-the-scenes.png",
    },
  ]);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      const newMediaItem: MediaItem = {
        id: Date.now().toString(),
        name: selectedFile.name,
        type: selectedFile.type.startsWith("video/") ? "video" : "image",
        url: URL.createObjectURL(selectedFile),
        size: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadDate: new Date().toISOString().split("T")[0],
      };

      setMediaItems([newMediaItem, ...mediaItems]);
      setSelectedFile(null);
      setIsUploadOpen(false);
    }
  };

  const handleDelete = (id: string) => {
    setMediaItems(mediaItems.filter((item) => item.id !== id));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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
                      onChange={handleFileSelect}
                      className="mt-1"
                    />
                  </div>

                  {selectedFile && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleUpload}
                      disabled={!selectedFile}
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                    >
                      Upload
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsUploadOpen(false);
                        setSelectedFile(null);
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
                        mediaItems.filter((item) => item.type === "image")
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
                        mediaItems.filter((item) => item.type === "video")
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
                      src={item.thumbnail || item.url}
                      alt={item.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />

                    {/* Media Type Indicator */}
                    <div className="absolute top-2 left-2">
                      {item.type === "video" ? (
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
                      <span>{formatDate(item.uploadDate)}</span>
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
}
