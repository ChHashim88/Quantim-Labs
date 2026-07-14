"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, LayoutTemplate, Video, FileText, CheckSquare, Coffee, PencilRuler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { ActivityForm } from "./ActivityForm";

export function UnifiedBuilderClient({ internship, initialDays }: { internship: any, initialDays: any[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [days, setDays] = useState(initialDays);
  const [selectedDay, setSelectedDay] = useState<any | null>(initialDays[0] || null);
  const [selectedActivity, setSelectedActivity] = useState<any | null>(null);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "VIDEO": return <Video className="w-4 h-4 text-blue-500" />;
      case "DOCUMENT": return <FileText className="w-4 h-4 text-rose-500" />;
      case "TASK": return <CheckSquare className="w-4 h-4 text-orange-500" />;
      case "QUIZ": return <FileText className="w-4 h-4 text-purple-500" />;
      case "ASSIGNMENT": return <PencilRuler className="w-4 h-4 text-green-500" />;
      case "REST": return <Coffee className="w-4 h-4 text-muted-foreground" />;
      default: return <FileText className="w-4 h-4 text-primary" />;
    }
  };

  async function handleAddWeek() {
    const newOrder = days.length + 1;
    const { data, error } = await supabase.from('days').insert([{
      internship_id: internship.id,
      title: `Week ${newOrder}`,
      order_index: newOrder
    }]).select().single();

    if (error) {
      toast.error("Failed to add week. Ensure SQL migration was run!");
    } else {
      setDays([...days, { ...data, lessons: [] }]);
      setSelectedDay(data);
      setSelectedActivity(null);
    }
  }

  async function refreshDays() {
    const { data } = await supabase.from('days').select('*, lessons(*)').eq('internship_id', internship.id).order('order_index');
    if (data) {
      // Sort lessons inside days
      const sortedDays = data.map(d => ({
        ...d,
        lessons: (d.lessons || []).sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      }));
      setDays(sortedDays);
      if (selectedDay) {
        setSelectedDay(sortedDays.find(d => d.id === selectedDay.id));
      }
      if (selectedActivity) {
        const updatedDay = sortedDays.find(d => d.id === selectedDay?.id);
        const updatedActivity = updatedDay?.lessons?.find((l: any) => l.id === selectedActivity.id);
        setSelectedActivity(updatedActivity || null);
      }
    }
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 bg-background/80 backdrop-blur-xl z-10 pb-4 pt-2 border-b border-border">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/admin/internships")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-heading font-bold tracking-tight">{internship.title}</h1>
            <p className="text-sm text-muted-foreground">Manage curriculum weeks and activities.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* LEFT SIDEBAR: Days List */}
        <div className="lg:col-span-1 bg-card border border-border rounded-xl shadow-sm flex flex-col h-[calc(100vh-140px)] sticky top-24">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-bold">Curriculum Weeks</h2>
            <Badge variant="secondary">{days.length} {days.length === 1 ? 'Week' : 'Weeks'}</Badge>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {days.map((day) => {
              const isSelectedDay = selectedDay?.id === day.id;
              
              return (
                <div key={day.id} className="space-y-1">
                  <button
                    onClick={() => { setSelectedDay(day); setSelectedActivity(null); }}
                    className={`w-full text-left p-3 rounded-lg flex items-center justify-between transition-colors ${
                      isSelectedDay && !selectedActivity ? "bg-primary text-primary-foreground shadow-md" : "bg-muted border border-transparent hover:border-border"
                    }`}
                  >
                    <span className="text-sm font-bold">{day.title}</span>
                  </button>
                  
                  {/* Render activities under the day */}
                  {(day.lessons || []).map((lesson: any) => {
                    const isSelectedAct = selectedActivity?.id === lesson.id;
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => { setSelectedDay(day); setSelectedActivity(lesson); }}
                        className={`w-full text-left pl-8 pr-3 py-2 text-sm flex items-center gap-3 transition-colors border-l-2 ${
                          isSelectedAct ? "border-primary bg-primary/5 text-primary font-medium" : "border-border hover:bg-muted/50 text-muted-foreground"
                        }`}
                      >
                        {getActivityIcon(lesson.content_type)}
                        <span className="truncate">{lesson.title || lesson.content_type}</span>
                      </button>
                    )
                  })}

                  {isSelectedDay && (
                    <button
                      onClick={() => { setSelectedActivity({}); }} // Empty object signifies "New" activity
                      className={`w-full text-left pl-8 pr-3 py-2 text-sm flex items-center gap-2 transition-colors border-l-2 border-transparent text-primary hover:bg-primary/5 mt-1 ${selectedActivity && !selectedActivity.id ? 'bg-primary/10 border-primary' : ''}`}
                    >
                      <Plus className="w-3 h-3" /> Add Activity
                    </button>
                  )}
                </div>
              );
            })}
            
            <Button onClick={handleAddWeek} variant="outline" className="w-full border-dashed gap-2 mt-6">
              <Plus className="w-4 h-4" /> Add Week
            </Button>
          </div>
        </div>

        {/* RIGHT AREA: Day Activity Editor */}
        <div className="lg:col-span-3 bg-card border border-border rounded-xl shadow-sm p-6 min-h-[500px]">
          {selectedDay && selectedActivity ? (
            <ActivityForm 
              key={selectedActivity.id || 'new'}
              day={selectedDay} 
              activity={selectedActivity} 
              onSave={() => refreshDays()}
              onCancel={() => setSelectedActivity(null)}
            />
          ) : selectedDay ? (
             <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-muted-foreground">
               <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                 <LayoutTemplate className="w-8 h-8" />
               </div>
               <div>
                 <h2 className="text-xl font-bold text-foreground mb-1">{selectedDay.title} Overview</h2>
                 <p>This week has {(selectedDay.lessons || []).length} activities.</p>
               </div>
               <Button onClick={() => setSelectedActivity({})} className="gap-2">
                 <Plus className="w-4 h-4" /> Add First Activity
               </Button>
             </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <LayoutTemplate className="w-12 h-12 mb-4 opacity-20" />
              <p>Select or add a week from the sidebar to configure its activities.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
