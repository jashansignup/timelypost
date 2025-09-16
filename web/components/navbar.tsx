import React from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

const Navbar = () => {
  const links = [
    {
      href: "/",
      label: "Home",
    },
  ];

  return (
    <div>
      <div className="container py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <h1 className="text-base font-bold">TimelyPost</h1>
          <div>
            <NavigationMenu>
              <NavigationMenuList>
                {links.map((link) => (
                  <NavigationMenuItem key={link.href}>
                    <NavigationMenuLink asChild>
                      <Link href={link.href}>{link.label}</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            className={buttonVariants({ variant: "default" })}
            href={"/auth"}
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
