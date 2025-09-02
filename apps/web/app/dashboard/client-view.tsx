"use client";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { Card } from "@repo/ui/components/card";
import React, { useState } from "react";
import { Button } from "@repo/ui/components/button";
import { Image, Instagram, Plus, Twitter, X } from "lucide-react";

import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "@repo/ui/components/calendar";
import { Input } from "@repo/ui/components/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import { Media, SocialAccount, SocialAccountType } from "@repo/database";
import { cn } from "@repo/ui/lib/utils";
import SelectMediaDialog from "@/components/dialogs/select-media-dialog";
import { createPost } from "../actions/create-post";
import { toast } from "sonner";
import { createPostSchema } from "@/zod-schemas/create-post-schema";

const getIcon = (type: SocialAccountType) => {
  switch (type) {
    case "X":
      return <Twitter />;
    case "INSTAGRAM":
      return <Instagram />;
    default:
      return <Plus />;
  }
};

const ClientView = ({ accounts }: { accounts: SocialAccount[] }) => {
  const [selectedAccounts, setSelectedAccounts] = useState<SocialAccount[]>([]);
  const [open, setOpen] = React.useState(false);
  // helpers to compute defaults
  const getTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(0, 0, 0, 0);
    return d;
  };
  const getNext5MinString = () => {
    const n = new Date();
    n.setMinutes(n.getMinutes() + 5);
    const hh = String(n.getHours()).padStart(2, "0");
    const mm = String(n.getMinutes()).padStart(2, "0");
    const ss = String(n.getSeconds()).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  };
  const [date, setDate] = React.useState<Date | undefined>(() => getTomorrow());
  const [time, setTime] = React.useState<string>(() => getNext5MinString());
  const [text, setText] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<Media[]>([]);
  const [errors, setErrors] = useState<{
    text?: string;
    accountIds?: string;
    scheduledAt?: string;
  }>({});

  const buildScheduledAt = (isScheduled: boolean) => {
    if (!isScheduled) return new Date(new Date().getTime() + 120 * 1000);
    if (!date) return undefined as unknown as Date; // will trigger zod required error
    // combine date and time (HH:MM or HH:MM:SS)
    const [hh = "00", mm = "00", ss = "00"] = time.split(":");
    const combined = new Date(date);
    combined.setHours(Number(hh), Number(mm), Number(ss || 0), 0);
    return combined;
  };

  const handleSubmit = async (isScheduled: boolean) => {
    // Client-side validation using zod
    const candidate = {
      text,
      mediaIds: selectedMedia.map((m) => m.id),
      accountIds: selectedAccounts.map((a) => a.id),
      scheduledAt: buildScheduledAt(isScheduled),
      isScheduled,
    };

    const parsed = createPostSchema.safeParse(candidate);
    if (!parsed.success) {
      const fieldErrors: {
        text?: string;
        accountIds?: string;
        scheduledAt?: string;
      } = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path[0] as
          | "text"
          | "accountIds"
          | "scheduledAt"
          | undefined;
        if (path && !fieldErrors[path]) fieldErrors[path] = issue.message;
      }
      // Friendly message for missing date when scheduling
      if (isScheduled && !date && !fieldErrors.scheduledAt) {
        fieldErrors.scheduledAt = "Please select a date and time";
      }
      setErrors(fieldErrors);
      return; // do not submit to server
    }

    setErrors({});
    const toastId = toast.loading("Creating post...");
    const res = await createPost(parsed.data);
    if (!res.ok) {
      toast.error(res.error, { description: res.description, id: toastId });
      return;
    } else {
      setSelectedAccounts([]);
      setSelectedMedia([]);
      setText("");
      toast.success("Post created successfully", { id: toastId });
    }
  };
  return (
    <div className="container ">
      <h1 className="text-2xl font-bold">Create Post</h1>
      <div className="mt-6 md:w-[48rem] ">
        <div className="mb-1 flex items-center gap-2">
          {accounts.map((account) => (
            <button
              key={account.id}
              className={cn(
                ` flex-col gap-2 flex items-center justify-center p-2 rounded-md border-2 bg-muted hover:bg-accent hover:text-accent-foreground transition-colors duration-200 ${selectedAccounts.includes(account) ? "border-primary text-primary" : ""}`
              )}
              onClick={() => {
                setSelectedAccounts((prev) => {
                  if (prev.includes(account)) {
                    return prev.filter((a) => a.id !== account.id);
                  } else {
                    return [...prev, account];
                  }
                });
                if (errors.accountIds)
                  setErrors((e) => ({ ...e, accountIds: undefined }));
              }}
            >
              {getIcon(account.type)}
              <span className="text-xs">@{account.username}</span>
            </button>
          ))}
        </div>
        {errors.accountIds && (
          <p className="text-red-500 text-sm mb-2">{errors.accountIds}</p>
        )}
        {selectedMedia.length > 0 && (
          <div className="flex gap-2 flex-wrap my-3">
            {selectedMedia.map((media) => (
              <div key={media.id} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={media.url}
                  alt="selected"
                  className="w-24 h-24 object-contain rounded border"
                />
                <button
                  className="absolute top-[-10px] right-[-10px] bg-red-500 text-white p-1 rounded-full"
                  onClick={() =>
                    setSelectedMedia((prev) =>
                      prev.filter((m) => m.id !== media.id)
                    )
                  }
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="h-[130px] relative">
          <ReactQuill
            theme="snow"
            style={{ height: "100px" }}
            className="max-w-full md:w-[48rem]"
            modules={{ toolbar: [["bold", "italic", "underline"]] }}
            onChange={(value) => {
              setText(value);
              if (errors.text) setErrors((e) => ({ ...e, text: undefined }));
            }}
            value={text}
          />
        </div>
        {errors.text && (
          <p className="text-red-500 text-sm mt-1">{errors.text}</p>
        )}

        <div className="mt-6 flex md:flex-row flex-col justify-between gap-4">
          <SelectMediaDialog
            onSelectMedia={(media: Media[]) =>
              setSelectedMedia((prev) =>
                Array.from(new Set([...prev, ...media]))
              )
            }
            trigger={
              <Button variant="outline">
                <Image className="mr-2 h-4 w-4" /> Add Media
              </Button>
            }
          />
          <div className="flex gap-4 flex-wrap">
            <div className="flex flex-col gap-3">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="date-picker"
                    className="w-32 justify-between font-normal"
                  >
                    {date ? date.toLocaleDateString() : "Select date"}
                    <ChevronDownIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={date}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                      setDate(date);
                      if (errors.scheduledAt)
                        setErrors((e) => ({ ...e, scheduledAt: undefined }));
                      setOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex flex-col gap-3">
              <Input
                type="time"
                id="time-picker"
                step="1"
                value={time}
                onChange={(e) => {
                  setTime(e.target.value);
                  if (errors.scheduledAt)
                    setErrors((er) => ({ ...er, scheduledAt: undefined }));
                }}
                className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
              />
            </div>
            {errors.scheduledAt && (
              <p className="text-red-500 text-sm self-center">
                {errors.scheduledAt}
              </p>
            )}

            <Button onClick={() => handleSubmit(true)}>Schedule</Button>
            <Button variant={"outline"} onClick={() => handleSubmit(false)}>
              Post Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientView;
