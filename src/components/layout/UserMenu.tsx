
import React from "react";
import { useNavigate } from "react-router-dom";
import { UserProfile } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Settings } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

interface UserMenuProps {
  user: UserProfile;
}

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

export const UserMenu: React.FC<UserMenuProps> = ({ user }) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out. See you soon!",
      });
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      toast({
        title: "Logout failed",
        description: "There was a problem signing you out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center space-x-4">
      {/* <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleLogout}
        className="hidden md:flex"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </Button> */}
      
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
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            <div className="mt-1 text-xs px-1 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-sm inline-block">
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </div>
          </div>
          <DropdownMenuSeparator />
          {/* <DropdownMenuItem onClick={() => navigate("/profile")}>
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem> */}
          <DropdownMenuItem onClick={() => navigate("/settings")}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
