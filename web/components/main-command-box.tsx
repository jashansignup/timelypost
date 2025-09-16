"use client";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  LucideIcon,
  PlusCircle,
  ImageIcon,
  Code,
  Calendar,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const navigationLinks: {
  label: string;
  href: string;
  icon: LucideIcon;
}[] = [
  { label: "Create Post", href: "/dashboard", icon: PlusCircle },
  { label: "Accounts", href: "/dashboard/accounts", icon: Users },
  { label: "Media", href: "/dashboard/media", icon: ImageIcon },
  { label: "API", href: "/dashboard/api", icon: Code },
  { label: "Scheduled Posts", href: "/dashboard/scheduled", icon: Calendar },
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
              <link.icon />
              {link.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};

export default MainCommandBox;
