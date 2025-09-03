import { SocialAccountType } from "@repo/database";
import {
  Facebook,
  Instagram,
  Linkedin,
  LucideIcon,
  Twitter,
  Youtube,
} from "lucide-react";

export const allSocialAccounts: {
  name: string;
  icon: LucideIcon;
  type: SocialAccountType;
  enabled: boolean;
}[] = [
  {
    name: "X",
    icon: Twitter,
    type: "X",
    enabled: process.env.NEXT_PUBLIC_X_ENABLED === "true",
  },
  // {
  //   name: "Facebook",
  //   icon: Facebook,
  //   enabled: process.env.NEXT_PUBLIC_FACEBOOK_ENABLED === "true",
  // },
  // {
  //   name: "Instagram",
  //   icon: Instagram,
  //   enabled: process.env.NEXT_PUBLIC_INSTAGRAM_ENABLED === "true",
  // },
  {
    name: "LinkedIn",
    icon: Linkedin,
    type: "LINKEDIN",
    enabled: process.env.NEXT_PUBLIC_LINKEDIN_ENABLED === "true",
  },
  // {
  //   name: "YouTube",
  //   icon: Youtube,
  //   enabled: process.env.NEXT_PUBLIC_YOUTUBE_ENABLED === "true",
  // },
] as const;

export const socialAccounts = allSocialAccounts.filter((account) => {
  return account.enabled;
});
