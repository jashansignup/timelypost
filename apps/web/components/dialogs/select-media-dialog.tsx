"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import { Card, CardContent } from "@repo/ui/components/card";
import { Check, ImageIcon, Play } from "lucide-react";
import { listMyMedia } from "@/app/actions/media";
import type { Media } from "@repo/database";

type SelectMediaDialogProps = {
  onSelectUrls: (urls: string[]) => void;
  trigger?: React.ReactNode;
  multiple?: boolean;
};

const SelectMediaDialog: React.FC<SelectMediaDialogProps> = ({
  onSelectUrls,
  trigger,
  multiple = true,
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [media, setMedia] = useState<Media[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) return;
    let active = true;
    (async () => {
      setLoading(true);
      const res = await listMyMedia();
      if (!active) return;
      if (res.ok && res.data) setMedia(res.data);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [open]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        if (!multiple) next.clear();
        next.add(id);
      }
      return next;
    });
  };

  const confirm = () => {
    const urls = media.filter((m) => selectedIds.has(m.id)).map((m) => m.url);
    onSelectUrls(urls);
    setOpen(false);
    setSelectedIds(new Set());
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline">Add Media</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Select Media</DialogTitle>
        </DialogHeader>
        <div className="min-h-[240px]">
          {loading ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : media.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No media found. Upload media in Media Library.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {media.map((m) => {
                const isSelected = selectedIds.has(m.id);
                return (
                  <Card
                    key={m.id}
                    onClick={() => toggleSelect(m.id)}
                    className={`relative cursor-pointer overflow-hidden ${
                      isSelected ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <CardContent className="p-0">
                      <div className="relative">
                        <img
                          src={m.url}
                          alt={m.name}
                          className="w-full h-28 object-contain bg-muted"
                        />
                        <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded-md flex items-center text-[10px]">
                          {m.type === "VIDEO" ? (
                            <>
                              <Play className="w-3 h-3 mr-1" /> Video
                            </>
                          ) : (
                            <>
                              <ImageIcon className="w-3 h-3 mr-1" /> Image
                            </>
                          )}
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="px-2 py-1 text-xs truncate" title={m.name}>
                        {m.name}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={confirm}
            disabled={selectedIds.size === 0}
            className="w-full sm:w-auto"
          >
            Add Selected
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SelectMediaDialog;
