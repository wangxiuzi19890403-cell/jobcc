import { Outlet } from "react-router";
import { Toaster } from "./ui/sonner";

export function RootLayout() {
  return (
    <div className="flex h-screen w-full flex-col bg-neutral-50">
      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
      
      <Toaster />
    </div>
  );
}