"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlaySquare, MoreVertical, Trash2, Edit, Plus, CheckCircle2, Search, Filter, Copy, ExternalLink, Video, UploadCloud, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { createVideo, deleteVideo } from "../actions";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";

export function VideoManagerClient({ videos }: { videos: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadMode, setUploadMode] = useState<"URL" | "FILE">("URL");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const supabase = createClient();

  async function handleDelete(videoId: string) {
    if (!confirm("Are you sure you want to delete this video asset from the library?")) return;
    setLoadingId(videoId);
    const result = await deleteVideo(videoId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Video deleted successfully");
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
        const filePath = `videos/${fileName}`;

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

        formData.set('video_url', publicUrlData.publicUrl);
        formData.set('provider', 'SUPABASE');
      }

      const result = await createVideo(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Video added to library successfully");
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
    toast.success("Video URL copied to clipboard!");
  };

  const filteredVideos = useMemo(() => {
    if (!videos) return [];
    return videos.filter((v: any) => 
      v.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [videos, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">Video Library</h1>
          <p className="text-muted-foreground mt-1">Central repository for all course video assets.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground gap-2">
                <Plus className="w-4 h-4" /> Add Video
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Video Asset</DialogTitle>
                <DialogDescription>Add a new video to the central library.</DialogDescription>
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
                  <Label htmlFor="title">Video Title <span className="text-destructive">*</span></Label>
                  <Input id="title" name="title" required placeholder="e.g. Next.js Routing Overview" />
                </div>

                {uploadMode === "URL" ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="video_url">Video URL <span className="text-destructive">*</span></Label>
                      <Input id="video_url" name="video_url" required placeholder="https://youtube.com/..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="provider">Provider</Label>
                        <select name="provider" className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                          <option value="YOUTUBE">YouTube</option>
                          <option value="VIMEO">Vimeo</option>
                          <option value="MUX">Mux</option>
                          <option value="EXTERNAL">Other External</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="duration_seconds">Duration (seconds)</Label>
                        <Input id="duration_seconds" name="duration_seconds" type="number" placeholder="e.g. 3600" />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="file_upload">Select Video File <span className="text-destructive">*</span></Label>
                      <Input 
                        id="file_upload" 
                        type="file" 
                        accept="video/*" 
                        required 
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">File will be uploaded to Supabase Storage 'media' bucket.</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration_seconds">Duration (seconds)</Label>
                      <Input id="duration_seconds" name="duration_seconds" type="number" placeholder="e.g. 3600" />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="thumbnail_url">Custom Thumbnail URL</Label>
                  <Input id="thumbnail_url" name="thumbnail_url" placeholder="https://..." />
                </div>
                
                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isCreating || (uploadMode === "FILE" && !selectedFile)}>
                    {isCreating ? "Uploading & Saving..." : "Add Video"}
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
            placeholder="Search library..." 
            className="pl-9 h-10" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" /> Filter
        </Button>
      </div>

      {filteredVideos.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-16 text-center bg-card flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Video className="w-8 h-8 text-primary" />
          </div>
          <div className="max-w-sm">
            <h3 className="text-xl font-semibold mb-1">No videos found</h3>
            <p className="text-muted-foreground text-sm">Upload videos or add external links to build your media library.</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="mt-4 gap-2">
            <Plus className="w-4 h-4" /> Add your first video
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVideos.map((video: any) => (
            <div key={video.id} className={`group border border-border rounded-xl bg-card overflow-hidden hover:shadow-md hover:border-primary/50 transition-all ${loadingId === video.id ? 'opacity-50' : ''}`}>
              <div className="aspect-video bg-muted relative flex items-center justify-center overflow-hidden">
                {video.thumbnail_url ? (
                  <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                ) : (
                  <PlaySquare className="w-10 h-10 text-muted-foreground/30" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={() => copyToClipboard(video.video_url)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={() => window.open(video.video_url, '_blank')}>
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
                <div className="absolute bottom-2 right-2 flex gap-2">
                  {video.duration_seconds && (
                    <Badge variant="secondary" className="bg-black/70 text-white border-none backdrop-blur-sm text-[10px] px-1.5 py-0.5">
                      {Math.floor(video.duration_seconds / 60)}:{(video.duration_seconds % 60).toString().padStart(2, '0')}
                    </Badge>
                  )}
                </div>
                <div className="absolute top-2 right-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 bg-black/50 text-white hover:bg-black/70 hover:text-white rounded-full">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => toast.info("Edit video...")}>
                        <Edit className="w-4 h-4 mr-2" /> Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(video.id)} className="text-destructive focus:text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sm truncate" title={video.title}>{video.title}</h3>
                <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-[10px]">{video.provider}</Badge>
                  <span>{new Date(video.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
