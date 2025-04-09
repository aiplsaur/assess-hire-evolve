
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/context/AuthContext";

const Settings: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and application preferences
        </p>
      </div>

      <Tabs defaultValue="account" className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
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
                      <Label htmlFor="notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive email notifications for important updates
                      </p>
                    </div>
                    <Switch id="notifications" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="darkMode">Dark Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable dark mode for the application
                      </p>
                    </div>
                    <Switch id="darkMode" />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button className="bg-system-blue-600 hover:bg-system-blue-700">
                  Save Changes
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
                    <Input id="firstName" defaultValue={user?.firstName} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue={user?.lastName} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input id="phoneNumber" type="tel" placeholder="(555) 123-4567" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="City, State, Country" />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button className="bg-system-blue-600 hover:bg-system-blue-700">
                  Save Changes
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
                  <Input id="companyName" placeholder="Acme Inc." />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="companyWebsite">Company Website</Label>
                  <Input id="companyWebsite" type="url" placeholder="https://example.com" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input id="industry" placeholder="Technology" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="companySize">Company Size</Label>
                  <select 
                    id="companySize" 
                    className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
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
                <Button className="bg-system-blue-600 hover:bg-system-blue-700">
                  Save Changes
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
                    <Switch id="newApplications" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="interviewSchedule">Interview Scheduling</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about interview scheduling and changes
                      </p>
                    </div>
                    <Switch id="interviewSchedule" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="assessmentCompleted">Assessment Completions</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when candidates complete assessments
                      </p>
                    </div>
                    <Switch id="assessmentCompleted" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="teamActivity">Team Activity</Label>
                      <p className="text-sm text-muted-foreground">
                        Get updates on team member activities
                      </p>
                    </div>
                    <Switch id="teamActivity" />
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
                    <Switch id="inAppAll" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="inAppMessages">Direct Messages</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified for new messages
                      </p>
                    </div>
                    <Switch id="inAppMessages" defaultChecked />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button className="bg-system-blue-600 hover:bg-system-blue-700">
                  Save Changes
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
                  <Input id="currentPassword" type="password" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button className="bg-system-blue-600 hover:bg-system-blue-700">
                  Update Password
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
                  <Switch id="twoFactorAuth" />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button className="bg-system-blue-600 hover:bg-system-blue-700">
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
