import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { settingsService } from "@/services";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const Settings: React.FC = () => {
  const { user } = useAuth();
  const { isDarkMode, setDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Profile state
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    location: ""
  });
  
  // Preferences state
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    darkMode: false
  });
  
  // Company information state
  const [company, setCompany] = useState({
    name: "",
    website: "",
    industry: "",
    size: ""
  });
  
  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    newApplications: true,
    interviewSchedule: true,
    assessmentCompleted: true,
    teamActivity: false,
    inAppAll: true,
    inAppMessages: true
  });
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  // Two-factor authentication state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  
  // Load user settings data
  useEffect(() => {
    const loadUserSettings = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        // Load user preferences
        const userPreferences = await settingsService.getUserPreferences(user.id);
        
        if (userPreferences) {
          setPreferences({
            emailNotifications: userPreferences.email_notifications || false,
            darkMode: isDarkMode
          });
          
          // Load notification settings if they exist
          if (userPreferences.notifications) {
            setNotificationSettings({
              newApplications: userPreferences.notifications.new_applications || false,
              interviewSchedule: userPreferences.notifications.interview_schedule || false,
              assessmentCompleted: userPreferences.notifications.assessment_completed || false,
              teamActivity: userPreferences.notifications.team_activity || false,
              inAppAll: userPreferences.notifications.in_app_all || false,
              inAppMessages: userPreferences.notifications.in_app_messages || false
            });
          }
          
          // Load 2FA settings
          setTwoFactorEnabled(userPreferences.two_factor_enabled || false);
        }
        
        // Load company information
        const companyInfo = await settingsService.getCompanyInfo(user.id);
        
        if (companyInfo) {
          setCompany({
            name: companyInfo.name || "",
            website: companyInfo.website || "",
            industry: companyInfo.industry || "",
            size: companyInfo.size || ""
          });
        }
        
        // Set profile info from user
        setProfile({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          phoneNumber: user.phone || "",
          location: user.location || ""
        });
      } catch (error) {
        console.error("Error loading settings:", error);
        toast({
          title: "Error loading settings",
          description: "Your settings could not be loaded. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadUserSettings();
  }, [user, isDarkMode]);
  
  // Handle save account preferences
  const handleSavePreferences = async () => {
    if (!user?.id) return;
    
    try {
      setSaving(true);
      
      await settingsService.updatePreferences(user.id, {
        email_notifications: preferences.emailNotifications,
        dark_mode: preferences.darkMode
      });
      
      // Update theme using the ThemeContext
      await setDarkMode(preferences.darkMode);
      
      toast({
        title: "Preferences saved",
        description: "Your preferences have been updated successfully."
      });
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({
        title: "Error saving preferences",
        description: "Your preferences could not be saved. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Handle save profile
  const handleSaveProfile = async () => {
    if (!user?.id) return;
    
    try {
      setSaving(true);
      
      await settingsService.updateProfile(user.id, profile);
      
      toast({
        title: "Profile saved",
        description: "Your profile has been updated successfully."
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error saving profile",
        description: "Your profile could not be saved. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Handle save company info
  const handleSaveCompany = async () => {
    if (!user?.id) return;
    
    try {
      setSaving(true);
      
      await settingsService.updateCompanyInfo(user.id, {
        name: company.name,
        website: company.website,
        industry: company.industry,
        size: company.size
      });
      
      toast({
        title: "Company information saved",
        description: "Your company information has been updated successfully."
      });
    } catch (error) {
      console.error("Error saving company info:", error);
      toast({
        title: "Error saving company information",
        description: "Your company information could not be saved. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Handle save notification settings
  const handleSaveNotifications = async () => {
    if (!user?.id) return;
    
    try {
      setSaving(true);
      
      await settingsService.updateNotificationSettings(user.id, {
        new_applications: notificationSettings.newApplications,
        interview_schedule: notificationSettings.interviewSchedule,
        assessment_completed: notificationSettings.assessmentCompleted,
        team_activity: notificationSettings.teamActivity,
        in_app_all: notificationSettings.inAppAll,
        in_app_messages: notificationSettings.inAppMessages
      });
      
      toast({
        title: "Notification settings saved",
        description: "Your notification settings have been updated successfully."
      });
    } catch (error) {
      console.error("Error saving notification settings:", error);
      toast({
        title: "Error saving notification settings",
        description: "Your notification settings could not be saved. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Handle password change
  const handleChangePassword = async () => {
    if (!user?.id) return;
    
    // Validate password data
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match.",
        variant: "destructive",
      });
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setSaving(true);
      
      await settingsService.changePassword(
        user.id,
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      // Reset password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      
      toast({
        title: "Password changed",
        description: "Your password has been changed successfully."
      });
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        title: "Error changing password",
        description: error.message || "Your password could not be changed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Handle two-factor authentication toggle
  const handleTwoFactorToggle = async (enabled: boolean) => {
    if (!user?.id) return;
    
    try {
      setSaving(true);
      
      await settingsService.updateTwoFactorAuth(user.id, enabled);
      setTwoFactorEnabled(enabled);
      
      toast({
        title: enabled ? "Two-factor authentication enabled" : "Two-factor authentication disabled",
        description: enabled 
          ? "Your account is now more secure with two-factor authentication." 
          : "Two-factor authentication has been disabled for your account."
      });
    } catch (error) {
      console.error("Error updating two-factor authentication:", error);
      toast({
        title: "Error updating two-factor authentication",
        description: "Your two-factor authentication setting could not be updated. Please try again.",
        variant: "destructive",
      });
      // Revert the switch state
      setTwoFactorEnabled(!enabled);
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-system-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and application preferences
        </p>
      </div>

      <Tabs defaultValue="account" className="space-y-4">
        <div className="overflow-x-auto">
          <TabsList className="inline-flex w-auto min-w-full sm:w-full">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="company">Company</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Update your account details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      defaultValue={user?.email} 
                      disabled 
                    />
                    <p className="text-xs text-muted-foreground">
                      Your email address is used for signing in
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input 
                      id="role" 
                      defaultValue={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "User"} 
                      disabled 
                    />
                    <p className="text-xs text-muted-foreground">
                      Your role determines your access level
                    </p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive email notifications for important updates
                      </p>
                    </div>
                    <Switch 
                      id="emailNotifications" 
                      checked={preferences.emailNotifications}
                      onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, emailNotifications: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="darkMode">Dark Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable dark mode for the application
                      </p>
                    </div>
                    <Switch 
                      id="darkMode" 
                      checked={preferences.darkMode}
                      onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, darkMode: checked }))}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  className="bg-system-blue-600 hover:bg-system-blue-700"
                  onClick={handleSavePreferences}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Delete Account</CardTitle>
              <CardDescription>
                Permanently delete your account and all data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  This action is irreversible and will permanently delete your account, including all personal information, activity history, and associated data.
                </p>
                <Button variant="destructive">Delete Account</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      value={profile.firstName}
                      onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      value={profile.lastName}
                      onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input 
                    id="phoneNumber" 
                    type="tel" 
                    placeholder="(555) 123-4567"
                    value={profile.phoneNumber || ""}
                    onChange={(e) => setProfile(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    placeholder="City, State, Country"
                    value={profile.location || ""}
                    onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  className="bg-system-blue-600 hover:bg-system-blue-700"
                  onClick={handleSaveProfile}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Update your company details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input 
                    id="companyName" 
                    placeholder="Acme Inc."
                    value={company.name}
                    onChange={(e) => setCompany(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="companyWebsite">Company Website</Label>
                  <Input 
                    id="companyWebsite" 
                    type="url" 
                    placeholder="https://example.com"
                    value={company.website}
                    onChange={(e) => setCompany(prev => ({ ...prev, website: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input 
                    id="industry" 
                    placeholder="Technology"
                    value={company.industry}
                    onChange={(e) => setCompany(prev => ({ ...prev, industry: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="companySize">Company Size</Label>
                  <select 
                    id="companySize" 
                    className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
                    value={company.size}
                    onChange={(e) => setCompany(prev => ({ ...prev, size: e.target.value }))}
                  >
                    <option value="">Select company size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501-1000">501-1000 employees</option>
                    <option value="1001+">1001+ employees</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  className="bg-system-blue-600 hover:bg-system-blue-700"
                  onClick={handleSaveCompany}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Email Notifications</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="newApplications">New Applications</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when new candidates apply
                      </p>
                    </div>
                    <Switch 
                      id="newApplications"
                      checked={notificationSettings.newApplications}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, newApplications: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="interviewSchedule">Interview Scheduling</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about interview scheduling and changes
                      </p>
                    </div>
                    <Switch 
                      id="interviewSchedule"
                      checked={notificationSettings.interviewSchedule}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, interviewSchedule: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="assessmentCompleted">Assessment Completions</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when candidates complete assessments
                      </p>
                    </div>
                    <Switch 
                      id="assessmentCompleted"
                      checked={notificationSettings.assessmentCompleted}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, assessmentCompleted: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="teamActivity">Team Activity</Label>
                      <p className="text-sm text-muted-foreground">
                        Get updates on team member activities
                      </p>
                    </div>
                    <Switch 
                      id="teamActivity"
                      checked={notificationSettings.teamActivity}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, teamActivity: checked }))}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <h3 className="font-medium">In-App Notifications</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="inAppAll">All Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive all in-app notifications
                      </p>
                    </div>
                    <Switch 
                      id="inAppAll"
                      checked={notificationSettings.inAppAll}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, inAppAll: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="inAppMessages">Direct Messages</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified for new messages
                      </p>
                    </div>
                    <Switch 
                      id="inAppMessages"
                      checked={notificationSettings.inAppMessages}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, inAppMessages: checked }))}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  className="bg-system-blue-600 hover:bg-system-blue-700"
                  onClick={handleSaveNotifications}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Change your password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input 
                    id="currentPassword" 
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input 
                    id="newPassword" 
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  className="bg-system-blue-600 hover:bg-system-blue-700"
                  onClick={handleChangePassword}
                  disabled={saving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : "Update Password"}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="twoFactorAuth">Enable Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Require a code from your authenticator app when signing in
                    </p>
                  </div>
                  <Switch 
                    id="twoFactorAuth"
                    checked={twoFactorEnabled}
                    onCheckedChange={handleTwoFactorToggle}
                    disabled={saving}
                  />
                </div>
              </div>
              
              {twoFactorEnabled && (
                <div className="rounded-md bg-muted p-4">
                  <p className="text-sm">
                    Two-factor authentication is enabled for your account. You will need to provide a verification code when signing in.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
