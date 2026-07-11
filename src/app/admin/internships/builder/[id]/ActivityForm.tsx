"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash2, Video, FileText, CheckSquare, PencilRuler, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export function ActivityForm({ day, activity, onSave, onCancel }: { day: any, activity: any, onSave: () => void, onCancel: () => void }) {
  const supabase = createClient();
  const [isSaving, setIsSaving] = useState(false);
  const [contentType, setContentType] = useState(activity?.content_type || "VIDEO");
  
  // Basic states
  const [title, setTitle] = useState(activity?.title || "");
  const [notes, setNotes] = useState(activity?.html_notes || "");
  const [videoUrl, setVideoUrl] = useState(activity?.video_url || "");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [pdfInputMode, setPdfInputMode] = useState<"url" | "upload">("url");
  const [durationMins, setDurationMins] = useState(activity?.duration_hours ? Math.round(activity.duration_hours * 60) : 15);
  
  // Metadata state for Quiz / Assignment
  const [metadata, setMetadata] = useState<any>(activity?.metadata || {});

  // For quizzes
  const questions = metadata.questions || [];
  
  // Video library state
  const [libraryVideos, setLibraryVideos] = useState<any[]>([]);

  useEffect(() => {
    if (contentType === "VIDEO") {
      supabase.from("videos").select("*").order("created_at", { ascending: false }).then(({ data }) => {
        if (data) setLibraryVideos(data);
      });
    }
  }, [contentType]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      day_id: day.id,
      title: title || `${contentType} Activity`,
      content_type: contentType,
      video_url: videoUrl,
      html_notes: notes,
      duration_hours: contentType === "VIDEO" ? durationMins / 60 : null,
      metadata: metadata
    };

    let error;
    if (activity?.id) {
      const { error: updateError } = await supabase.from('lessons').update(payload).eq('id', activity.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('lessons').insert([payload]);
      error = insertError;
    }

    if (error) {
      // Handle missing columns gracefully
      if (error.message.includes("metadata") || error.message.includes("duration_hours")) {
         toast.error("Please run the SQL migration to add the missing columns!");
         
         // Fallback without new columns
         const fallbackPayload = { ...payload };
         if (error.message.includes("metadata")) delete (fallbackPayload as any).metadata;
         if (error.message.includes("duration_hours")) delete (fallbackPayload as any).duration_hours;
         
         if (activity?.id) {
            await supabase.from('lessons').update(fallbackPayload).eq('id', activity.id);
         } else {
            await supabase.from('lessons').insert([fallbackPayload]);
         }
         onSave();
      } else {
        toast.error(`Failed to save activity: ${error.message}`);
      }
    } else {
      toast.success("Activity saved!");
      onSave();
    }
    setIsSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{activity?.id ? "Edit Activity" : "New Activity"}</h2>
        <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
      </div>

      <div className="space-y-2">
        <Label>Activity Type</Label>
        <select 
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
          value={contentType}
          onChange={(e) => {
            const val = e.target.value;
            setContentType(val);
            if (val === "REST") {
              setTitle("Rest Day");
              setNotes("Take rest and enjoy your day!");
            }
          }}
        >
          <option value="VIDEO">Video Lecture</option>
          <option value="DOCUMENT">PDF Document</option>
          <option value="TASK">Task</option>
          <option value="QUIZ">Quiz</option>
          <option value="ASSIGNMENT">Assignment</option>
          <option value="REST">Rest Day</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label>Activity Title</Label>
        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Introduction to React" required />
      </div>

      <div className="space-y-2">
        <Label>Instructions / Overview</Label>
        <Textarea value={notes} onChange={e => setNotes(e.target.value)} className="h-32" placeholder="Describe what the intern needs to do..." />
      </div>

      {contentType === "VIDEO" && (
        <div className="space-y-4 p-4 border border-border rounded-xl bg-muted/20">
          <h3 className="font-semibold flex items-center gap-2"><Video className="w-4 h-4"/> Video Settings</h3>
          
          <div className="space-y-2">
            <Label>Select from Library</Label>
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            >
              <option value="">-- Or paste custom URL below --</option>
              {libraryVideos.map(v => (
                <option key={v.id} value={v.video_url}>{v.title} ({v.provider})</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Custom Video URL</Label>
            <Input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://youtube.com/..." />
          </div>

          <div className="space-y-2">
            <Label>Video Duration (Minutes)</Label>
            <Input type="number" value={durationMins} onChange={e => setDurationMins(parseInt(e.target.value) || 0)} min={1} placeholder="15" />
            <p className="text-[10px] text-muted-foreground">This dictates the length displayed on the curriculum schedule.</p>
          </div>
        </div>
      )}

      {contentType === "QUIZ" && (
        <div className="space-y-4 p-4 border border-border rounded-xl bg-muted/20">
          <h3 className="font-semibold flex items-center gap-2"><FileText className="w-4 h-4"/> Quiz Builder</h3>
          {questions.map((q: any, idx: number) => (
            <div key={idx} className="p-4 border border-border rounded-lg bg-card space-y-4 relative">
              <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive"
                onClick={() => {
                  const newQ = [...questions];
                  newQ.splice(idx, 1);
                  setMetadata({ ...metadata, questions: newQ });
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <div className="space-y-2">
                <Label>Question {idx + 1}</Label>
                <Input value={q.text} onChange={e => {
                  const newQ = [...questions];
                  newQ[idx].text = e.target.value;
                  setMetadata({ ...metadata, questions: newQ });
                }} />
              </div>
              <div className="space-y-2">
                <Label>Options (comma separated)</Label>
                <Input value={(q.options || []).join(', ')} onChange={e => {
                  const newQ = [...questions];
                  newQ[idx].options = e.target.value.split(',').map(s => s.trim());
                  setMetadata({ ...metadata, questions: newQ });
                }} />
              </div>
              <div className="space-y-2 pt-2 border-t border-border/50">
                <Label>Correct Answer</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={q.answerIndex || 0}
                  onChange={e => {
                    const newQ = [...questions];
                    newQ[idx].answerIndex = parseInt(e.target.value, 10);
                    setMetadata({ ...metadata, questions: newQ });
                  }}
                >
                  {(!q.options || q.options.length === 0) ? (
                     <option value={0}>Add options first...</option>
                  ) : (
                     q.options.map((opt: string, optIdx: number) => (
                       <option key={optIdx} value={optIdx}>
                         Option {optIdx + 1}: {opt || `(Empty)`}
                       </option>
                     ))
                  )}
                </select>
                <p className="text-[10px] text-muted-foreground">This is the answer key used for automatic grading.</p>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => {
            setMetadata({ ...metadata, questions: [...questions, { text: '', options: [] }] });
          }}>
            <Plus className="w-4 h-4 mr-2" /> Add Question
          </Button>
        </div>
      )}

      {contentType === "ASSIGNMENT" && (
        <div className="space-y-4 p-4 border border-border rounded-xl bg-muted/20">
           <h3 className="font-semibold flex items-center gap-2"><PencilRuler className="w-4 h-4"/> Assignment Settings</h3>
           <div className="space-y-2">
              <Label>Minimum Passing Grade (%)</Label>
              <Input type="number" value={metadata.passing_grade || 70} onChange={e => setMetadata({...metadata, passing_grade: e.target.value})} />
           </div>
           <div className="flex items-center gap-2">
              <input type="checkbox" id="require_upload" checked={metadata.require_upload || false} onChange={e => setMetadata({...metadata, require_upload: e.target.checked})} />
              <Label htmlFor="require_upload">Require File Upload Submission</Label>
           </div>
        </div>
      )}

      {contentType === "DOCUMENT" && (
        <div className="space-y-4 p-4 border border-border rounded-xl bg-muted/20">
           <div className="flex items-center justify-between">
             <h3 className="font-semibold flex items-center gap-2"><FileText className="w-4 h-4"/> PDF Document Settings</h3>
             <div className="flex bg-muted/50 p-1 rounded-lg">
               <button 
                 type="button"
                 onClick={() => setPdfInputMode("url")} 
                 className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${pdfInputMode === "url" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
               >
                 Paste URL
               </button>
               <button 
                 type="button"
                 onClick={() => setPdfInputMode("upload")} 
                 className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${pdfInputMode === "upload" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
               >
                 Upload File
               </button>
             </div>
           </div>
           
           {pdfInputMode === "url" ? (
             <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
               <Label>Public PDF URL</Label>
               <Input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://..." />
               <p className="text-[10px] text-muted-foreground">Paste a direct link to a PDF (e.g. Google Drive link).</p>
             </div>
           ) : (
             <div className="relative border border-dashed border-border rounded-lg p-6 text-center hover:bg-muted/50 transition-colors animate-in fade-in slide-in-from-top-1">
                <input 
                  type="file" 
                  accept="application/pdf"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    const toastId = toast.loading("Uploading PDF...");
                    try {
                      const filePath = `${Date.now()}_${file.name}`;
                      const { error } = await supabase.storage.from("materials").upload(filePath, file);
                      if (error) throw error;
                      
                      const { data: { publicUrl } } = supabase.storage.from("materials").getPublicUrl(filePath);
                      setVideoUrl(publicUrl);
                      setUploadedFileName(file.name);
                      toast.success("PDF uploaded successfully!", { id: toastId });
                    } catch (err: any) {
                      toast.error(err.message || "Upload failed. Did you create the 'materials' bucket?", { id: toastId });
                    }
                  }}
                />
                <div className="flex flex-col items-center gap-2 pointer-events-none">
                  <FileText className={`w-8 h-8 ${uploadedFileName ? "text-primary" : "text-muted-foreground"}`} />
                  <div className={`text-sm font-medium ${uploadedFileName ? "text-primary" : ""}`}>
                    {uploadedFileName ? `Selected: ${uploadedFileName}` : "Click here to upload a PDF file"}
                  </div>
                </div>
             </div>
           )}
        </div>
      )}

      <Button type="submit" disabled={isSaving} className="w-full sm:w-auto gap-2">
        <Save className="w-4 h-4" />
        {isSaving ? "Saving..." : "Save Activity"}
      </Button>
    </form>
  );
}
