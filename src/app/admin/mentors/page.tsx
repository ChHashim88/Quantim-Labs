import { UsersManagerClient } from "@/components/admin/UsersManagerClient";

export default function MentorsPage() {
  return (
    <UsersManagerClient 
      roleName="mentor" 
      title="Mentors Management" 
      description="Enterprise management and demographic analytics for Mentors." 
    />
  );
}
