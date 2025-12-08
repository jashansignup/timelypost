"use client";

import { useState } from "react";
import { CreateSchedule } from "@/components/create-schedule";
import { ScheduleCalendar } from "@/components/schedule-calendar";

export default function ClientSide() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activePanel, setActivePanel] = useState<"create" | "calendar">(
    "create"
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      {/* Mobile tab switcher */}
      <div className="md:hidden flex border-b border-border bg-card">
        <button
          onClick={() => setActivePanel("create")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activePanel === "create"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground"
          }`}
        >
          Create Post
        </button>
        <button
          onClick={() => setActivePanel("calendar")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activePanel === "calendar"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground"
          }`}
        >
          Calendar
        </button>
      </div>

      <div className="flex flex-col md:flex-row w-full h-[calc(100vh)] overflow-hidden">
        <div
          className={`w-full md:w-1/2 lg:w-1/3 xl:max-w-md border-r border-border bg-card overflow-y-auto ${
            activePanel === "create"
              ? "flex flex-col"
              : "hidden md:flex md:flex-col"
          }`}
        >
          <div className="sticky top-0 bg-card z-10">
            <CreateSchedule
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
          </div>
        </div>

        <div
          className={`flex-1 overflow-auto ${
            activePanel === "calendar"
              ? "flex flex-col"
              : "hidden md:flex md:flex-col"
          }`}
        >
          <ScheduleCalendar
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </div>
      </div>
    </div>
  );
}
