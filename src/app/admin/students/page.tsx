import { UsersManagerClient } from "@/components/admin/UsersManagerClient";

export default function StudentsPage() {
  return (
    <UsersManagerClient 
      roleName="student" 
      title="Students Management" 
      description="Enterprise management and demographic analytics for Students." 
    />
  );
}
