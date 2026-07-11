import { UsersManagerClient } from "@/components/admin/UsersManagerClient";

export default function UsersPage() {
  return (
    <UsersManagerClient 
      roleName="admin" 
      title="Admins Management" 
      description="Enterprise management and demographic analytics for Platform Admins." 
    />
  );
}
