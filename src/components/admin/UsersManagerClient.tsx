"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Download, Search, Users, User, UserCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function UsersManagerClient({ roleName, title, description }: { roleName: string, title: string, description: string }) {
  const [users, setUsers] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<Record<string, any>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchUsers(true);

    const profilesSub = supabase.channel('profiles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchUsers(false);
      })
      .subscribe();

    let verificationsSub: any = null;
    if (roleName.toUpperCase() === 'STUDENT') {
      verificationsSub = supabase.channel('verifications-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'student_verifications' }, () => {
          fetchUsers(false);
        })
        .subscribe();
    }

    return () => {
      supabase.removeChannel(profilesSub);
      if (verificationsSub) {
        supabase.removeChannel(verificationsSub);
      }
    };
  }, [roleName]);

  async function fetchUsers(showLoading = true) {
    if (showLoading) setLoading(true);
    let query = supabase.from('profiles').select('*').order('created_at', { ascending: false });
    
    if (roleName.toUpperCase() === 'ADMIN') {
      query = query.in('role', ['ADMIN', 'SUPER_ADMIN']);
    } else {
      query = query.eq('role', roleName.toUpperCase());
    }

    const { data, error } = await query;
      
    if (error) {
      console.error("Error fetching users:", error);
    }
    
    if (data) {
      setUsers(data);
      
      if (roleName.toUpperCase() === 'STUDENT') {
        const { data: vData, error: vError } = await supabase.from('student_verifications').select('*');
        if (!vError && vData) {
          const vMap: Record<string, any> = {};
          vData.forEach(v => {
            vMap[v.student_id] = v;
          });
          setVerifications(vMap);
        }
      }
    }
    if (showLoading) setLoading(false);
  }

  const filteredUsers = users.filter(u => 
    (u.first_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.last_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.skills || []).join(" ").toLowerCase().includes(search.toLowerCase())
  );

  const maleCount = users.filter(u => u.gender === 'Male').length;
  const femaleCount = users.filter(u => u.gender === 'Female').length;
  
  // Recent signups (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentCount = users.filter(u => new Date(u.created_at) > thirtyDaysAgo).length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-1">{description}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total {title}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Male</CardTitle>
            <User className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maleCount}</div>
            <p className="text-xs text-muted-foreground">{users.length ? Math.round((maleCount / users.length) * 100) : 0}% of total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Female</CardTitle>
            <User className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{femaleCount}</div>
            <p className="text-xs text-muted-foreground">{users.length ? Math.round((femaleCount / users.length) * 100) : 0}% of total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Signups</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{recentCount}</div>
            <p className="text-xs text-muted-foreground">in the last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <div className="border border-border rounded-xl bg-card shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder={`Search ${title}...`} 
              className="pl-9 h-9" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Contact</th>
                {roleName.toLowerCase() === 'student' && <th className="px-6 py-4 font-semibold">Status / Details</th>}
                <th className="px-6 py-4 font-semibold">Gender</th>
                {roleName.toLowerCase() !== 'student' && <th className="px-6 py-4 font-semibold">Skills</th>}
                <th className="px-6 py-4 font-semibold">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Loading data...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No records found.</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.avatar_url ? (
                           <img src={user.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                           <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                             {(user.first_name || 'U')[0]}
                           </div>
                        )}
                        <div>
                          <div className="font-semibold text-foreground">{user.first_name} {user.last_name}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">{user.bio || 'No bio provided'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-foreground">{user.email || 'No Email'}</div>
                      {roleName.toLowerCase() === 'student' && verifications[user.id] && (
                        <div className="text-xs text-muted-foreground mt-1">{verifications[user.id].phone_number}</div>
                      )}
                    </td>
                    {roleName.toLowerCase() === 'student' && (
                      <td className="px-6 py-4">
                        {verifications[user.id] ? (
                          <div className="flex flex-col gap-1">
                            <Badge variant="default" className="w-fit bg-emerald-500 hover:bg-emerald-600 gap-1">
                              <UserCheck className="w-3 h-3" /> Verified
                            </Badge>
                            <span className="text-xs text-muted-foreground mt-1">
                              {verifications[user.id].city}, {verifications[user.id].country}
                            </span>
                            <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                              {verifications[user.id].education}
                            </span>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-amber-500 border-amber-500/30">
                            Unverified
                          </Badge>
                        )}
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={user.gender === 'Male' ? 'text-blue-500 border-blue-500/30' : user.gender === 'Female' ? 'text-pink-500 border-pink-500/30' : ''}>
                        {roleName.toLowerCase() === 'student' && verifications[user.id]?.gender ? verifications[user.id].gender : (user.gender || 'Unknown')}
                      </Badge>
                      {roleName.toLowerCase() === 'student' && verifications[user.id]?.age && (
                        <div className="text-xs text-muted-foreground mt-1">{verifications[user.id].age} yrs, {verifications[user.id].marital_status}</div>
                      )}
                    </td>
                    {roleName.toLowerCase() !== 'student' && (
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[250px]">
                          {(user.skills || []).slice(0, 3).map((skill: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-[10px] py-0">{skill}</Badge>
                          ))}
                          {(user.skills?.length > 3) && <Badge variant="secondary" className="text-[10px] py-0">+{user.skills.length - 3}</Badge>}
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
