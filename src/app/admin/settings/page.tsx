"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Loader2, Link as LinkIcon, Camera, PlaySquare, Video } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  // We map platforms to their respective URLs and IDs
  const [socialLinks, setSocialLinks] = useState<{ [key: string]: { id?: string; url: string } }>({
    Instagram: { url: "" },
    TikTok: { url: "" },
    YouTube: { url: "" }
  });

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const { data, error } = await supabase.from("social_links").select("*");
      if (error) {
        if (error.code !== "42P01") { // Ignore table doesn't exist yet, wait for SQL script to be run
          console.error("Error fetching social links:", error);
        }
        return;
      }
      
      if (data && data.length > 0) {
        const newLinks = { ...socialLinks };
        data.forEach(link => {
          newLinks[link.platform] = { id: link.id, url: link.url };
        });
        setSocialLinks(newLinks);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUrlChange = (platform: string, newUrl: string) => {
    setSocialLinks(prev => ({
      ...prev,
      [platform]: { ...prev[platform], url: newUrl }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const promises = Object.entries(socialLinks).map(async ([platform, data]) => {
        if (!data.url) return null;
        
        if (data.id) {
          // Update
          return supabase.from("social_links").update({ url: data.url }).eq("id", data.id);
        } else {
          // Insert
          return supabase.from("social_links").insert({ platform, url: data.url });
        }
      });

      const results = await Promise.all(promises);
      const errors = results.filter(r => r && r.error).map(r => r?.error);
      
      if (errors.length > 0) {
        throw new Error(errors[0]?.message || "Failed to update some links");
      }

      toast.success("Social links updated successfully!");
      fetchLinks(); // refresh to get new IDs
    } catch (error: any) {
      toast.error(error.message || "Failed to save social links");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground mt-1">Manage global platform configuration and integration links.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Social Links Card */}
        <Card className="col-span-1 md:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-primary" /> Social Media Requirements
            </CardTitle>
            <CardDescription>
              Students are required to follow these links during the verification process.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Camera className="w-4 h-4" /> Instagram URL
                  </Label>
                  <Input 
                    placeholder="https://instagram.com/quantimlabz" 
                    value={socialLinks.Instagram?.url || ""}
                    onChange={(e) => handleUrlChange("Instagram", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Video className="w-4 h-4" /> TikTok URL
                  </Label>
                  <Input 
                    placeholder="https://tiktok.com/@quantimlabz" 
                    value={socialLinks.TikTok?.url || ""}
                    onChange={(e) => handleUrlChange("TikTok", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <PlaySquare className="w-4 h-4" /> YouTube URL
                  </Label>
                  <Input 
                    placeholder="https://youtube.com/@quantimlabz" 
                    value={socialLinks.YouTube?.url || ""}
                    onChange={(e) => handleUrlChange("YouTube", e.target.value)}
                  />
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="bg-muted/50 border-t border-border px-6 py-4 flex justify-end">
            <Button onClick={handleSave} disabled={saving || loading} className="gap-2 bg-primary text-primary-foreground">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Links
            </Button>
          </CardFooter>
        </Card>

      </div>
    </div>
  );
}
