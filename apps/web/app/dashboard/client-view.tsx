"use client";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { Card } from "@repo/ui/components/card";
import React, { useState } from "react";
import { Button } from "@repo/ui/components/button";
import { Image, Instagram, Plus, Twitter } from "lucide-react";

import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "@repo/ui/components/calendar";
import { Input } from "@repo/ui/components/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import { SocialAccount, SocialAccountType } from "@repo/database";
import { cn } from "@repo/ui/lib/utils";

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
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  return (
    <div className="container ">
      <h1 className="text-2xl font-bold">Create Post</h1>
      <div className="mt-6 md:w-[48rem] ">
        <div className="mb-3 flex items-center gap-2">
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
              }}
            >
              {getIcon(account.type)}
              <span className="text-xs">@{account.username}</span>
            </button>
          ))}
        </div>
        <div className="h-[130px] relative">
          <ReactQuill
            theme="snow"
            style={{ height: "100px" }}
            className="max-w-full md:w-[48rem]"
            modules={{ toolbar: [["bold", "italic", "underline"]] }}
          />
        </div>

        <div className="mt-6 flex md:flex-row flex-col justify-between gap-4">
          <Button variant={"outline"}>
            <Image className="mr-2 h-4 w-4" /> Add Media
          </Button>
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
                defaultValue="10:30:00"
                className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
              />
            </div>

            <Button>Schedule</Button>
            <Button variant={"outline"}>Post Now</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientView;
