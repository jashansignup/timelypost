"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, Plus, Trash2, Key } from "lucide-react";
import { toast } from "sonner";
import { createApiKey } from "@/app/actions/apikey/create";
import ApiKeyCreatedDialog from "@/components/dialogs/api-key-created-dialog";

type ApiKeyClient = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  userId: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
};

const ClientView = ({ apiKeys }: { apiKeys: ApiKeyClient[] }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newApiName, setNewApiName] = useState("");
  const [showCreatedDialog, setShowCreatedDialog] = useState(false);
  const [createdCreds, setCreatedCreds] = useState<{
    key: string;
    secret: string;
  } | null>(null);

  const handleCreateApi = async () => {
    const toastId = toast.loading("Creating API Key...");

    if (!newApiName.trim()) {
      toast("Error", {
        description: "Please enter a name for your API key",
        id: toastId,
      });
      toast.dismiss(toastId);
      return;
    }
    const res = await createApiKey({ name: newApiName });
    if (!res.ok) {
      toast("Error", {
        description: res.error,
        id: toastId,
      });
      toast.dismiss(toastId);
      return;
    }
    setNewApiName("");
    setIsCreating(false);
    if (res.data) {
      setCreatedCreds({ key: res.data.key, secret: res.data.secret });
      setShowCreatedDialog(true);
    }
    toast.dismiss(toastId);
  };

  const handleDeleteApi = (id: string) => {
    toast("Coming Soon", {
      description: "This feature is under construction",
    });
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast("Copied!", {
      description: `${type} copied to clipboard`,
    });
  };

  // No secret visibility toggling; secrets are never shown in the list

  return (
    <div className="container  space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Keys</h1>
          <p className="text-gray-600 mt-1">
            Manage your API keys to integrate TimelyPost with your applications
          </p>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create API Key
        </Button>
      </div>

      {/* Create New API Key Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Create New API Key
            </CardTitle>
            <CardDescription>
              Generate a new API key and secret for your application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="api-name">API Key Name</Label>
              <Input
                id="api-name"
                placeholder="e.g., Production API, Mobile App"
                value={newApiName}
                onChange={(e) => setNewApiName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCreateApi}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Generate API Key
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* API Keys List */}
      <div className="space-y-4">
        {apiKeys.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No API Keys
              </h3>
              <p className="text-gray-600 mb-4">
                Create your first API key to start integrating with TimelyPost
              </p>
              <Button
                onClick={() => setIsCreating(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create API Key
              </Button>
            </CardContent>
          </Card>
        ) : (
          apiKeys.map((api) => (
            <Card key={api.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{api.name}</CardTitle>
                    <CardDescription>
                      Created on {new Date(api.createdAt).toLocaleDateString()}
                      {api.description && (
                        <div className="mt-1 text-gray-600">
                          {api.description}
                        </div>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteApi(api.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* API Key (ID) */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    API Key (ID)
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      value={api.key}
                      readOnly
                      className="font-mono text-sm bg-gray-50"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(api.key, "API Key")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* API Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
          <CardDescription>
            Learn how to integrate TimelyPost API into your applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Authentication</h4>
              <p className="text-sm text-gray-600 mb-2">
                Include your API key and secret in the request headers:
              </p>
              <div className="bg-gray-100 rounded-lg p-3 font-mono text-sm">
                <div>Authorization: Bearer YOUR_API_KEY</div>
                <div>X-API-Secret: YOUR_API_SECRET</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Base URL</h4>
              <div className="bg-gray-100 rounded-lg p-3 font-mono text-sm">
                https://api.timelypost.com/v1
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* One-time credentials dialog */}
      <ApiKeyCreatedDialog
        open={showCreatedDialog}
        onOpenChange={setShowCreatedDialog}
        apiKey={createdCreds?.key}
        apiSecret={createdCreds?.secret}
      />
    </div>
  );
};

export default ClientView;
