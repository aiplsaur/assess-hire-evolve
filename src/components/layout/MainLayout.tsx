
import React from "react";
import { Outlet } from "react-router-dom";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Header } from "./Header";
import { SidebarContentComponent, SidebarHeader as SidebarHeaderContent, SidebarFooterContent } from "./SidebarContent";
import { useAuth } from "@/context/AuthContext";

export const MainLayout: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full bg-system-gray-100 dark:bg-system-gray-800">
        <Header />
        <div className="flex flex-1">
          <Sidebar className="border-r border-system-gray-200 dark:border-system-gray-700 bg-white dark:bg-system-gray-800">
            <SidebarHeader className="p-4">
              <SidebarHeaderContent user={user} />
            </SidebarHeader>
            <SidebarContentComponent user={user} />
            <SidebarFooter className="p-4">
              <SidebarFooterContent />
            </SidebarFooter>
          </Sidebar>
          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
