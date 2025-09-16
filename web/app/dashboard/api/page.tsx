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
import { Copy, Eye, EyeOff, Plus, Trash2, Key } from "lucide-react";
import { toast } from "sonner";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  secret: string;
  createdAt: string;
  lastUsed: string | null;
}

export default function ApiPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: "1",
      name: "Production API",
      key: "tp_live_1234567890abcdef",
      secret: "sk_live_abcdef1234567890",
      createdAt: "2024-01-15",
      lastUsed: "2024-01-20",
    },
    {
      id: "2",
      name: "Development API",
      key: "tp_test_0987654321fedcba",
      secret: "sk_test_fedcba0987654321",
      createdAt: "2024-01-10",
      lastUsed: null,
    },
  ]);
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [isCreating, setIsCreating] = useState(false);
  const [newApiName, setNewApiName] = useState("");

  const generateApiKey = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "tp_live_";
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const generateApiSecret = () => {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "sk_live_";
    for (let i = 0; i < 24; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCreateApi = () => {
    if (!newApiName.trim()) {
      toast("Error", {
        description: "Please enter a name for your API key",
      });
      return;
    }

    const newApi: ApiKey = {
      id: Date.now().toString(),
      name: newApiName,
      key: generateApiKey(),
      secret: generateApiSecret(),
      createdAt: new Date().toISOString().split("T")[0],
      lastUsed: null,
    };

    setApiKeys([...apiKeys, newApi]);
    setNewApiName("");
    setIsCreating(false);
    toast("API Key Created", {
      description: "Your new API key has been generated successfully",
    });
  };

  const handleDeleteApi = (id: string) => {
    setApiKeys(apiKeys.filter((api) => api.id !== id));
    toast("API Key Deleted", {
      description: "The API key has been removed from your account",
    });
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast("Copied!", {
      description: `${type} copied to clipboard`,
    });
  };

  const toggleSecretVisibility = (id: string) => {
    setShowSecrets((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

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
                      {api.lastUsed && (
                        <span className="ml-2">
                          • Last used{" "}
                          {new Date(api.lastUsed).toLocaleDateString()}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {api.lastUsed ? (
                      <Badge variant="secondary">Active</Badge>
                    ) : (
                      <Badge variant="outline">Unused</Badge>
                    )}
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
                {/* API Key */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    API Key
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

                {/* API Secret */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    API Secret
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      value={
                        showSecrets[api.id]
                          ? api.secret
                          : "••••••••••••••••••••••••••••••••"
                      }
                      readOnly
                      className="font-mono text-sm bg-gray-50"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleSecretVisibility(api.id)}
                    >
                      {showSecrets[api.id] ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(api.secret, "API Secret")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Keep your API secret secure!</strong> Never share it
                    publicly or commit it to version control.
                  </p>
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

            <div>
              <Button variant="outline" className="w-full bg-transparent">
                View Full API Documentation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
