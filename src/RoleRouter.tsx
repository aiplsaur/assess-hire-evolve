import React from 'react';
import { useAuth } from '@/context/AuthContext';

interface RoleRouterProps {
  roleMap: {
    [key: string]: React.ReactNode;
  };
  defaultComponent?: React.ReactNode;
}

/**
 * RoleRouter component that renders different components based on the user's role
 * 
 * @param {Object} roleMap - Map of roles to components
 * @param {React.ReactNode} defaultComponent - Default component to render if no role match
 * @returns The component that matches the user's role, or the default component
 */
const RoleRouter: React.FC<RoleRouterProps> = ({ roleMap, defaultComponent }) => {
  const { user } = useAuth();
  
  if (!user || !user.role) {
    return <>{defaultComponent}</> || null;
  }
  
  const Component = roleMap[user.role];
  
  if (Component) {
    return <>{Component}</>;
  }
  
  return <>{defaultComponent}</> || null;
};

export default RoleRouter; 