"use client";
import { SidebarProvider } from "@/components/ui/sidebar";
import React from "react";
import DashboardSidebar from "@/components/dashboard-sidebar";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <SidebarProvider>
        <DashboardSidebar />
        <div className="grid w-full md:my-12 md:pt-0 pt-18">{children}</div>
      </SidebarProvider>
    </div>
  );
};

export default layout;
