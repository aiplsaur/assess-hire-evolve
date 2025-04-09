
import React from "react";
import { useNavigate } from "react-router-dom";
import { UserProfile } from "@/types";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu } from "lucide-react";
import { UserMenu } from "./UserMenu";

interface HeaderProps {
  user?: UserProfile;
}

export const Header: React.FC<HeaderProps> = ({ user }) => {
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-white dark:bg-system-gray-800 shadow-sm z-10 flex items-center px-4 justify-between">
      <div className="flex items-center">
        <SidebarTrigger>
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
      {user && <UserMenu user={user} />}
    </header>
  );
};
