import Navbar from "@/components/navbar";
import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <header>
        <Navbar />
      </header>
      <main className="flex-1 grid">{children}</main>
      <footer className="text-center"></footer>
    </div>
  );
};

export default layout;
