"use client";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@repo/ui/components/command";
import { Bell, Bookmark, Clock, LucideIcon, User } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const navigationLinks = [
  { label: "Create Post", href: "/dashboard" },
  { label: "Accounts", href: "/dashboard/accounts" },
  { label: "Media", href: "/dashboard/media" },
  { label: "API", href: "/dashboard/api" },
  { label: "Scheduled Posts", href: "/dashboard/scheduled" },
];

const MainCommandBox = () => {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);
  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          {navigationLinks.map((link) => (
            <CommandItem
              key={link.href}
              onSelect={() => {
                router.push(link.href);
                setOpen(false);
              }}
            >
              {link.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};

export default MainCommandBox;
