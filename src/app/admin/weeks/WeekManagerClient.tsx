"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarRange, MoreVertical, Trash2, Edit, Plus, CheckCircle2, Search, Download, Filter, ChevronLeft, ChevronRight, Layers } from "lucide-react";
import { toast } from "sonner";
import { createWeek, deleteWeek } from "../actions";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

export function WeekManagerClient({ weeks, modules }: { weeks: any[], modules: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Enterprise Table States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  async function handleDelete(weekId: string) {
    if (!confirm("Are you sure you want to delete this week? All days and lessons inside will be lost.")) return;
    setLoadingId(weekId);
    const result = await deleteWeek(weekId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Week deleted successfully");
    }
    setLoadingId(null);
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} weeks?`)) return;
    toast.info("Bulk delete initiated...");
    for (const id of Array.from(selectedIds)) {
       await deleteWeek(id);
    }
    toast.success("Bulk deletion complete");
    setSelectedIds(new Set());
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsCreating(true);
    const formData = new FormData(event.currentTarget);
    const result = await createWeek(formData);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Week created successfully");
      setIsDialogOpen(false);
    }
    setIsCreating(false);
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredWeeks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredWeeks.map((w: any) => w.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const filteredWeeks = useMemo(() => {
    if (!weeks) return [];
    return weeks.filter((w: any) => 
      w.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [weeks, searchQuery]);

  const totalPages = Math.ceil(filteredWeeks.length / itemsPerPage);
  const paginatedWeeks = filteredWeeks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">Weeks Dashboard</h1>
          <p className="text-muted-foreground mt-1">Break your modules down into structured weekly timelines.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2" onClick={() => toast.success("Exporting CSV...")}>
            <Download className="w-4 h-4" /> Export
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground gap-2">
                <Plus className="w-4 h-4" /> Create Week
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Week</DialogTitle>
                <DialogDescription>Add a weekly section inside a Module.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="module_id">Assign to Module <span className="text-destructive">*</span></Label>
                  <select name="module_id" required className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    <option value="">Select a Module</option>
                    {modules.map((m: any) => (
                      <option key={m.id} value={m.id}>
                        {m.title} {m.courses?.title ? `(${m.courses.title})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Week Title <span className="text-destructive">*</span></Label>
                  <Input id="title" name="title" required placeholder="e.g. Week 1: Core Concepts" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order_index">Display Order</Label>
                  <Input id="order_index" name="order_index" type="number" defaultValue={1} />
                </div>
                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create Week"}
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
              placeholder="Search weeks..." 
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
                    checked={selectedIds.size > 0 && selectedIds.size === filteredWeeks.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 font-medium">Week Details</th>
                <th className="px-6 py-4 font-medium">Parent Module</th>
                <th className="px-6 py-4 font-medium">Order</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedWeeks.map((weekItem: any) => (
                <tr key={weekItem.id} className={`hover:bg-muted/30 transition-colors ${loadingId === weekItem.id ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4">
                    <Checkbox 
                      checked={selectedIds.has(weekItem.id)}
                      onCheckedChange={() => toggleSelect(weekItem.id)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <CalendarRange className="w-4 h-4 text-primary" />
                      </div>
                      <p className="font-semibold text-foreground">{weekItem.title}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Layers className="w-4 h-4" />
                      <div className="flex flex-col">
                        <span className="truncate max-w-[200px] font-medium text-foreground block">{weekItem.modules?.title || "Unassigned"}</span>
                        <span className="truncate max-w-[200px] text-xs block">{weekItem.modules?.courses?.title || ""}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium px-2 py-1 bg-muted rounded-md border border-border">
                      {weekItem.order_index || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={loadingId === weekItem.id}>
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => toast.info("Opening days builder...")}>
                          <Edit className="w-4 h-4 mr-2" /> Manage Days
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(weekItem.id)} className="text-destructive focus:text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}

              {paginatedWeeks.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground space-y-3">
                      <CheckCircle2 className="w-10 h-10 text-muted-foreground/30" />
                      <p>No weeks found. Ensure you have a Module created first, then add a week.</p>
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
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredWeeks.length)} of {filteredWeeks.length} results
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
