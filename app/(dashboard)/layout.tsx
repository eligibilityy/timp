import { TopNav } from "@/components/dashboard/navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-100 dark:bg-black">
      <main className="mx-auto w-full max-w-4xl  flex-1 px-4 py-8 pb-24">
        {children}
      </main>
      <TopNav />
    </div>
  );
}
