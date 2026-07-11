"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, Music, FileText, Search, Copy, ExternalLink, Filter, Database, MoreVertical, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteVideo, deleteAudio, deleteDocument } from "../actions";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function MediaManagerClient({ media }: { media: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");

  async function handleDelete(item: any) {
    if (!confirm(`Are you sure you want to delete this ${item.globalType.toLowerCase()} asset?`)) return;
    setLoadingId(item.id);
    
    let result;
    if (item.globalType === 'VIDEO') result = await deleteVideo(item.id);
    else if (item.globalType === 'AUDIO') result = await deleteAudio(item.id);
    else if (item.globalType === 'DOCUMENT') result = await deleteDocument(item.id);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Asset deleted successfully");
    }
    setLoadingId(null);
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("URL copied to clipboard!");
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'VIDEO': return <Video className="w-6 h-6 text-blue-500" />;
      case 'AUDIO': return <Music className="w-6 h-6 text-purple-500" />;
      case 'DOCUMENT': return <FileText className="w-6 h-6 text-red-500" />;
      default: return <Database className="w-6 h-6 text-primary" />;
    }
  };

  const filteredMedia = useMemo(() => {
    return media.filter((m: any) => {
      const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === "ALL" || m.globalType === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [media, searchQuery, activeTab]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">Global Media Manager</h1>
          <p className="text-muted-foreground mt-1">Unified view of all videos, audios, and documents across the platform.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search all assets..." 
            className="pl-9 h-10 bg-card" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-4 sm:w-auto">
            <TabsTrigger value="ALL">All Files</TabsTrigger>
            <TabsTrigger value="VIDEO">Videos</TabsTrigger>
            <TabsTrigger value="AUDIO">Audios</TabsTrigger>
            <TabsTrigger value="DOCUMENT">Documents</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filteredMedia.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-16 text-center bg-card flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Database className="w-8 h-8 text-primary" />
          </div>
          <div className="max-w-sm">
            <h3 className="text-xl font-semibold mb-1">No media found</h3>
            <p className="text-muted-foreground text-sm">Upload assets from their respective dashboards.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredMedia.map((item: any) => (
            <div key={item.id} className={`group flex flex-col border border-border rounded-xl bg-card hover:shadow-md hover:border-primary/50 transition-all ${loadingId === item.id ? 'opacity-50' : ''}`}>
              <div className="aspect-square bg-muted/30 relative flex items-center justify-center p-4">
                {item.thumbnail_url ? (
                  <img src={item.thumbnail_url} alt={item.title} className="absolute inset-0 w-full h-full object-cover rounded-t-xl opacity-80" />
                ) : (
                  <div className="z-10">{getIcon(item.globalType)}</div>
                )}
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-t-xl z-20">
                  <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={() => copyToClipboard(item.url)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={() => window.open(item.url, '_blank')}>
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>

                <div className="absolute top-2 right-2 z-20">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/50 hover:bg-background/80 rounded-full backdrop-blur-sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDelete(item)} className="text-destructive focus:text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" /> Delete Asset
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {item.duration_seconds && (
                  <Badge className="absolute bottom-2 right-2 z-20 bg-black/70 text-white border-none backdrop-blur-sm text-[10px] px-1.5 py-0.5">
                    {Math.floor(item.duration_seconds / 60)}:{(item.duration_seconds % 60).toString().padStart(2, '0')}
                  </Badge>
                )}
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between">
                <h3 className="font-medium text-xs line-clamp-2" title={item.title}>{item.title}</h3>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                  <Badge variant="outline" className={`text-[9px] h-4 px-1 ${
                    item.globalType === 'VIDEO' ? 'text-blue-500 border-blue-200' :
                    item.globalType === 'AUDIO' ? 'text-purple-500 border-purple-200' :
                    'text-red-500 border-red-200'
                  }`}>
                    {item.file_type || item.globalType}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
