import { PropsWithChildren } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Toaster } from "sonner";

export default function ProtectedLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-4 lg:p-8 overflow-auto pt-16 lg:pt-8">{children}</main>
      <Toaster position="top-right" richColors />
    </div>
  );
}
