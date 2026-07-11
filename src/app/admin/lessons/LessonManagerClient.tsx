"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlaySquare, FileText, ClipboardList, BookOpen, MoreVertical, Trash2, Edit, Plus, CheckCircle2, Search, Download, Filter, ChevronLeft, ChevronRight, CalendarDays, Lock, Unlock } from "lucide-react";
import { toast } from "sonner";
import { createLesson, deleteLesson } from "../actions";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

export function LessonManagerClient({ lessons, days }: { lessons: any[], days: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedType, setSelectedType] = useState("VIDEO");
  
  // Enterprise Table States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  async function handleDelete(lessonId: string) {
    if (!confirm("Are you sure you want to delete this lesson? All resources and progress will be lost.")) return;
    setLoadingId(lessonId);
    const result = await deleteLesson(lessonId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Lesson deleted successfully");
    }
    setLoadingId(null);
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} lessons?`)) return;
    toast.info("Bulk delete initiated...");
    for (const id of Array.from(selectedIds)) {
       await deleteLesson(id);
    }
    toast.success("Bulk deletion complete");
    setSelectedIds(new Set());
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsCreating(true);
    const formData = new FormData(event.currentTarget);
    const result = await createLesson(formData);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Lesson created successfully");
      setIsDialogOpen(false);
    }
    setIsCreating(false);
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredLessons.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredLessons.map((l: any) => l.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const filteredLessons = useMemo(() => {
    if (!lessons) return [];
    return lessons.filter((l: any) => 
      l.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [lessons, searchQuery]);

  const totalPages = Math.ceil(filteredLessons.length / itemsPerPage);
  const paginatedLessons = filteredLessons.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'VIDEO': return <PlaySquare className="w-4 h-4 text-blue-500" />;
      case 'DOCUMENT': return <FileText className="w-4 h-4 text-orange-500" />;
      case 'QUIZ': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'ASSIGNMENT': return <ClipboardList className="w-4 h-4 text-purple-500" />;
      default: return <BookOpen className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">Lessons Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage videos, documents, quizzes, and assignments.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2" onClick={() => toast.success("Exporting CSV...")}>
            <Download className="w-4 h-4" /> Export
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground gap-2">
                <Plus className="w-4 h-4" /> Create Lesson
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Lesson</DialogTitle>
                <DialogDescription>Add a specific learning node to a Day.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="day_id">Assign to Day <span className="text-destructive">*</span></Label>
                    <select name="day_id" required className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                      <option value="">Select a Day</option>
                      {days.map((d: any) => (
                        <option key={d.id} value={d.id}>
                          {d.title} {d.weeks?.title ? `(${d.weeks.title})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content_type">Lesson Type</Label>
                    <select 
                      name="content_type" 
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                    >
                      <option value="VIDEO">Video Lecture</option>
                      <option value="DOCUMENT">Reading / Document</option>
                      <option value="QUIZ">Quiz</option>
                      <option value="ASSIGNMENT">Assignment</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Lesson Title <span className="text-destructive">*</span></Label>
                  <Input id="title" name="title" required placeholder="e.g. Introduction to React Hooks" />
                </div>

                {selectedType === 'VIDEO' && (
                  <div className="space-y-2">
                    <Label htmlFor="video_url">Video URL (YouTube / Vimeo)</Label>
                    <Input id="video_url" name="video_url" placeholder="https://..." />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="html_notes">HTML Notes / Content</Label>
                  <Textarea id="html_notes" name="html_notes" placeholder="Detailed notes for this lesson..." className="h-24" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="order_index">Display Order</Label>
                    <Input id="order_index" name="order_index" type="number" defaultValue={1} />
                  </div>
                  <div className="space-y-2 flex items-center gap-2 mt-8">
                    <Checkbox id="is_locked" name="is_locked_by_default" defaultChecked value="on" />
                    <Label htmlFor="is_locked" className="cursor-pointer">Locked by default</Label>
                  </div>
                </div>

                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create Lesson"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="border border-border rounded-xl bg-card shadow-sm flex flex-col">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search lessons..." 
              className="pl-9 h-9" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {selectedIds.size > 0 && (
              <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                Delete Selected ({selectedIds.size})
              </Button>
            )}
            <Button variant="outline" size="sm" className="gap-2 h-9">
              <Filter className="w-4 h-4" /> Filter
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 w-[50px]">
                  <Checkbox 
                    checked={selectedIds.size > 0 && selectedIds.size === filteredLessons.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 font-medium">Lesson Details</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Parent Day</th>
                <th className="px-6 py-4 font-medium">Access</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedLessons.map((lessonItem: any) => (
                <tr key={lessonItem.id} className={`hover:bg-muted/30 transition-colors ${loadingId === lessonItem.id ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4">
                    <Checkbox 
                      checked={selectedIds.has(lessonItem.id)}
                      onCheckedChange={() => toggleSelect(lessonItem.id)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
                        {getTypeIcon(lessonItem.content_type)}
                      </div>
                      <p className="font-semibold text-foreground max-w-[200px] truncate" title={lessonItem.title}>{lessonItem.title}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium px-2 py-1 bg-muted rounded-md border border-border">
                      {lessonItem.content_type || "VIDEO"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CalendarDays className="w-4 h-4" />
                      <div className="flex flex-col">
                        <span className="truncate max-w-[150px] font-medium text-foreground block">{lessonItem.days?.title || "Unassigned"}</span>
                        <span className="truncate max-w-[150px] text-xs block">{lessonItem.days?.weeks?.title || ""}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {lessonItem.is_locked_by_default ? (
                      <Badge variant="outline" className="text-amber-600 border-amber-600/20 bg-amber-50 gap-1 dark:bg-amber-500/10 dark:text-amber-400">
                        <Lock className="w-3 h-3" /> Locked
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-emerald-600 border-emerald-600/20 bg-emerald-50 gap-1 dark:bg-emerald-500/10 dark:text-emerald-400">
                        <Unlock className="w-3 h-3" /> Open
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={loadingId === lessonItem.id}>
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => toast.info("Opening resource manager...")}>
                          <Edit className="w-4 h-4 mr-2" /> Manage Resources
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(lessonItem.id)} className="text-destructive focus:text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}

              {paginatedLessons.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground space-y-3">
                      <CheckCircle2 className="w-10 h-10 text-muted-foreground/30" />
                      <p>No lessons found. Ensure you have a Day created first, then add a lesson.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground bg-muted/20">
            <div>
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredLessons.length)} of {filteredLessons.length} results
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Prev
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
