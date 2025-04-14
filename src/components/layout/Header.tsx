import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, Music, Moon, Sun } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserMenu } from "./UserMenu";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <header className="h-16 bg-white dark:bg-system-gray-800 shadow-sm z-50 flex items-center px-4 justify-between sticky top-0 left-0 right-0">
      <div className="flex items-center">
        <SidebarTrigger>
          <Button variant="ghost" size="icon" className="hover:bg-system-blue-50 dark:hover:bg-system-blue-900/20">
            <Menu className="h-5 w-5" />
          </Button>
        </SidebarTrigger>
        <div className="ml-4 flex items-center">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate("/")}>
            {/* <Music className="h-6 w-6 text-system-blue-600 dark:text-system-blue-400 group-hover:text-system-blue-700 dark:group-hover:text-system-blue-300 transition-colors" /> */}
            <h1 className="text-xl font-bold text-system-blue-600 dark:text-system-blue-400 group-hover:text-system-blue-700 dark:group-hover:text-system-blue-300 transition-colors">
              AnthemHire
            </h1>
          </div>
          <Badge 
            variant="outline" 
            className="ml-2 bg-system-blue-100 text-system-blue-600 border-system-blue-200 dark:bg-system-blue-900/30 dark:text-system-blue-400 dark:border-system-blue-800"
          >
            Beta
          </Badge>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleDarkMode}
          className="hover:bg-system-blue-50 dark:hover:bg-system-blue-900/20"
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
        {user && <UserMenu user={user} />}
      </div>
    </header>
  );
};
