"use client";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const daysOfWeekShort = ["S", "M", "T", "W", "T", "F", "S"];

const scheduledPosts = [
  {
    date: 6,
    thumbnail: "/lush-forest-stream.png",
    posts: [
      {
        id: 1,
        time: "09:00",
        platform: "instagram",
        account: "Travel Blogger",
        caption: "Exploring the beautiful forest trails this morning!",
        type: "post",
      },
      {
        id: 2,
        time: "14:30",
        platform: "facebook",
        account: "Nature Page",
        caption: "Check out these amazing views from our latest hike.",
        type: "post",
      },
    ],
  },
  {
    date: 8,
    thumbnail: "/vibrant-cityscape.png",
    posts: [
      {
        id: 3,
        time: "10:00",
        platform: "x",
        account: "@citylights",
        caption: "City never sleeps. Neither do we.",
        type: "post",
      },
      {
        id: 4,
        time: "12:00",
        platform: "linkedin",
        account: "Urban Design Co",
        caption: "Our latest urban photography project is live!",
        type: "post",
      },
      {
        id: 5,
        time: "18:00",
        platform: "instagram",
        account: "Travel Blogger",
        caption: "Golden hour in the city",
        type: "reel",
      },
    ],
  },
  {
    date: 12,
    thumbnail: "/diverse-food-spread.png",
    posts: [
      {
        id: 6,
        time: "11:30",
        platform: "instagram",
        account: "Food Blog",
        caption: "Brunch goals! Tag someone who needs this.",
        type: "story",
      },
    ],
  },
  {
    date: 15,
    thumbnail: "/diverse-travelers-world-map.png",
    posts: [
      {
        id: 7,
        time: "08:00",
        platform: "facebook",
        account: "World Travelers",
        caption: "Planning our next adventure. Where should we go?",
        type: "post",
      },
      {
        id: 8,
        time: "16:00",
        platform: "tiktok",
        account: "@wanderlust",
        caption: "Top 5 hidden gems in Europe",
        type: "post",
      },
    ],
  },
  {
    date: 19,
    thumbnail: "/interconnected-tech.png",
    posts: [
      {
        id: 9,
        time: "09:30",
        platform: "linkedin",
        account: "Tech Insights",
        caption: "The future of AI is here. Read our latest analysis.",
        type: "post",
      },
      {
        id: 10,
        time: "13:00",
        platform: "x",
        account: "@techtrends",
        caption: "Breaking: New developments in quantum computing",
        type: "post",
      },
      {
        id: 11,
        time: "17:30",
        platform: "instagram",
        account: "Tech Blog",
        caption: "Behind the scenes at our lab",
        type: "story",
      },
      {
        id: 12,
        time: "20:00",
        platform: "facebook",
        account: "Tech Community",
        caption: "Join our webinar tomorrow!",
        type: "post",
      },
    ],
  },
  {
    date: 25,
    thumbnail: "/abstract-fluid-art.png",
    posts: [
      {
        id: 13,
        time: "10:00",
        platform: "instagram",
        account: "Art Gallery",
        caption: "New collection dropping soon",
        type: "reel",
      },
    ],
  },
];

const platformConfig: Record<
  string,
  { icon: string; color: string; bg: string }
> = {
  facebook: { icon: "f", color: "text-blue-600", bg: "bg-blue-100" },
  instagram: { icon: "📷", color: "text-pink-600", bg: "bg-pink-100" },
  x: { icon: "𝕏", color: "text-foreground", bg: "bg-gray-100" },
  linkedin: { icon: "in", color: "text-blue-700", bg: "bg-blue-100" },
  tiktok: { icon: "♪", color: "text-foreground", bg: "bg-gray-100" },
};

