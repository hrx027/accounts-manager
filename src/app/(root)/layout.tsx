import { Sidebar } from "@/components/Sidebar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex flex-col bg-white dark:bg-black">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto flex flex-col bg-white dark:bg-black text-black dark:text-white md:ml-60 w-full">
          <div className="flex-1">
            {children}
          </div>
          <footer className="border-t border-gray-200 dark:border-gray-800 py-4 px-6 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>© {new Date().getFullYear()} All Rights Reserved. Created by Arihant & Hrithik</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
