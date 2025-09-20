"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Media, Post, SocialAccount, SocialAccountType } from "@prisma/client";
import { Calendar, Clock, Linkedin, Trash, Trash2 } from "lucide-react";
import { Twitter, Instagram, Plus } from "lucide-react";
import { toast } from "sonner";
import { deletePost } from "@/app/actions/post";
import { updatePost } from "@/app/update-post";
import { useRouter } from "next/navigation";

const getIcon = (type: SocialAccountType) => {
  switch (type) {
    case "X":
      return <Twitter className="w-4 h-4" />;
    case "LINKEDIN":
      return <Linkedin className="w-4 h-4" />;
    case "INSTAGRAM":
      return <Instagram className="w-4 h-4" />;
    default:
      return <Plus className="w-4 h-4" />;
  }
};

type FullPost = Post & { socialAccount: SocialAccount[]; media: Media[] };

const ClientView = ({ posts }: { posts: FullPost[] }) => {
  const router = useRouter();
  const handleDeletePost = async (postId: string) => {
    const toastId = toast.loading("Deleting post...");
    const res = await deletePost(postId);
    if (!res.ok) {
      toast.error(res.error, { description: res.description, id: toastId });
      return;
    } else {
      toast.success("Post deleted successfully", { id: toastId });
      router.refresh();
    }
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

  const postNow = async (post: FullPost) => {
    const toastId = toast.loading("Posting post...");
    const res = await updatePost({
      id: post.id,
      text: post.text,
      accountIds: post.socialAccount.map((account) => account.id),
      mediaIds: post.media.map((media) => media.id),
      scheduledAt: new Date(new Date().getTime() + 120 * 1000), // 120 seconds from now
      postNow: true,
    });
    if (!res.ok) {
      toast.error(res.error, { description: res.description, id: toastId });
      return;
    } else {
      toast.success("Post posted successfully", { id: toastId });
    }
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
              You don&apos;t have any posts scheduled yet. Create your first
              post to get started.
            </p>
            <Button className="bg-purple-600 hover:bg-purple-700">
              Create Post
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 grid md:grid-cols-3 gap-6">
          {posts.map((post) => {
            return (
              <Card
                key={post.id}
                className="hover:shadow-md transition-shadow "
              >
                <CardContent className="flex-1 grid">
                  <div className="flex items-start justify-between flex-1 flex-col">
                    <div className="flex-1 flex w-full flex-col">
                      <div className="flex items-center gap-2 mb-3 justify-between">
                        <div className="flex items-center  gap-2 flex-wrap">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-900">
                            {new Date(post.scheduledAt).toLocaleDateString()}
                          </span>
                          <Clock className="h-4 w-4 text-gray-500 ml-2" />
                          <span className="text-sm text-gray-600">
                            {new Date(post.scheduledAt).toLocaleTimeString()}
                          </span>
                          <Badge variant="secondary" className="ml-2">
                            {post.status}
                          </Badge>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => handleDeletePost(post.id)}
                        >
                          <Trash className="text-red-500 hover:text-red-700" />
                        </Button>
                      </div>

                      <div className="space-y-4 flex-1">
                        {post.media.map((media) => (
                          <div key={media.id}>
                            {/*  eslint-disable-next-line @next/next/no-img-element */}
                            <img src={media.url} alt={media.name} />
                          </div>
                        ))}
                        {post.media.length === 0 && (
                          <div className="w-full aspect-video bg-gray-100 rounded-md flex items-center justify-center">
                            <span className="text-muted-foreground italic">
                              No Media
                            </span>
                          </div>
                        )}
                        <div
                          className="text-gray-800 mb-4 leading-relaxed text-sm"
                          dangerouslySetInnerHTML={{ __html: post.text }}
                        ></div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">To:</span>
                        <div className="flex items-center gap-2">
                          {post.socialAccount.map((account) => (
                            <div
                              key={account.id}
                              className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1"
                            >
                              <span className="text-xs font-medium text-gray-700 flex items-center gap-1 flex-wrap">
                                {getIcon(account.type)}@{account.username}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      {post.status === "FAILED" && (
                        <div className="mt-6">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => postNow(post)}
                          >
                            Post Now (retry)
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* <div className="flex items-center gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeletePost(post.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div> */}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClientView;
