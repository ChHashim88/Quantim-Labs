"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, LayoutTemplate, Image as ImageIcon, Settings2, Globe, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { createInternship } from "@/app/admin/actions";
import { Checkbox } from "@/components/ui/checkbox";

export default function InternshipBuilderPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const formElement = document.getElementById("internship-form") as HTMLFormElement;
      if (!formElement) throw new Error("Form not found");
      
      const formData = new FormData(formElement);

      // Handle Image Upload
      const imageFile = formData.get("thumbnail_file") as File;
      if (imageFile && imageFile.size > 0) {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('media').upload(fileName, imageFile);
        
        if (uploadError) {
          toast.error("Failed to upload image. Please ensure a 'media' bucket exists in Supabase.");
          setIsSaving(false);
          return;
        }
        
        const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(fileName);
        formData.set("thumbnail_url", publicUrlData.publicUrl);
      }

      const result = await createInternship(formData);
      
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Internship program saved successfully.");
        router.push("/admin/internships");
      }
    } catch (error) {
      toast.error("Failed to save program.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 bg-background/80 backdrop-blur-xl z-10 pb-4 pt-2 border-b border-border">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/admin/internships")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-heading font-bold tracking-tight">Program Builder</h1>
            <p className="text-sm text-muted-foreground mt-1">Create a new enterprise internship program.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline">Save as Draft</Button>
          <Button className="bg-primary text-primary-foreground gap-2" onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Publish Program"}
          </Button>
        </div>
      </div>

      <form id="internship-form">
        <Tabs defaultValue="basic" className="flex flex-col md:flex-row gap-8">
          
          {/* Vertical Tabs List on Desktop */}
          <TabsList className="flex flex-row md:flex-col justify-start h-auto bg-transparent gap-2 w-full md:w-64 flex-shrink-0 overflow-x-auto">
            <TabsTrigger value="basic" className="w-full justify-start gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border border-transparent data-[state=active]:border-primary/20">
              <LayoutTemplate className="w-4 h-4" /> Basic Information
            </TabsTrigger>
            <TabsTrigger value="details" className="w-full justify-start gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border border-transparent data-[state=active]:border-primary/20">
              <Settings2 className="w-4 h-4" /> Program Details
            </TabsTrigger>
            <TabsTrigger value="branding" className="w-full justify-start gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border border-transparent data-[state=active]:border-primary/20">
              <ImageIcon className="w-4 h-4" /> Branding & Media
            </TabsTrigger>
            <TabsTrigger value="rules" className="w-full justify-start gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border border-transparent data-[state=active]:border-primary/20">
              <GraduationCap className="w-4 h-4" /> Learning Rules
            </TabsTrigger>
            <TabsTrigger value="seo" className="w-full justify-start gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border border-transparent data-[state=active]:border-primary/20">
              <Globe className="w-4 h-4" /> SEO & Visibility
            </TabsTrigger>
          </TabsList>

          {/* Form Contents */}
          <div className="flex-1 bg-card border border-border rounded-xl shadow-sm p-6 md:p-8">
            
            {/* 1. Basic Information */}
            <TabsContent value="basic" className="mt-0 space-y-6">
              <div>
                <h2 className="text-xl font-bold">Basic Information</h2>
                <p className="text-sm text-muted-foreground">The core details of your internship program.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label>Program Title *</Label>
                  <Input name="title" placeholder="e.g. Advanced AI Engineering Internship" required />
                </div>
                <div className="space-y-2">
                  <Label>Program Code (Auto Generated)</Label>
                  <Input name="program_code" placeholder="AI-ENG-2026" disabled />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input name="category" placeholder="e.g. Software Engineering" />
                </div>
                <div className="space-y-2">
                  <Label>Difficulty Level</Label>
                  <select name="difficulty_level" className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Duration (Number)</Label>
                  <Input name="duration_weeks" type="number" placeholder="e.g. 12" />
                </div>
                <div className="space-y-2">
                  <Label>Duration Unit</Label>
                  <select name="duration_unit" className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                    <option value="Days">Days</option>
                    <option value="Weeks">Weeks</option>
                    <option value="Months">Months</option>
                  </select>
                </div>
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <Label>Card Image (Upload or URL)</Label>
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <Input type="file" name="thumbnail_file" accept="image/*" className="flex-1 cursor-pointer" />
                    <div className="text-muted-foreground text-sm font-semibold uppercase">OR</div>
                    <Input name="thumbnail_url" placeholder="Paste image URL here..." className="flex-1" />
                  </div>
                  <p className="text-xs text-muted-foreground">Upload an image directly from your computer, or paste a link to an existing image.</p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Short Description</Label>
                  <Textarea name="short_description" placeholder="A brief summary for the program card." className="h-20" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Full Description</Label>
                  <Textarea name="full_description" placeholder="Detailed description of the entire program." className="h-40" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Skills Students Will Learn (Comma separated)</Label>
                  <Input name="skills_taught" placeholder="React, Next.js, Python, Supabase" />
                </div>
              </div>
            </TabsContent>

            {/* 2. Program Details */}
            <TabsContent value="details" className="mt-0 space-y-6">
              <div>
                <h2 className="text-xl font-bold">Program Details & Capacity</h2>
                <p className="text-sm text-muted-foreground">Configure the logistical parameters of the internship.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Internship Type</Label>
                  <select name="program_type" className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    <option value="ONLINE">Online (Remote)</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="OFFLINE">On-site</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input name="start_date" type="date" />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input name="end_date" type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Maximum Capacity (Seats)</Label>
                  <Input name="max_students" type="number" placeholder="100" />
                </div>
                <div className="space-y-2 flex items-center gap-2 mt-8">
                  <Checkbox id="waitlist" name="waitlist_enabled" />
                  <Label htmlFor="waitlist" className="cursor-pointer">Enable Waitlist when full</Label>
                </div>
              </div>
            </TabsContent>

            {/* 3. Branding & Media */}
            <TabsContent value="branding" className="mt-0 space-y-6">
              <div>
                <h2 className="text-xl font-bold">Branding & Media</h2>
                <p className="text-sm text-muted-foreground">Upload visual assets for the landing page.</p>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Cover Banner URL</Label>
                  <Input name="cover_banner_url" placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <Label>Promotional Video URL (YouTube/Vimeo)</Label>
                  <Input name="promo_video_url" placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <Label>Theme Accent Color</Label>
                  <div className="flex gap-4">
                    <Input name="theme_color" type="color" className="w-16 h-10 p-1" defaultValue="#2563EB" />
                    <Input placeholder="#2563EB" className="flex-1" />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* 4. Learning Rules */}
            <TabsContent value="rules" className="mt-0 space-y-6">
              <div>
                <h2 className="text-xl font-bold">Learning & Progression Rules</h2>
                <p className="text-sm text-muted-foreground">Set constraints for how students move through the curriculum.</p>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Minimum Watch Percentage (%)</Label>
                  <Input name="minimum_watch_percentage" type="number" defaultValue="90" max="100" />
                  <p className="text-xs text-muted-foreground">Students must watch this much of a video to unlock the next lesson.</p>
                </div>
                <div className="space-y-2">
                  <Label>Passing Percentage for Quizzes (%)</Label>
                  <Input name="passing_percentage" type="number" defaultValue="70" max="100" />
                </div>
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="certificates" name="certificate_enabled" defaultChecked value="on" />
                    <Label htmlFor="certificates">Enable Certificates upon completion</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="strict" name="strict_unlock_flow" defaultChecked value="on" />
                    <Label htmlFor="strict">Strict Unlock Flow (Cannot skip lessons)</Label>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* 5. SEO */}
            <TabsContent value="seo" className="mt-0 space-y-6">
              <div>
                <h2 className="text-xl font-bold">SEO & Discovery</h2>
                <p className="text-sm text-muted-foreground">Optimize how this program appears on search engines.</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Meta Title</Label>
                  <Input name="meta_title" placeholder="Best AI Internship 2026 | Quantim Labz" />
                </div>
                <div className="space-y-2">
                  <Label>Meta Description</Label>
                  <Textarea name="meta_description" placeholder="A compelling 160 character snippet." />
                </div>
                <div className="space-y-2">
                  <Label>Keywords (Comma separated)</Label>
                  <Input name="meta_keywords" placeholder="AI, Internship, Machine Learning, Remote" />
                </div>
              </div>
            </TabsContent>

          </div>
        </Tabs>
      </form>
    </div>
  );
}
