"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Bell, Shield, Save, Lock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [originalFirstName, setOriginalFirstName] = useState("");
  const [originalLastName, setOriginalLastName] = useState("");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [digest, setDigest] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [daysUntilUnlock, setDaysUntilUnlock] = useState(0);
  const [unlockDate, setUnlockDate] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, last_name_changed_at')
        .eq('id', user.id)
        .single();

      if (data && !error) {
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setOriginalFirstName(data.first_name || "");
        setOriginalLastName(data.last_name || "");

        if (data.last_name_changed_at) {
          const lastChanged = new Date(data.last_name_changed_at);
          const diffTime = Math.abs(new Date().getTime() - lastChanged.getTime());
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays < 30) {
            setDaysUntilUnlock(30 - diffDays);
            
            // Calculate exact unlock date
            const unlock = new Date(lastChanged);
            unlock.setDate(unlock.getDate() + 30);
            setUnlockDate(unlock.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
          }
        }
      }
      setLoading(false);
    };

    loadProfile();
  }, []);

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const nameChanged = firstName !== originalFirstName || lastName !== originalLastName;
      const updates: any = {
        first_name: firstName,
        last_name: lastName
      };

      if (nameChanged) {
        updates.last_name_changed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        toast.error("Failed to save settings.");
      } else {
        toast.success("Settings saved successfully!");
        
        if (nameChanged) {
          setOriginalFirstName(firstName);
          setOriginalLastName(lastName);
          setDaysUntilUnlock(30);
        }

        // Play save confirmation beep
        try {
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioCtx) {
            const ctx = new AudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(523, ctx.currentTime);
            osc.frequency.setValueAtTime(659, ctx.currentTime + 0.08);
            gain.gain.setValueAtTime(0.06, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.16);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.16);
          }
        } catch (e) {}
      }
    }
    
    setIsSaving(false);
  };

  const isNameLocked = daysUntilUnlock > 0;

  if (loading) return null;

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-4xl font-heading font-extrabold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your personal details, alerts, and security preferences.
        </p>
      </header>

      <form onSubmit={handleSaveChanges} className="space-y-6">
        {/* Profile Card */}
        <Card className="bg-card border-border shadow-xl">
          <CardHeader className="border-b border-border/40 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <User className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Profile Details</CardTitle>
                <CardDescription>Configure your workspace profile attributes.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="py-6 space-y-4">
            {isNameLocked && (
              <div className="flex items-start gap-3 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-500 text-sm mb-4">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>
                  You recently changed your name. For security reasons, you cannot change it again for another <strong>{daysUntilUnlock} days</strong> (Unlock Date: <strong>{unlockDate}</strong>).
                </p>
              </div>
            )}
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="flex items-center gap-2">
                  First Name {isNameLocked && <Lock className="w-3 h-3 text-muted-foreground" />}
                </Label>
                <Input
                  id="first_name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isNameLocked}
                  required
                  className={`border-border/60 focus-visible:ring-primary ${isNameLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name" className="flex items-center gap-2">
                  Last Name {isNameLocked && <Lock className="w-3 h-3 text-muted-foreground" />}
                </Label>
                <Input
                  id="last_name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isNameLocked}
                  required
                  className={`border-border/60 focus-visible:ring-primary ${isNameLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Card */}
        <Card className="bg-card border-border shadow-xl">
          <CardHeader className="border-b border-border/40 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Notifications</CardTitle>
                <CardDescription>Choose how you receive course updates and mentor session alerts.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="py-6 space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl border border-border/40 hover:bg-muted/10 transition-colors">
              <div>
                <h4 className="font-bold text-sm text-foreground mb-1">Email Alerts</h4>
                <p className="text-xs text-muted-foreground">Receive real-time emails when assignments are graded or sessions booked.</p>
              </div>
              <div
                onClick={() => setEmailAlerts(!emailAlerts)}
                className={`w-11 h-6 rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                  emailAlerts ? "bg-primary" : "bg-slate-800"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                    emailAlerts ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl border border-border/40 hover:bg-muted/10 transition-colors">
              <div>
                <h4 className="font-bold text-sm text-foreground mb-1">Weekly Digest</h4>
                <p className="text-xs text-muted-foreground">Get a weekly summary of cohort progress metrics and assignments.</p>
              </div>
              <div
                onClick={() => setDigest(!digest)}
                className={`w-11 h-6 rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                  digest ? "bg-primary" : "bg-slate-800"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                    digest ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security & Access Card */}
        <Card className="bg-card border-border shadow-xl">
          <CardHeader className="border-b border-border/40 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Security & Access</CardTitle>
                <CardDescription>Manage security clearances and workspace tokens.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="py-6 space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground font-mono">Curriculum Clearance:</span>
              <Badge variant="outline" className="text-primary border-primary/30">
                STUDENT_CLEARED
              </Badge>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-border/20 pt-3">
              <span className="text-muted-foreground font-mono">Workspace Sync Status:</span>
              <Badge variant="outline" className="text-blue-400 border-blue-400/30">
                CONNECTED
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Save button footer */}
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={isSaving || isNameLocked}
            className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 px-8 py-6 flex items-center gap-2 font-bold shadow-lg"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving Settings..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
