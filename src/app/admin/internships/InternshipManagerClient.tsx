"use client";

import { useState } from "react";
import { Plus, Search, Edit, Trash2, Layers, Clock, Settings, GraduationCap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteInternship } from "@/app/admin/actions";
import { toast } from "sonner";

interface Internship {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  difficulty_level: string;
  duration_weeks: number;
  duration_unit: string;
  status: string;
  category: string;
}

export function InternshipManagerClient({ internships }: { internships: Internship[] }) {
  const [search, setSearch] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete(id: string) {
    if (!window.confirm("Are you sure you want to delete this program? All associated days and activities will be lost.")) return;
    
    setIsDeleting(id);
    try {
      const result = await deleteInternship(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Internship deleted");
        router.refresh();
      }
    } catch (err) {
      toast.error("An error occurred while deleting.");
    } finally {
      setIsDeleting(null);
    }
  }

  const filtered = internships.filter((i) => 
    i.title?.toLowerCase().includes(search.toLowerCase()) ||
    i.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading">Internship Programs</h1>
          <p className="text-muted-foreground">Manage your fully integrated internship projects.</p>
        </div>
        <Link href="/admin/internships/builder/new">
          <Button className="gap-2 rounded-xl">
            <Plus className="w-4 h-4" /> Create Program
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4 bg-card p-2 rounded-2xl border border-border">
        <Search className="w-5 h-5 ml-2 text-muted-foreground" />
        <Input 
          className="border-0 bg-transparent focus-visible:ring-0 shadow-none text-base" 
          placeholder="Search programs..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((program) => (
          <div key={program.id} className="bg-card border border-border rounded-3xl overflow-hidden hover:border-primary/50 transition-all flex flex-col group shadow-sm hover:shadow-md">
            <div className="h-48 relative overflow-hidden bg-muted border-b border-border">
              {program.thumbnail_url ? (
                <img src={program.thumbnail_url} alt={program.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary">
                  <GraduationCap className="w-16 h-16 opacity-50" />
                </div>
              )}
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge variant="secondary" className="bg-black/60 backdrop-blur-md text-white border-none">
                  {program.difficulty_level || "Beginner"}
                </Badge>
                {program.status === 'PUBLISHED' && (
                  <Badge variant="default" className="bg-primary text-primary-foreground border-none shadow-[0_0_10px_rgba(68,255,209,0.5)]">
                    Active
                  </Badge>
                )}
              </div>
            </div>

            <div className="p-6 flex flex-col flex-1">
              <h3 className="text-xl font-bold mb-2 line-clamp-2">{program.title}</h3>
              <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-1">
                {program.description || "No description provided."}
              </p>

              <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground mb-6 bg-muted/50 p-3 rounded-xl border border-border/50">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>{program.duration_weeks || 0} {program.duration_unit || 'Days'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-accent" />
                  <span>{program.category || "General"}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-auto pt-4 border-t border-border">
                <Link href={`/admin/internships/edit/${program.id}`} className="flex-[0.5]">
                  <Button variant="outline" className="w-full rounded-xl border-border hover:bg-muted">
                    <Edit className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href={`/admin/internships/builder/${program.id}`} className="flex-1">
                  <Button className="w-full bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary rounded-xl">
                    <Layers className="w-4 h-4 mr-2" /> Builder
                  </Button>
                </Link>
                <Button 
                  onClick={() => handleDelete(program.id)}
                  disabled={isDeleting === program.id}
                  variant="outline" 
                  size="icon" 
                  className="rounded-xl border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                >
                  {isDeleting === program.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-card rounded-3xl border border-dashed border-border">
            No programs found. Create your first internship!
          </div>
        )}
      </div>
    </div>
  );
}
