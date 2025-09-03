"use client";
import React from "react";

import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import { Badge } from "@repo/ui/components/badge";
import {
  Plus,
  Trash2,
  Instagram,
  X,
  LucideIcon,
  RefreshCcw,
} from "lucide-react";
import { socialAccounts } from "@/lib/social-accounts";
import {
  connectAccount,
  deleteAccount,
  updateAccount,
} from "@/app/actions/social-accounts";
import { SocialAccount, SocialAccountType } from "@repo/database";
import { toast } from "sonner";

const socialAccountIcons = (icon: SocialAccount): LucideIcon => {
  switch (icon.type) {
    case "X":
      return X;
    case "INSTAGRAM":
      return Instagram;
    default:
      return Plus;
  }
};

const ClientView = ({ accounts }: { accounts: SocialAccount[] }) => {
  const [linkedAccounts, setLinkedAccounts] = useState(accounts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleConnectAccount = (type: SocialAccountType) => {
    connectAccount(type);
    setIsDialogOpen(false);
  };

  const handleRemoveAccount = async (accountId: string) => {
    const toastId = toast.loading("Removing account...");
    await deleteAccount(accountId);
    toast.success("Account removed successfully", { id: toastId });
  };

  const handleUpdateAccount = async (accountId: string) => {
    const toastId = toast.loading("Updating account...");
    await updateAccount(accountId);
    toast.success("Account updated successfully", { id: toastId });
  };
  return (
    <div className="container ">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Accounts</h1>
        <p className="text-gray-600">
          Manage your connected social media accounts
        </p>
      </div>

      {/* Add Account Section */}
      <Card className="mb-8 shadow-none ">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Add New Account
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Connect Account
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Connect Social Media Account</DialogTitle>
                  <DialogDescription>
                    Choose a platform to connect to your TimelyPost account
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  {socialAccounts.map((platform) => {
                    const Icon = platform.icon;
                    return (
                      <Button
                        key={platform.name}
                        variant="outline"
                        className="w-full justify-start h-auto p-4 bg-transparent"
                        onClick={() => handleConnectAccount(platform.type)}
                      >
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium">{platform.name}</div>
                          <div className="text-sm text-gray-500">
                            {platform.enabled ? "Connected" : "Not Connected"}
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
          <CardDescription>
            Connect your social media accounts to start scheduling posts
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Linked Accounts Section */}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Linked Accounts ({linkedAccounts.length})</CardTitle>
          <CardDescription>
            Your connected social media accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {linkedAccounts.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No accounts connected
              </h3>
              <p className="text-gray-500 mb-4">
                Connect your first social media account to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.map((account) => {
                const Icon = socialAccountIcons(account);
                return (
                  <div
                    key={account.id}
                    className="flex items-center h-full justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                        <Icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-foreground flex items-center gap-2">
                            {account.type}
                            <button
                              onClick={() => handleUpdateAccount(account.id)}
                            >
                              <RefreshCcw className="w-4 h-4" />
                            </button>
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {account.username}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveAccount(account.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientView;
