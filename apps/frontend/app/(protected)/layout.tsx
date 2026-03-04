import { PropsWithChildren } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function ProtectedLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
