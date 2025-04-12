import { Sidebar } from "@/components/Sidebar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto flex flex-col">
          <div className="flex-1">
            {children}
          </div>
          <footer className="border-t py-4 px-6 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} All Rights Reserved. Created by Arihant & Hrithik</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
