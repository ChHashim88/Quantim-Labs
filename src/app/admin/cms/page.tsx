import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Download, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function CmsPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">Cms Management</h1>
          <p className="text-muted-foreground mt-1">Enterprise management and configuration for Cms.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" /> Export
          </Button>
          <Button className="bg-primary text-primary-foreground gap-2">
            <Plus className="w-4 h-4" /> Create New
          </Button>
        </div>
      </div>

      <div className="border border-border rounded-xl bg-card shadow-sm flex flex-col">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search Cms..." 
              className="pl-9 h-9" 
            />
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="gap-2 h-9">
              <Filter className="w-4 h-4" /> Advanced Filters
            </Button>
          </div>
        </div>

        {/* Data Table Skeleton */}
        <div className="p-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-semibold">No Cms found</h3>
          <p className="text-muted-foreground max-w-sm mt-2 mb-6">
            Get started by creating your first record. This module will automatically sync with the Supabase database.
          </p>
          <Button variant="outline">Import Data</Button>
        </div>
      </div>
    </div>
  );
}
