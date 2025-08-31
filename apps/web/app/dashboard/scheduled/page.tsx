"use client";

import { useState } from "react";
import { Card, CardContent } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import { Textarea } from "@repo/ui/components/textarea";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
  Calendar,
  Clock,
  Edit,
  Trash2,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
} from "lucide-react";

// Mock data for scheduled posts
const scheduledPosts = [
  {
    id: 1,
    content:
      "Excited to share our latest product update! 🚀 New features that will revolutionize how you manage your social media presence.",
    scheduledDate: "2024-01-15",
    scheduledTime: "10:00 AM",
    platforms: ["facebook", "twitter", "linkedin"],
    status: "scheduled",
    image: null,
  },
  {
    id: 2,
    content:
      "Behind the scenes look at our development process. Building something amazing takes time and dedication! #TechLife",
    scheduledDate: "2024-01-16",
    scheduledTime: "2:30 PM",
    platforms: ["instagram", "twitter"],
    status: "scheduled",
    image: "/api/placeholder/400/300",
  },
  {
    id: 3,
    content:
      "Weekly tips for social media success: 1. Consistency is key 2. Engage with your audience 3. Use analytics to improve",
    scheduledDate: "2024-01-18",
    scheduledTime: "9:15 AM",
    platforms: ["linkedin", "facebook"],
    status: "scheduled",
    image: null,
  },
  {
    id: 4,
    content:
      "Join us for our upcoming webinar on social media automation! Link in bio for registration. #Webinar #SocialMedia",
    scheduledDate: "2024-01-20",
    scheduledTime: "11:45 AM",
    platforms: ["twitter", "linkedin", "facebook", "instagram"],
    status: "scheduled",
    image: null,
  },
];

const platformIcons = {
  facebook: <Facebook className="h-4 w-4 text-blue-600" />,
  twitter: <Twitter className="h-4 w-4 text-sky-500" />,
  instagram: <Instagram className="h-4 w-4 text-pink-600" />,
  linkedin: <Linkedin className="h-4 w-4 text-blue-700" />,
  youtube: <Youtube className="h-4 w-4 text-red-600" />,
};

const platformNames = {
  facebook: "Facebook",
  twitter: "Twitter",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  youtube: "YouTube",
};

export default function ScheduledPostsPage() {
  const [posts, setPosts] = useState<typeof scheduledPosts>(scheduledPosts);
  const [editingPost, setEditingPost] = useState<(typeof scheduledPosts)[0]>();
  const [editContent, setEditContent] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");

  const handleDeletePost = (postId: number) => {
    setPosts(posts.filter((post) => post.id !== postId));
  };

  const handleEditPost = (post: (typeof scheduledPosts)[number]) => {
    setEditingPost(post);
    setEditContent(post.content);
    setEditDate(post.scheduledDate);
    setEditTime(post.scheduledTime);
  };

  const handleSaveEdit = () => {
    setPosts(
      posts.map((post) =>
        post.id === editingPost?.id
          ? {
              ...post,
              content: editContent,
              scheduledDate: editDate,
              scheduledTime: editTime,
            }
          : post
      )
    );
    setEditingPost(undefined);
    setEditContent("");
    setEditDate("");
    setEditTime("");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="container">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Scheduled Posts</h1>
        <p className="text-gray-600 mt-1">
          Manage your upcoming social media posts
        </p>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No scheduled posts
            </h3>
            <p className="text-gray-500 text-center mb-4">
              You don't have any posts scheduled yet. Create your first post to
              get started.
            </p>
            <Button className="bg-purple-600 hover:bg-purple-700">
              Create Post
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">
                        {formatDate(post.scheduledDate)}
                      </span>
                      <Clock className="h-4 w-4 text-gray-500 ml-2" />
                      <span className="text-sm text-gray-600">
                        {post.scheduledTime}
                      </span>
                      <Badge variant="secondary" className="ml-2">
                        {post.status}
                      </Badge>
                    </div>

                    <p className="text-gray-800 mb-4 leading-relaxed">
                      {post.content}
                    </p>

                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Posting to:</span>
                      <div className="flex items-center gap-2">
                        {post.platforms.map((platform) => (
                          <div
                            key={platform}
                            className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1"
                          >
                            {
                              platformIcons[
                                platform as keyof typeof platformIcons
                              ]
                            }
                            <span className="text-xs font-medium text-gray-700">
                              {
                                platformNames[
                                  platform as keyof typeof platformNames
                                ]
                              }
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditPost(post)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Edit Scheduled Post</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="edit-content">Post Content</Label>
                            <Textarea
                              id="edit-content"
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              rows={4}
                              className="mt-1"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="edit-date">Scheduled Date</Label>
                              <Input
                                id="edit-date"
                                type="date"
                                value={editDate}
                                onChange={(e) => setEditDate(e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-time">Scheduled Time</Label>
                              <Input
                                id="edit-time"
                                type="time"
                                value={editTime}
                                onChange={(e) => setEditTime(e.target.value)}
                                className="mt-1"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setEditingPost(undefined)}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleSaveEdit}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              Save Changes
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePost(post.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
