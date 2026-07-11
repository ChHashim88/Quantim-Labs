"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, MoreVertical, Trash2, Plus, Search, Filter, Copy, ExternalLink, FileArchive, FileSpreadsheet, FileIcon, UploadCloud, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { createDocument, deleteDocument } from "../actions";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";

export function DocumentManagerClient({ documents }: { documents: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadMode, setUploadMode] = useState<"URL" | "FILE">("URL");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const supabase = createClient();

  async function handleDelete(documentId: string) {
    if (!confirm("Are you sure you want to delete this document asset?")) return;
    setLoadingId(documentId);
    const result = await deleteDocument(documentId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Document deleted successfully");
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
        const filePath = `documents/${fileName}`;

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

        formData.set('document_url', publicUrlData.publicUrl);
        // Attempt to guess file type if not explicitly set
        if (!formData.get('file_type') || formData.get('file_type') === 'OTHER') {
          const ext = fileExt?.toUpperCase() || 'OTHER';
          if (['PDF', 'DOCX', 'PPTX', 'ZIP', 'CSV'].includes(ext)) {
            formData.set('file_type', ext);
          } else if (ext === 'XLSX') {
            formData.set('file_type', 'CSV');
          }
        }
      }

      const result = await createDocument(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Document added successfully");
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
    toast.success("Document URL copied to clipboard!");
  };

  const getFileIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'PDF': return <FileText className="w-8 h-8 text-red-500" />;
      case 'ZIP': return <FileArchive className="w-8 h-8 text-amber-500" />;
      case 'XLSX':
      case 'CSV': return <FileSpreadsheet className="w-8 h-8 text-emerald-500" />;
      default: return <FileIcon className="w-8 h-8 text-blue-500" />;
    }
  };

  const filteredDocuments = useMemo(() => {
    if (!documents) return [];
    return documents.filter((d: any) => 
      d.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [documents, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">Documents Library</h1>
          <p className="text-muted-foreground mt-1">Manage PDFs, presentations, and downloadable files.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground gap-2">
                <Plus className="w-4 h-4" /> Add Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Document Asset</DialogTitle>
                <DialogDescription>Add a new file to the central document library.</DialogDescription>
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
                  <Label htmlFor="title">Document Title <span className="text-destructive">*</span></Label>
                  <Input id="title" name="title" required placeholder="e.g. Syllabus 2026" />
                </div>

                {uploadMode === "URL" ? (
                  <div className="space-y-2">
                    <Label htmlFor="document_url">Document URL <span className="text-destructive">*</span></Label>
                    <Input id="document_url" name="document_url" required placeholder="https://..." />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="file_upload">Select Document File <span className="text-destructive">*</span></Label>
                    <Input 
                      id="file_upload" 
                      type="file" 
                      required 
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">File will be uploaded to Supabase Storage 'media' bucket.</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="file_type">File Type</Label>
                  <select name="file_type" className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    <option value="PDF">PDF Document</option>
                    <option value="DOCX">Word Document</option>
                    <option value="PPTX">PowerPoint</option>
                    <option value="ZIP">ZIP Archive</option>
                    <option value="CSV">CSV / Excel</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isCreating || (uploadMode === "FILE" && !selectedFile)}>
                    {isCreating ? "Uploading & Saving..." : "Add Document"}
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
            placeholder="Search documents..." 
            className="pl-9 h-10" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" /> Filter
        </Button>
      </div>

      {filteredDocuments.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-16 text-center bg-card flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <div className="max-w-sm">
            <h3 className="text-xl font-semibold mb-1">No documents found</h3>
            <p className="text-muted-foreground text-sm">Upload files to build your document library.</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="mt-4 gap-2">
            <Plus className="w-4 h-4" /> Add your first document
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredDocuments.map((doc: any) => (
            <div key={doc.id} className={`group border border-border rounded-xl bg-card overflow-hidden hover:shadow-md hover:border-primary/50 transition-all ${loadingId === doc.id ? 'opacity-50' : ''}`}>
              <div className="aspect-[4/3] bg-muted/50 relative flex items-center justify-center">
                {getFileIcon(doc.file_type || 'PDF')}
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={() => copyToClipboard(doc.document_url)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={() => window.open(doc.document_url, '_blank')}>
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="absolute top-2 right-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/50 hover:bg-background/80 rounded-full">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => window.open(doc.document_url, '_blank')}>
                        <ExternalLink className="w-4 h-4 mr-2" /> Download
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(doc.id)} className="text-destructive focus:text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-medium text-xs truncate" title={doc.title}>{doc.title}</h3>
                <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
                  <Badge variant="outline" className="text-[9px] h-4 px-1">{doc.file_type || 'FILE'}</Badge>
                  <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
