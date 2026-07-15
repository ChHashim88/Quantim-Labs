"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, ShieldCheck, Mail, User, Phone, MapPin, Globe, GraduationCap, Heart, Calendar, Camera, PlaySquare, Video, ExternalLink, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface Props {
  email: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function VerificationFormModal({ email, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [fetchingLinks, setFetchingLinks] = useState(true);
  const supabase = createClient();

  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [clickedLinks, setClickedLinks] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const { data, error } = await supabase.from('social_links').select('*').eq('is_active', true);
        if (!error && data) {
          // Filter out empty URLs
          setSocialLinks(data.filter(link => link.url && link.url.trim() !== ""));
        }
      } catch (err) {
        console.error("Failed to fetch social links", err);
      } finally {
        setFetchingLinks(false);
      }
    };
    fetchLinks();
  }, []);

  const handleLinkClick = (platform: string, url: string) => {
    setClickedLinks(prev => {
      const next = new Set(prev);
      next.add(platform);
      return next;
    });
    window.open(url, '_blank');
  };

  const allLinksClicked = socialLinks.length === 0 || socialLinks.every(link => clickedLinks.has(link.platform));

  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    age: "",
    phoneNumber: "",
    country: "",
    city: "",
    maritalStatus: "",
    education: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Not authenticated");
        return;
      }

      // Insert verification record
      const { error } = await supabase.from('student_verifications').insert({
        student_id: user.id,
        email: email,
        full_name: formData.fullName,
        gender: formData.gender,
        age: parseInt(formData.age),
        phone_number: formData.phoneNumber,
        country: formData.country,
        city: formData.city,
        marital_status: formData.maritalStatus,
        education: formData.education
      });

      if (error) {
        throw error;
      }

      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to verify account. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        <Card className="bg-card border-2 border-primary/30 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-blue-500 to-purple-500" />
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold font-heading">Get Verified</CardTitle>
            <CardDescription className="text-sm px-4">
              Complete your profile to unlock full platform access, track your internships, and earn certificates. All fields are required.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email Address</Label>
                  <Input value={email} disabled className="bg-muted cursor-not-allowed" />
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Full Name</Label>
                  <Input 
                    required name="fullName" value={formData.fullName} onChange={handleChange} 
                    placeholder="Enter your full legal name" 
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Gender</Label>
                  <Select required onValueChange={(val: any) => handleSelectChange('gender', val as string)}>
                    <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Age</Label>
                  <Input 
                    required type="number" min="10" max="100" name="age" value={formData.age} onChange={handleChange} 
                    placeholder="e.g. 21" 
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Phone Number</Label>
                  <Input 
                    required name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} 
                    placeholder="+1 (555) 000-0000" 
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5" /> Marital Status</Label>
                  <Select required onValueChange={(val: any) => handleSelectChange('maritalStatus', val as string)}>
                    <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single">Single</SelectItem>
                      <SelectItem value="Married">Married</SelectItem>
                      <SelectItem value="Divorced">Divorced</SelectItem>
                      <SelectItem value="Widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Country</Label>
                  <Input 
                    required name="country" value={formData.country} onChange={handleChange} 
                    placeholder="e.g. United States" 
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> City</Label>
                  <Input 
                    required name="city" value={formData.city} onChange={handleChange} 
                    placeholder="e.g. New York" 
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5" /> Current Study / Education</Label>
                  <Input 
                    required name="education" value={formData.education} onChange={handleChange} 
                    placeholder="e.g. B.S. in Computer Science" 
                  />
                </div>
              </div>

              {socialLinks.length > 0 && (
                <div className="pt-4 border-t border-border space-y-4">
                  <div>
                    <Label className="text-sm font-bold text-slate-800 dark:text-slate-200">Required Action: Follow our Socials</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      You must follow our official channels to complete your verification and stay updated.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {socialLinks.map((link) => {
                      const isClicked = clickedLinks.has(link.platform);
                      
                      let Icon = Globe;
                      if (link.platform === "Instagram") Icon = Camera;
                      if (link.platform === "TikTok") Icon = Video;
                      if (link.platform === "YouTube") Icon = PlaySquare;
                      if (link.platform === "LinkedIn") Icon = Globe;

                      return (
                        <Button
                          key={link.id}
                          type="button"
                          variant={isClicked ? "outline" : "default"}
                          onClick={() => handleLinkClick(link.platform, link.url)}
                          className={`w-full justify-start gap-2 h-10 ${isClicked ? "border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400" : ""}`}
                        >
                          {isClicked ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                          <span className="truncate flex-1 text-left">{link.platform}</span>
                          {!isClicked && <ExternalLink className="w-3 h-3 opacity-50" />}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-border">
                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
                  disabled={loading || fetchingLinks || !allLinksClicked}
                >
                  {loading ? "Verifying..." : !allLinksClicked ? "Please Follow All Channels" : "Submit Verification"}
                  {!loading && allLinksClicked && <ShieldCheck className="w-5 h-5" />}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
