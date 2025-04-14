import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserProfile } from "@/types";
import {
  SidebarContent as SidebarContentUI,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Building2,
  Calendar,
  ClipboardList,
  FileSpreadsheet,
  Home,
  Settings,
  Users,
  Music,
  Briefcase,
  LineChart,
  GraduationCap,
  Award,
} from "lucide-react";

interface SidebarContentProps {
  user?: UserProfile;
}

export const SidebarContentComponent: React.FC<SidebarContentProps> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const adminMenuItems = [
    { title: "Dashboard", icon: Home, url: "/dashboard" },
    { title: "Jobs", icon: Briefcase, url: "/jobs" },
    { title: "Candidates", icon: Users, url: "/candidates" },
    { title: "Assessments", icon: Award, url: "/assessments" },
    { title: "Interviews", icon: Calendar, url: "/interviews" },
    { title: "Reports", icon: LineChart, url: "/reports" },
    { title: "Settings", icon: Settings, url: "/settings" },
  ];

  const hrMenuItems = [
    { title: "Dashboard", icon: Home, url: "/dashboard" },
    { title: "Jobs", icon: Briefcase, url: "/jobs" },
    { title: "Candidates", icon: Users, url: "/candidates" },
    { title: "Assessments", icon: Award, url: "/assessments" },
    { title: "Interviews", icon: Calendar, url: "/interviews" },
    { title: "Settings", icon: Settings, url: "/settings" },
  ];

  const interviewerMenuItems = [
    { title: "Dashboard", icon: Home, url: "/dashboard" },
    { title: "My Interviews", icon: Calendar, url: "/interviews" },
    { title: "Assessments", icon: Award, url: "/assessments" },
    { title: "Settings", icon: Settings, url: "/settings" },
  ];

  const candidateMenuItems = [
    { title: "Dashboard", icon: Home, url: "/dashboard" },
    { title: "My Applications", icon: ClipboardList, url: "/applications" },
    { title: "Assessments", icon: Award, url: "/assessments" },
    { title: "Job Listings", icon: Briefcase, url: "/jobs" },
    { title: "Settings", icon: Settings, url: "/settings" },
  ];

  const menuItems = () => {
    if (!user) return candidateMenuItems;
    switch (user.role) {
      case "admin":
        return adminMenuItems;
      case "hr":
        return hrMenuItems;
      case "interviewer":
        return interviewerMenuItems;
      case "candidate":
        return candidateMenuItems;
      default:
        return candidateMenuItems;
    }
  };

  // Check if current path matches a menu item
  const isActive = (url: string) => {
    return location.pathname === url || location.pathname.startsWith(`${url}/`);
  };

  return (
    <>
      <SidebarContentUI>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems().map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.url)}
                    className={cn(
                      isActive(item.url) ? 
                        "bg-system-blue-50 text-system-blue-600 dark:bg-system-blue-900/20 dark:text-system-blue-400" : 
                        "hover:bg-gray-50 dark:hover:bg-gray-800"
                    )}
                  >
                    <item.icon className={cn(
                      "h-5 w-5 mr-3",
                      isActive(item.url) ? 
                        "text-system-blue-600 dark:text-system-blue-400" : 
                        "text-gray-500 dark:text-gray-400"
                    )} />
                    <span>{item.title}</span>
                    {item.title === "Assessments" && user?.role === "candidate" && (
                      <Badge className="ml-auto bg-system-blue-100 text-system-blue-600 dark:bg-system-blue-900/30 dark:text-system-blue-400">
                        New
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContentUI>
    </>
  );
};

export const SidebarHeader: React.FC<{user?: UserProfile}> = ({ user }) => {
  if (!user) return null;
  
  return (
    <div className="px-3 py-3">
      <div className="flex items-center gap-3 mb-2">
        {user.avatar_url ? (
          <img src={user.avatar_url} alt={user.firstName} className="w-9 h-9 rounded-full" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-system-blue-100 dark:bg-system-blue-900/30 flex items-center justify-center">
            <span className="text-system-blue-600 dark:text-system-blue-400 font-medium">
              {user.firstName && user.firstName[0]}
              {user.lastName && user.lastName[0]}
            </span>
          </div>
        )}
        <div>
          <p className="font-medium">{user.firstName} {user.lastName}</p>
          <Badge 
            variant="secondary" 
            className={cn(
              "capitalize text-xs", 
              user.role === "admin" ? "bg-system-blue-100 text-system-blue-600 dark:bg-system-blue-900/30 dark:text-system-blue-400" :
              user.role === "hr" ? "bg-system-green-100 text-system-green-600 dark:bg-system-green-900/30 dark:text-system-green-400" :
              user.role === "interviewer" ? "bg-system-yellow-100 text-system-yellow-500 dark:bg-system-yellow-900/30 dark:text-system-yellow-400" :
              "bg-system-gray-200 text-system-gray-600 dark:bg-system-gray-700 dark:text-system-gray-300"
            )}
          >
            {user.role}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export const SidebarFooterContent: React.FC = () => {
  return (
    <div className="px-4 py-4 text-xs text-muted-foreground border-t border-border">
      <p>© 2025 AnthemHire</p>
    </div>
  );
};
