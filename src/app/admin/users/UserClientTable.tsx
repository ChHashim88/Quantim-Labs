"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, MoreVertical, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { updateUserRole, deleteUserProfile } from "../actions";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function UserClientTable({ profiles }: { profiles: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleRoleChange(userId: string, newRole: string) {
    setLoadingId(userId);
    const result = await updateUserRole(userId, newRole);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("User role updated successfully");
    }
    setLoadingId(null);
  }

  async function handleDelete(userId: string) {
    if (!confirm("Are you sure you want to delete this user profile?")) return;
    setLoadingId(userId);
    const result = await deleteUserProfile(userId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("User deleted successfully");
    }
    setLoadingId(null);
  }

  return (
    <table className="w-full text-sm text-left">
      <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
        <tr>
          <th className="px-6 py-4 font-medium">User</th>
          <th className="px-6 py-4 font-medium">Role</th>
          <th className="px-6 py-4 font-medium">Status</th>
          <th className="px-6 py-4 font-medium">Joined</th>
          <th className="px-6 py-4 font-medium text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {profiles?.map((profile) => (
          <tr key={profile.id} className={`hover:bg-muted/30 transition-colors ${loadingId === profile.id ? 'opacity-50' : ''}`}>
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {profile.first_name?.[0]}{profile.last_name?.[0]}
                </div>
                <div>
                  <p className="font-medium text-foreground">{profile.first_name} {profile.last_name}</p>
                  <p className="text-xs text-muted-foreground">{profile.email}</p>
                </div>
              </div>
            </td>
            <td className="px-6 py-4">
              <Badge variant={profile.role === 'SUPER_ADMIN' ? 'default' : 'secondary'} className="font-medium">
                {profile.role === 'SUPER_ADMIN' && <Shield className="w-3 h-3 mr-1" />}
                {profile.role}
              </Badge>
            </td>
            <td className="px-6 py-4">
              <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">Active</Badge>
            </td>
            <td className="px-6 py-4 text-muted-foreground">
              {new Date(profile.created_at).toLocaleDateString()}
            </td>
            <td className="px-6 py-4 text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" disabled={loadingId === profile.id}>
                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleRoleChange(profile.id, 'STUDENT')}>
                    Make Student
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleRoleChange(profile.id, 'MENTOR')}>
                    Make Mentor
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleRoleChange(profile.id, 'ADMIN')}>
                    Make Admin
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDelete(profile.id)} className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete Profile
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </td>
          </tr>
        ))}

        {(!profiles || profiles.length === 0) && (
          <tr>
            <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
              No users found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
