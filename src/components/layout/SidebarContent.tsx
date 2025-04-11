import React from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";

interface SidebarContentProps {
  user?: UserProfile;
}

export const SidebarContentComponent: React.FC<SidebarContentProps> = ({ user }) => {
  const navigate = useNavigate();

  const adminMenuItems = [
    { title: "Dashboard", icon: Home, url: "/dashboard" },
    { title: "Jobs", icon: Building2, url: "/jobs" },
    { title: "Candidates", icon: Users, url: "/candidates" },
    { title: "Assessments", icon: ClipboardList, url: "/assessments" },
    { title: "Interviews", icon: Calendar, url: "/interviews" },
    { title: "Reports", icon: FileSpreadsheet, url: "/reports" },
    { title: "Settings", icon: Settings, url: "/settings" },
  ];

  const hrMenuItems = [
    { title: "Dashboard", icon: Home, url: "/dashboard" },
    { title: "Jobs", icon: Building2, url: "/jobs" },
    { title: "Candidates", icon: Users, url: "/candidates" },
    { title: "Interviews", icon: Calendar, url: "/interviews" },
  ];

  const interviewerMenuItems = [
    { title: "Dashboard", icon: Home, url: "/dashboard" },
    { title: "My Interviews", icon: Calendar, url: "/interviews" },
    { title: "Assessments", icon: ClipboardList, url: "/assessments" },
  ];

  const candidateMenuItems = [
    { title: "Dashboard", icon: Home, url: "/dashboard" },
    { title: "My Applications", icon: ClipboardList, url: "/applications" },
    { title: "Assessments", icon: FileSpreadsheet, url: "/assessments" },
    { title: "Job Listings", icon: Building2, url: "/jobs" },
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
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
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
    <div>
      <Badge 
        variant="secondary" 
        className={cn(
          "capitalize", 
          user.role === "admin" ? "bg-system-blue-100 text-system-blue-600" :
          user.role === "hr" ? "bg-system-green-100 text-system-green-600" :
          user.role === "interviewer" ? "bg-system-yellow-100 text-system-yellow-500" :
          "bg-system-gray-200 text-system-gray-600"
        )}
      >
        {user.role}
      </Badge>
    </div>
  );
};

export const SidebarFooterContent: React.FC = () => {
  return (
    <div className="text-xs text-muted-foreground">
      <p>© 2025 InterviewPro</p>
      <p>Version 1.0.0</p>
    </div>
  );
};
