"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Plus,
  MoreVertical,
  ImagePlus,
  Sparkles,
  CalendarIcon,
  Clock,
  Music,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const accountGroups = [
  [
    {
      id: "fb-1",
      type: "icon",
      icon: "f",
      name: "Facebook",
      username: "Facebook",
      bgColor: "bg-white",
      isSelectable: false,
    },
    {
      id: "fb-2",
      type: "avatar",
      image: "/travel-blogger-profile-colorful.jpg",
      name: "Travel Blog",
      username: "@travelblog_official",
      isSelectable: true,
    },
    {
      id: "fb-3",
      type: "avatar",
      image: "/blog-writer-desk-workspace.jpg",
      name: "Blog Page",
      username: "@myblogpage",
      isSelectable: true,
    },
  ],
  [
    {
      id: "tw-1",
      type: "icon",
      icon: "X",
      name: "X (Twitter)",
      username: "X (Twitter)",
      bgColor: "bg-white",
      isSelectable: false,
    },
    {
      id: "tw-2",
      type: "avatar",
      image: "/abstract-blue-sound-waves-tech.jpg",
      name: "Tech Account",
      username: "@tech_updates",
      isSelectable: true,
    },
    {
      id: "ig-1",
      type: "avatar",
      image: "/tips-infographic-yellow-document.jpg",
      name: "Tips Page",
      username: "@dailytips_ig",
      isSelectable: true,
    },
  ],
  [
    {
      id: "ig-2",
      type: "icon",
      icon: "θ",
      name: "Threads",
      username: "Threads",
      bgColor: "bg-blue-100",
      isSelectable: false,
    },
    {
      id: "yt-1",
      type: "avatar",
      image: "/youtube-channel-dashboard-dark.jpg",
      name: "YouTube",
      username: "@mychannel_yt",
      isSelectable: true,
    },
  ],
  [
    {
      id: "li-1",
      type: "icon",
      icon: "in",
      name: "LinkedIn",
      username: "LinkedIn",
      bgColor: "bg-white",
      isSelectable: false,
    },
    {
      id: "li-2",
      type: "avatar",
      image: "/abstract-neural-network-blue-dots.jpg",
      name: "Company Page",
      username: "@company_linkedin",
      isSelectable: true,
    },
  ],
  [
    {
      id: "mu-1",
      type: "icon",
      icon: "music",
      name: "Music",
      username: "Music",
      bgColor: "bg-white",
      isSelectable: false,
    },
    {
      id: "tt-1",
      type: "tiktok",
      name: "TikTok",
      username: "@mytiktok_account",
      bgColor: "bg-white",
      isSelectable: true,
    },
  ],
];

