import { AdminHeader } from "@/components/layout/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <main className="flex-1 overflow-y-auto bg-background">
      <AdminHeader />
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
