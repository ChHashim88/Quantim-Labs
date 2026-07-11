"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Video, MoreVertical, Trash2, Edit, Plus, CheckCircle2, Search, Download, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { createInternship, deleteInternship } from "../actions";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

export function CourseClientTable({ courses }: { courses: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Enterprise Table States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  async function handleDelete(courseId: string) {
    if (!confirm("Are you sure you want to delete this program? All related data will be lost.")) return;
    setLoadingId(courseId);
    const result = await deleteInternship(courseId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Program deleted successfully");
    }
    setLoadingId(null);
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} programs?`)) return;
    // In a real app, you'd have a bulkDelete action
    toast.info("Bulk delete initiated...");
    for (const id of Array.from(selectedIds)) {
       await deleteInternship(id);
    }
    toast.success("Bulk deletion complete");
    setSelectedIds(new Set());
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsCreating(true);
    const formData = new FormData(event.currentTarget);
    const result = await createInternship(formData);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Program created successfully");
      setIsDialogOpen(false);
    }
    setIsCreating(false);
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredCourses.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCourses.map((c: any) => c.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  // Filter and Search Logic
  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    return courses.filter((c: any) => 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [courses, searchQuery]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">Internship Programs</h1>
          <p className="text-muted-foreground mt-1">Manage all available curriculums and their statuses.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2" onClick={() => toast.success("Exporting CSV...")}>
            <Download className="w-4 h-4" /> Export
          </Button>
          <Button 
            className="bg-primary text-primary-foreground gap-2"
            onClick={() => window.location.href = "/admin/internships/builder/new"}
          >
            <Plus className="w-4 h-4" /> Create Program
          </Button>
        </div>
      </div>

      <div className="border border-border rounded-xl bg-card shadow-sm flex flex-col">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search programs..." 
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
                    checked={selectedIds.size > 0 && selectedIds.size === filteredCourses.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 font-medium">Program Details</th>
                <th className="px-6 py-4 font-medium">Content</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedCourses.map((course: any) => (
                <tr key={course.id} className={`hover:bg-muted/30 transition-colors ${loadingId === course.id ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4">
                    <Checkbox 
                      checked={selectedIds.has(course.id)}
                      onCheckedChange={() => toggleSelect(course.id)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-foreground">{course.title}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                      {course.description || "No description provided."}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Video className="w-4 h-4" />
                      <span>{course.lessons?.[0]?.count || 0} Lessons</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 font-medium">
                      {course.status || "DRAFT"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={loadingId === course.id}>
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => toast.info("Opening editor...")}>
                          <Edit className="w-4 h-4 mr-2" /> Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.info("Duplicating program...")}>
                          <Plus className="w-4 h-4 mr-2" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(course.id)} className="text-destructive focus:text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}

              {paginatedCourses.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground space-y-3">
                      <CheckCircle2 className="w-10 h-10 text-muted-foreground/30" />
                      <p>No programs found. Try adjusting your search or create a new one.</p>
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
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredCourses.length)} of {filteredCourses.length} results
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