interface CreateScheduleProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function CreateSchedule({
  selectedDate,
  onDateChange,
}: CreateScheduleProps) {
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [contentType, setContentType] = useState<"post" | "story" | "reel">(
    "post"
  );
  const [caption, setCaption] = useState("");
  const [selectedTime, setSelectedTime] = useState("12:00");
  const [showAIPopup, setShowAIPopup] = useState(false);
  const [aiCaption, setAICaption] = useState("");
  const [selectedTone, setSelectedTone] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<
    { id: string; url: string; type: string }[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleAccount = (accountId: string, isSelectable: boolean) => {
    if (!isSelectable) return;
    setSelectedAccounts((prev) => {
      const isSelected = prev.includes(accountId);
      return isSelected
        ? prev.filter((id) => id !== accountId)
        : [...prev, accountId];
    });
  };

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      onDateChange(newDate);
    }
  };

  const renderAccountContent = (account: {
    id: string;
    type: string;
    icon?: string;
    image?: string;
    name: string;
  }) => {
    if (account.type === "avatar") {
      return (
        <img
          src={account.image || "/placeholder.svg"}
          alt={account.name}
          className="w-6 h-6 rounded-full object-cover"
        />
      );
    }

    if (account.type === "tiktok") {
      return (
        <svg viewBox="0 0 24 24" className="w-4 h-4">
          <path
            d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"
            fill="url(#tiktok-gradient)"
          />
          <defs>
            <linearGradient
              id="tiktok-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#25F4EE" />
              <stop offset="50%" stopColor="#FE2C55" />
              <stop offset="100%" stopColor="#000000" />
            </linearGradient>
          </defs>
        </svg>
      );
    }

    if (account.icon === "music") {
      return <Music className="w-3.5 h-3.5 text-gray-700" />;
    }

    return (
      <span
        className={cn(
          "text-xs font-semibold",
          account.icon === "f" && "text-blue-600",
          account.icon === "X" && "text-black",
          account.icon === "in" && "text-blue-700",
          account.icon === "θ" && "text-blue-500"
        )}
      >
        {account.icon}
      </span>
    );
  };

  const getCardRounding = (index: number, groupLength: number) => {
    if (groupLength === 1) return "rounded-lg";
    if (index === 0) return "rounded-l-lg rounded-r-none";
    if (index === groupLength - 1) return "rounded-r-lg rounded-l-none";
    return "rounded-none";
  };

  const toneOptions = [
    { id: "custom", label: "Custom", icon: "✏️" },
    { id: "rephrase", label: "Rephrase", icon: "🔄" },
    { id: "genz", label: "Gen Z", icon: "🔥" },
    { id: "professional", label: "Professional", icon: "💼" },
    { id: "casual", label: "Casual", icon: "😊" },
    { id: "witty", label: "Witty", icon: "😄" },
    { id: "formal", label: "Formal", icon: "📝" },
    { id: "engaging", label: "Engaging", icon: "✨" },
  ];

  const handleOpenAIPopup = () => {
    setAICaption(caption);
    setSelectedTone(null);
    setCustomPrompt("");
    setShowAIPopup(true);
  };

  const handleToneSelect = (toneId: string) => {
    setSelectedTone(toneId);
    if (toneId !== "custom") {
      setIsGenerating(true);
      setTimeout(() => {
        const toneExamples: Record<string, string> = {
          rephrase: aiCaption
            ? `Here's a fresh take: ${aiCaption}`
            : "Enter your caption to rephrase it!",
          genz: aiCaption
            ? `no cap this is literally ${aiCaption} and it's giving ✨ main character energy ✨ fr fr`
            : "drop your caption bestie 💅",
          professional: aiCaption
            ? `We are pleased to share: ${aiCaption}. #Industry #Excellence`
            : "Please provide your message for professional formatting.",
          casual: aiCaption
            ? `Hey! Just wanted to share ${aiCaption} 😊`
            : "What do you want to say? Keep it chill!",
          witty: aiCaption
            ? `Plot twist: ${aiCaption} (You didn't see that coming, did you?)`
            : "Give me something to work with!",
          formal: aiCaption
            ? `It is with great pleasure that we announce: ${aiCaption}`
            : "Kindly provide the content for formal presentation.",
          engaging: aiCaption
            ? `🚀 You won't believe this! ${aiCaption} 👇 Drop your thoughts below!`
            : "Share your message to make it engaging!",
        };
        setAICaption(toneExamples[toneId] || aiCaption);
        setIsGenerating(false);
      }, 800);
    }
  };

  const handleCustomGenerate = () => {
    if (!customPrompt.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      setAICaption(
        `[Custom: ${customPrompt}] ${
          aiCaption || "Your generated caption will appear here"
        }`
      );
      setIsGenerating(false);
    }, 800);
  };

  const handleDone = () => {
    setCaption(aiCaption);
    setShowAIPopup(false);
  };

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newMedia = Array.from(files).map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video") ? "video" : "image",
    }));

    setSelectedMedia((prev) => [...prev, ...newMedia]);
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeMedia = (id: string) => {
    setSelectedMedia((prev) => prev.filter((m) => m.id !== id));
  };

  const handleAddMediaClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="h-full flex flex-col pb-16 md:pb-0">
      <TooltipProvider>
        <div className="p-3 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-base">Create Schedule</h2>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          <div className="bg-muted/40 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-foreground">
                Select Accounts
              </h3>
              <span className="text-sm text-muted-foreground">
                {selectedAccounts.length} selected
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {accountGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="flex">
                  {group.map((account, index) => {
                    const isSelected = selectedAccounts.includes(account.id);
                    return (
                      <Tooltip key={account.id}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() =>
                              toggleAccount(account.id, account.isSelectable)
                            }
                            className={cn(
                              "w-8 h-8 sm:w-9 sm:h-9 border bg-card transition-all flex items-center justify-center",
                              getCardRounding(index, group.length),
                              account.isSelectable
                                ? "hover:bg-accent/50 cursor-pointer"
                                : "cursor-default",
                              isSelected && account.isSelectable
                                ? "border-primary bg-primary/10 z-10"
                                : "border-border",
                              index !== 0 && "-ml-px"
                            )}
                          >
                            {renderAccountContent(account)}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{account.username || account.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              ))}

              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border-2 border-dashed border-muted-foreground/40 bg-transparent hover:bg-accent/30 transition-colors flex items-center justify-center">
                    <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add new account</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="flex gap-1 sm:gap-1.5">
            <Button
              variant={contentType === "post" ? "default" : "outline"}
              size="sm"
              onClick={() => setContentType("post")}
              className="rounded-full h-6 sm:h-7 text-xs px-2.5 sm:px-3"
            >
              Post
            </Button>
            <Button
              variant={contentType === "story" ? "default" : "outline"}
              size="sm"
              onClick={() => setContentType("story")}
              className="rounded-full h-6 sm:h-7 text-xs px-2.5 sm:px-3"
            >
              Story
            </Button>
            <Button
              variant={contentType === "reel" ? "default" : "outline"}
              size="sm"
              onClick={() => setContentType("reel")}
              className="rounded-full h-6 sm:h-7 text-xs px-2.5 sm:px-3"
            >
              Reel
            </Button>
          </div>

          <div>
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={handleMediaSelect}
            />

            {/* Media preview grid */}
            {selectedMedia.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 mb-2">
                {selectedMedia.map((media) => (
                  <div
                    key={media.id}
                    className="relative aspect-square rounded-lg overflow-hidden group"
                  >
                    {media.type === "video" ? (
                      <video
                        src={media.url}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={media.url || "/placeholder.svg"}
                        alt="Selected media"
                        className="w-full h-full object-cover"
                      />
                    )}
                    {/* Remove button */}
                    <button
                      onClick={() => removeMedia(media.id)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/70 hover:bg-black/90 rounded-full flex items-center justify-center transition-colors"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add media button - now properly clickable */}
            <Card
              onClick={handleAddMediaClick}
              className="border-2 border-dashed border-border bg-muted/30 p-3 sm:p-4 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer active:bg-muted/60"
            >
              <ImagePlus className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground mb-1" />
              <p className="text-xs font-medium">Add media</p>
            </Card>
          </div>

          <div>
            <Label className="text-xs font-medium mb-1.5 block">
              Write your caption
            </Label>
            <Textarea
              placeholder="Write your caption..."
              className="min-h-16 sm:min-h-20 resize-none text-sm"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
            <div className="flex items-center justify-between mt-1.5">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={handleOpenAIPopup}
              >
                <Sparkles className="h-3 w-3 mr-1" />
                AI
              </Button>
              <span className="text-xs text-muted-foreground">
                {caption.length}
              </span>
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium mb-1.5 block">
              Schedule date & time
            </Label>
            <div className="space-y-1.5">
              <div className="relative">
                <CalendarIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="date"
                  value={formatDateForInput(selectedDate)}
                  onChange={handleDateChange}
                  className="pl-8 h-8 text-sm"
                />
              </div>
              <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-1.5 sm:gap-2">
                <div className="flex-1 relative">
                  <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="pl-8 h-8 text-sm"
                  />
                </div>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 h-8 text-sm w-full xs:w-auto">
                  Schedule
                </Button>
              </div>
            </div>
          </div>
        </div>

        {showAIPopup && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center sm:p-4">
            <div className="bg-background w-full h-full sm:h-auto sm:max-h-[90vh] sm:rounded-xl sm:max-w-lg overflow-hidden flex flex-col shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <h3 className="font-semibold text-sm sm:text-base">
                    AI Caption Assistant
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 sm:h-8 sm:w-8"
                  onClick={() => setShowAIPopup(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
                {/* Caption Input */}
                <div>
                  <Label className="text-xs font-medium mb-1.5 block">
                    Your Caption
                  </Label>
                  <Textarea
                    placeholder="Enter or edit your caption here..."
                    className="min-h-20 sm:min-h-24 resize-none text-sm"
                    value={aiCaption}
                    onChange={(e) => setAICaption(e.target.value)}
                  />
                  <span className="text-xs text-muted-foreground mt-1 block text-right">
                    {aiCaption.length} characters
                  </span>
                </div>

                {/* Tone Options */}
                <div>
                  <Label className="text-xs font-medium mb-2 block">
                    Choose a tone
                  </Label>
                  <div className="overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
                    <div className="flex sm:grid sm:grid-cols-4 gap-1.5 sm:gap-2 min-w-max sm:min-w-0">
                      {toneOptions.map((tone) => (
                        <button
                          key={tone.id}
                          onClick={() => handleToneSelect(tone.id)}
                          disabled={isGenerating}
                          className={cn(
                            "flex items-center justify-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg border text-[10px] sm:text-xs font-medium transition-all whitespace-nowrap",
                            selectedTone === tone.id
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-card hover:bg-accent/50",
                            isGenerating && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <span className="text-xs sm:text-sm">
                            {tone.icon}
                          </span>
                          <span>{tone.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Custom Prompt Input - shows when Custom is selected */}
                {selectedTone === "custom" && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Label className="text-xs font-medium mb-1.5 block">
                      Custom prompt
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g., Make it sound like a pirate..."
                        className="flex-1 h-8 sm:h-9 text-sm"
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                      />
                      <Button
                        size="sm"
                        className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm"
                        onClick={handleCustomGenerate}
                        disabled={isGenerating || !customPrompt.trim()}
                      >
                        {isGenerating ? "..." : "Generate"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Loading indicator */}
                {isGenerating && (
                  <div className="flex items-center justify-center py-2">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <div className="h-3.5 w-3.5 sm:h-4 sm:w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span>Generating...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 sm:p-4 border-t border-border flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs sm:text-sm bg-transparent"
                  onClick={() => setShowAIPopup(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-8 text-xs sm:text-sm"
                  onClick={handleDone}
                  disabled={!aiCaption.trim()}
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}
      </TooltipProvider>
    </div>
  );
}
