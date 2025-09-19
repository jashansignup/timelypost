"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

type ApiKeyCreatedDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey?: string;
  apiSecret?: string;
};

const ApiKeyCreatedDialog: React.FC<ApiKeyCreatedDialogProps> = ({
  open,
  onOpenChange,
  apiKey,
  apiSecret,
}) => {
  const copy = (text: string | undefined, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast("Copied!", { description: `${label} copied to clipboard` });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>API Credentials Created</DialogTitle>
          <DialogDescription>
            Copy your API credentials now. You will not be able to view the secret again. Only the ID will be available later.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-sm">API Key (ID)</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input value={apiKey ?? ""} readOnly className="font-mono text-sm bg-gray-50" />
              <Button variant="outline" size="sm" onClick={() => copy(apiKey, "API Key")}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div>
            <Label className="text-sm">API Secret</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input value={apiSecret ?? ""} readOnly className="font-mono text-sm bg-gray-50" />
              <Button variant="outline" size="sm" onClick={() => copy(apiSecret, "API Secret")}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
            <TriangleAlert className="w-4 h-4 text-yellow-700 mt-0.5" />
            <p className="text-sm text-yellow-800">
              Keep your API secret secure. This is the only time you can view it in full. Store it in a safe place such as a secret manager.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            I have copied them
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyCreatedDialog;
