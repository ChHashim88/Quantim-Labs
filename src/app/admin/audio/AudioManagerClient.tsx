"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Headphones, MoreVertical, Trash2, Edit, Plus, CheckCircle2, Search, Filter, Copy, ExternalLink, Music, UploadCloud, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { createAudio, deleteAudio } from "../actions";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";

export function AudioManagerClient({ audios }: { audios: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadMode, setUploadMode] = useState<"URL" | "FILE">("URL");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const supabase = createClient();

  async function handleDelete(audioId: string) {
    if (!confirm("Are you sure you want to delete this audio asset?")) return;
    setLoadingId(audioId);
    const result = await deleteAudio(audioId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Audio deleted successfully");
    }
    setLoadingId(null);
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsCreating(true);
    const formData = new FormData(event.currentTarget);
    
    try {
      if (uploadMode === "FILE" && selectedFile) {
        toast.info("Uploading file to Supabase Storage...");
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `audios/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('media')
          .upload(filePath, selectedFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          throw new Error("Upload failed. Ensure you created the 'media' bucket and it is public. Error: " + uploadError.message);
        }

        const { data: publicUrlData } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);

        formData.set('audio_url', publicUrlData.publicUrl);
        formData.set('provider', 'SUPABASE');
      }

      const result = await createAudio(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Audio added to library successfully");
        setIsDialogOpen(false);
        setSelectedFile(null);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsCreating(false);
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Audio URL copied to clipboard!");
  };

  const filteredAudios = useMemo(() => {
    if (!audios) return [];
    return audios.filter((a: any) => 
      a.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [audios, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">Audio Library</h1>
          <p className="text-muted-foreground mt-1">Manage podcasts, lesson voiceovers, and sound assets.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            {/* @ts-ignore - asChild prop is valid for Radix UI but types are missing */}
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground gap-2">
                <Plus className="w-4 h-4" /> Add Audio
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Audio Asset</DialogTitle>
                <DialogDescription>Add a new audio file to the central library.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 py-4">
                
                <div className="flex p-1 bg-muted rounded-md mb-4">
                  <Button 
                    type="button" 
                    variant={uploadMode === "URL" ? "default" : "ghost"} 
                    className="flex-1 gap-2"
                    onClick={() => setUploadMode("URL")}
                  >
                    <LinkIcon className="w-4 h-4" /> External URL
                  </Button>
                  <Button 
                    type="button" 
                    variant={uploadMode === "FILE" ? "default" : "ghost"} 
                    className="flex-1 gap-2"
                    onClick={() => setUploadMode("FILE")}
                  >
                    <UploadCloud className="w-4 h-4" /> Direct Upload
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Audio Title <span className="text-destructive">*</span></Label>
                  <Input id="title" name="title" required placeholder="e.g. Chapter 1 Voiceover" />
                </div>

                {uploadMode === "URL" ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="audio_url">Audio URL <span className="text-destructive">*</span></Label>
                      <Input id="audio_url" name="audio_url" required placeholder="https://..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="provider">Provider</Label>
                        <select name="provider" className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                          <option value="SUPABASE">Supabase Storage</option>
                          <option value="EXTERNAL">External URL</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="duration_seconds">Duration (seconds)</Label>
                        <Input id="duration_seconds" name="duration_seconds" type="number" placeholder="e.g. 120" />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="file_upload">Select Audio File <span className="text-destructive">*</span></Label>
                      <Input 
                        id="file_upload" 
                        type="file" 
                        accept="audio/*" 
                        required 
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">File will be uploaded to Supabase Storage 'media' bucket.</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration_seconds">Duration (seconds)</Label>
                      <Input id="duration_seconds" name="duration_seconds" type="number" placeholder="e.g. 120" />
                    </div>
                  </>
                )}

                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isCreating || (uploadMode === "FILE" && !selectedFile)}>
                    {isCreating ? "Uploading & Saving..." : "Add Audio"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search audio library..." 
            className="pl-9 h-10" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" /> Filter
        </Button>
      </div>

      {filteredAudios.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-16 text-center bg-card flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Headphones className="w-8 h-8 text-primary" />
          </div>
          <div className="max-w-sm">
            <h3 className="text-xl font-semibold mb-1">No audio found</h3>
            <p className="text-muted-foreground text-sm">Upload audio files to build your media library.</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="mt-4 gap-2">
            <Plus className="w-4 h-4" /> Add your first audio
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredAudios.map((audio: any) => (
            <div key={audio.id} className={`flex items-center p-4 border border-border rounded-xl bg-card hover:shadow-sm hover:border-primary/50 transition-all ${loadingId === audio.id ? 'opacity-50' : ''}`}>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4 flex-shrink-0">
                <Music className="w-5 h-5 text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate" title={audio.title}>{audio.title}</h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-[10px] bg-background">{audio.provider}</Badge>
                  {audio.duration_seconds && (
                    <span>
                      {Math.floor(audio.duration_seconds / 60)}:{(audio.duration_seconds % 60).toString().padStart(2, '0')}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-1 ml-4">
                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={() => copyToClipboard(audio.audio_url)}>
                  <Copy className="w-4 h-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => window.open(audio.audio_url, '_blank')}>
                      <ExternalLink className="w-4 h-4 mr-2" /> Open Link
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(audio.id)} className="text-destructive focus:text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
