
import React from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { UserProfile } from "@/types";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarTrigger,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2,
  Calendar,
  ChevronDown,
  ClipboardList,
  FileSpreadsheet,
  Home,
  LogOut,
  Menu,
  Settings,
  User,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  user?: UserProfile;
}

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

export const MainLayout: React.FC<MainLayoutProps> = ({ user }) => {
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

  // Select menu items based on user role
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
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full bg-system-gray-100 dark:bg-system-gray-800">
        <header className="h-16 bg-white dark:bg-system-gray-800 shadow-sm z-10 flex items-center px-4 justify-between">
          <div className="flex items-center">
            <SidebarTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SidebarTrigger>
            <div className="ml-4 flex items-center">
              <h1 
                className="text-xl font-bold text-system-blue-600 dark:text-system-blue-400 cursor-pointer"
                onClick={() => navigate("/")}
              >
                InterviewPro
              </h1>
              <Badge 
                variant="outline" 
                className="ml-2 bg-system-blue-100 text-system-blue-600 border-system-blue-200"
              >
                Beta
              </Badge>
            </div>
          </div>
          {user && (
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 flex items-center gap-1">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url} alt={user.firstName} />
                      <AvatarFallback className="bg-system-blue-500 text-white">
                        {getInitials(user.firstName, user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline-flex">
                      {user.firstName} {user.lastName}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </header>
        <div className="flex flex-1">
          <Sidebar className="border-r border-system-gray-200 dark:border-system-gray-700 bg-white dark:bg-system-gray-800">
            <SidebarHeader className="p-4">
              <div className="flex items-center gap-2">
                {user && (
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
                )}
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {menuItems().map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className="flex items-center gap-3"
                          onClick={() => navigate(item.url)}
                        >
                          <button>
                            <item.icon className="h-5 w-5" />
                            <span>{item.title}</span>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="p-4">
              <div className="text-xs text-muted-foreground">
                <p>© 2025 InterviewPro</p>
                <p>Version 1.0.0</p>
              </div>
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
