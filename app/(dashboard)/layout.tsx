import { TopNav } from "@/components/dashboard/navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 dark:bg-black overflow-x-clip">
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-24">
        {children}
      </main>
      <TopNav />
    </div>
  );
}