interface ScheduleCalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function ScheduleCalendar({
  selectedDate,
  onDateChange,
}: ScheduleCalendarProps) {
  const currentMonth = selectedDate.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
  const selectedDay = selectedDate.getDate();

  const handlePreviousMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onDateChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onDateChange(newDate);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const handleDayClick = (day: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(day);
    onDateChange(newDate);
  };

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const selectedDayPosts =
    scheduledPosts.find((p) => p.date === selectedDay)?.posts || [];
  const formattedSelectedDate = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="h-full flex flex-col pb-16 md:pb-0">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold text-sm sm:text-base">Your Schedule</h2>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-4">
        <div className="mb-3 sm:mb-4 flex items-center justify-between">
          <div className="flex items-center gap-0.5 sm:gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 sm:h-7 sm:w-7"
              onClick={handlePreviousMonth}
            >
              <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
            <span className="font-semibold text-xs sm:text-sm min-w-[80px] text-center">
              {currentMonth}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 sm:h-7 sm:w-7"
              onClick={handleNextMonth}
            >
              <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-6 sm:h-7 text-xs bg-transparent px-2 sm:px-3"
            onClick={handleToday}
          >
            Today
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
          {daysOfWeek.map((day, i) => (
            <div
              key={day}
              className="text-center text-[10px] sm:text-xs font-medium text-muted-foreground py-0.5 sm:py-1"
            >
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{daysOfWeekShort[i]}</span>
            </div>
          ))}

          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {daysArray.map((day) => {
            const post = scheduledPosts.find((p) => p.date === day);
            const isSelected = day === selectedDay;
            const isToday =
              new Date().toDateString() ===
              new Date(year, month, day).toDateString();

            return (
              <div
                key={day}
                onClick={() => handleDayClick(day)}
                className={cn(
                  "aspect-square border border-border rounded sm:rounded-md p-0.5 sm:p-1 relative bg-card hover:bg-muted/50 transition-colors cursor-pointer",
                  isSelected && "ring-1 sm:ring-2 ring-primary"
                )}
              >
                <span
                  className={cn(
                    "text-[10px] sm:text-xs font-medium",
                    isToday && "font-bold"
                  )}
                >
                  {day}
                </span>

                {post && (
                  <div className="absolute bottom-0.5 left-0.5 sm:bottom-1 sm:left-1">
                    <img
                      src={post.thumbnail || "/placeholder.svg"}
                      alt="Post thumbnail"
                      className="h-3 w-3 sm:h-5 sm:w-5 rounded object-cover"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-3 sm:mt-4 border-t border-border pt-3 sm:pt-4">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h3 className="font-semibold text-xs sm:text-sm">
              <span className="hidden sm:inline">{formattedSelectedDate}</span>
              <span className="sm:hidden">
                {selectedDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </h3>
            <span className="text-[10px] sm:text-xs text-muted-foreground">
              {selectedDayPosts.length}{" "}
              {selectedDayPosts.length === 1 ? "post" : "posts"}
            </span>
          </div>

          {selectedDayPosts.length > 0 ? (
            <div className="space-y-1.5 sm:space-y-2">
              {selectedDayPosts
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((post, index) => {
                  const platform = platformConfig[post.platform];
                  return (
                    <div key={post.id} className="relative flex gap-2 sm:gap-3">
                      {/* Timeline line */}
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            "w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-semibold shrink-0",
                            platform?.bg || "bg-gray-100",
                            platform?.color || "text-foreground"
                          )}
                        >
                          {platform?.icon || "?"}
                        </div>
                        {index < selectedDayPosts.length - 1 && (
                          <div className="w-0.5 flex-1 bg-border mt-1" />
                        )}
                      </div>

                      {/* Post content */}
                      <div className="flex-1 pb-2 sm:pb-3 min-w-0">
                        <div className="bg-muted/50 rounded-lg p-2 sm:p-2.5 border border-border">
                          <div className="flex items-center justify-between mb-1 gap-1">
                            <div className="flex items-center gap-1 sm:gap-2 flex-wrap min-w-0">
                              <span className="text-[10px] sm:text-xs font-semibold text-foreground">
                                {post.time}
                              </span>
                              <span className="text-[10px] sm:text-xs text-muted-foreground hidden xs:inline">
                                •
                              </span>
                              <span className="text-[10px] sm:text-xs font-medium text-muted-foreground capitalize hidden xs:inline">
                                {post.platform}
                              </span>
                              <span className="text-[8px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 bg-primary/10 text-primary rounded capitalize">
                                {post.type}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 sm:h-5 sm:w-5 shrink-0"
                            >
                              <svg
                                className="h-2.5 w-2.5 sm:h-3 sm:w-3"
                                viewBox="0 0 16 16"
                                fill="currentColor"
                              >
                                <circle cx="8" cy="3" r="1.5" />
                                <circle cx="8" cy="8" r="1.5" />
                                <circle cx="8" cy="13" r="1.5" />
                              </svg>
                            </Button>
                          </div>
                          <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1 truncate">
                            @{post.account}
                          </p>
                          <p className="text-[10px] sm:text-xs text-foreground line-clamp-2">
                            {post.caption}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-4 sm:py-6 bg-muted/30 rounded-lg border border-dashed border-border">
              <p className="text-xs sm:text-sm text-muted-foreground">
                No posts scheduled
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                Create a new post to get started
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
