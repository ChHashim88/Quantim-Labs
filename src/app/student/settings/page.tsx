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
        <h1 className="text-4xl lg:text-5xl font-heading font-extrabold tracking-tighter uppercase">SYSTEM_CONFIGURATION</h1>
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-2 flex items-center gap-2">
          <span className="w-1 h-1 bg-primary"></span> MANAGE PERSONAL DETAILS, ALERTS, AND SECURITY PREFERENCES
        </p>
      </header>

      <form onSubmit={handleSaveChanges} className="space-y-6">
        {/* Profile Card */}
        <div className="glass-panel corner-accent">
          <div className="p-6 border-b border-border/20 flex items-center gap-4">
            <div className="w-12 h-12 rounded-sm bg-primary/10 flex items-center justify-center text-primary border border-primary/20 glow-primary active-glow">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-xl uppercase tracking-tight text-foreground">PROFILE_DETAILS</h2>
              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">CONFIGURE YOUR WORKSPACE PROFILE ATTRIBUTES.</p>
            </div>
          </div>
          <div className="p-8 space-y-6">
            {isNameLocked && (
              <div className="flex items-start gap-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded-sm text-orange-500 text-[10px] font-mono tracking-widest uppercase mb-6 glow-orange">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  SYSTEM LOCK INITIATED: NAME MODIFICATION PROTOCOL RESTRICTED. SECURITY OVERRIDE UNAVAILABLE FOR ANOTHER <span className="font-bold">{daysUntilUnlock} DAYS</span> (UNLOCK_DATE: <span className="font-bold">{unlockDate}</span>).
                </p>
              </div>
            )}
            
            <div className="grid sm:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="first_name" className="flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
                  GIVEN_NAME {isNameLocked && <Lock className="w-3 h-3 text-orange-500/70" />}
                </Label>
                <Input
                  id="first_name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isNameLocked}
                  required
                  className={`h-12 rounded-sm grid-bg border border-border/50 font-mono text-[10px] tracking-widest uppercase px-4 text-foreground focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary transition-all ${isNameLocked ? 'opacity-50 cursor-not-allowed border-orange-500/20 text-muted-foreground' : ''}`}
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="last_name" className="flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
                  SURNAME {isNameLocked && <Lock className="w-3 h-3 text-orange-500/70" />}
                </Label>
                <Input
                  id="last_name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isNameLocked}
                  required
                  className={`h-12 rounded-sm grid-bg border border-border/50 font-mono text-[10px] tracking-widest uppercase px-4 text-foreground focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary transition-all ${isNameLocked ? 'opacity-50 cursor-not-allowed border-orange-500/20 text-muted-foreground' : ''}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Card */}
        <div className="glass-panel corner-accent">
          <div className="p-6 border-b border-border/20 flex items-center gap-4">
            <div className="w-12 h-12 rounded-sm bg-primary/10 flex items-center justify-center text-primary border border-primary/20 glow-primary active-glow">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-xl uppercase tracking-tight text-foreground">COMMUNICATION_PROTOCOLS</h2>
              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">CHOOSE HOW YOU RECEIVE SYSTEM UPDATES AND ALERTS.</p>
            </div>
          </div>
          <div className="p-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-sm border border-border/30 grid-bg hover:border-primary/50 transition-colors gap-6 group">
              <div>
                <h4 className="font-mono font-bold text-xs uppercase tracking-widest text-foreground mb-2 flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-sm ${emailAlerts ? 'bg-primary glow-primary' : 'bg-muted-foreground'}`}></span>
                  REALTIME_TRANSMISSIONS
                </h4>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground leading-relaxed pl-3.5">RECEIVE IMMEDIATE SYSTEM BROADCASTS WHEN METRICS ARE UPDATED OR PROTOCOLS INITIATED.</p>
              </div>
              <div
                onClick={() => setEmailAlerts(!emailAlerts)}
                className={`w-14 h-6 rounded-sm p-1 cursor-pointer transition-colors duration-300 relative shrink-0 ${
                  emailAlerts ? "bg-primary/20 border border-primary/50 glow-primary" : "bg-muted border border-border"
                }`}
              >
                <div
                  className={`bg-foreground w-4 h-4 rounded-sm shadow-md transform transition-transform duration-300 ${
                    emailAlerts ? "translate-x-7 bg-primary shadow-[0_0_10px_rgba(var(--primary),0.8)]" : "translate-x-0 bg-muted-foreground"
                  }`}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-sm border border-border/30 grid-bg hover:border-primary/50 transition-colors gap-6 group">
              <div>
                <h4 className="font-mono font-bold text-xs uppercase tracking-widest text-foreground mb-2 flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-sm ${digest ? 'bg-primary glow-primary' : 'bg-muted-foreground'}`}></span>
                  BATCH_SYNTHESIS
                </h4>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground leading-relaxed pl-3.5">GENERATE A COMPILED SUMMARY LOG OF COHORT PROGRESS METRICS AT REGULAR INTERVALS.</p>
              </div>
              <div
                onClick={() => setDigest(!digest)}
                className={`w-14 h-6 rounded-sm p-1 cursor-pointer transition-colors duration-300 relative shrink-0 ${
                  digest ? "bg-primary/20 border border-primary/50 glow-primary" : "bg-muted border border-border"
                }`}
              >
                <div
                  className={`bg-foreground w-4 h-4 rounded-sm shadow-md transform transition-transform duration-300 ${
                    digest ? "translate-x-7 bg-primary shadow-[0_0_10px_rgba(var(--primary),0.8)]" : "translate-x-0 bg-muted-foreground"
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security & Access Card */}
        <div className="glass-panel corner-accent">
          <div className="p-6 border-b border-border/20 flex items-center gap-4">
            <div className="w-12 h-12 rounded-sm bg-primary/10 flex items-center justify-center text-primary border border-primary/20 glow-primary active-glow">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-xl uppercase tracking-tight text-foreground">SECURITY_AND_ACCESS</h2>
              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">MANAGE SECURITY CLEARANCES AND WORKSPACE TOKENS.</p>
            </div>
          </div>
          <div className="p-8 space-y-6">
            <div className="flex justify-between items-center bg-muted/5 p-4 rounded-sm border border-border/20">
              <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">CURRICULUM_CLEARANCE:</span>
              <div className="text-[9px] font-mono tracking-widest uppercase border border-primary/30 px-3 py-1.5 rounded-sm bg-primary/10 text-primary glow-primary">
                STUDENT_CLEARED
              </div>
            </div>
            <div className="flex justify-between items-center bg-muted/5 p-4 rounded-sm border border-border/20">
              <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">WORKSPACE_SYNC_STATUS:</span>
              <div className="text-[9px] font-mono tracking-widest uppercase border border-blue-500/30 px-3 py-1.5 rounded-sm bg-blue-500/10 text-blue-500 glow-blue">
                SECURE_CONNECTION
              </div>
            </div>
          </div>
        </div>

        {/* Save button footer */}
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={isSaving || isNameLocked}
            className="rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 h-auto flex items-center gap-2 font-mono text-[10px] font-bold tracking-widest uppercase glow-primary transition-all duration-300"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "TRANSMITTING_DATA..." : "COMMIT_CHANGES"}
          </Button>
        </div>
      </form>
    </div>
  );
}
