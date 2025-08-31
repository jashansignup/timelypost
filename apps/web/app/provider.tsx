"use client";
import MainCommandBox from "@/components/main-command-box";
import { SessionProvider } from "next-auth/react";
import React from "react";

const Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <MainCommandBox />
      {children}
    </SessionProvider>
  );
};

export default Provider;
