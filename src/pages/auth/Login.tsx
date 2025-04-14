import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertTriangle,
  BadgeInfo,
  CircleUser,
  HelpingHand,
  UserCog 
} from "lucide-react";

// Define form schema using zod
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const { signIn, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Initialize form with react-hook-form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "password123", // For demo purposes
    },
  });

  // Handle form submission
  const onSubmit = async (data: LoginFormValues) => {
    try {
      await signIn(data.email, data.password);
      // Auth context handles redirect and toast
    } catch (error) {
      console.error("Login error:", error);
      // Auth context handles error toast
    }
  };

  // Demo login functions for different roles
  const loginAsRole = (role: string) => {
    const email = `${role}@interviewpro.com`;
    form.setValue("email", email);
    form.handleSubmit(onSubmit)();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-system-blue-50 to-system-blue-100 dark:from-system-gray-900 dark:to-system-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fade-in shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign in to AnthemHire</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center">
            <Link 
              to="/auth/forgot-password" 
              className="text-sm text-system-blue-600 hover:text-system-blue-800 dark:text-system-blue-400 dark:hover:text-system-blue-300"
            >
              Forgot password?
            </Link>
          </div>

          {/* <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-system-gray-900 text-muted-foreground">Demo Logins</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => loginAsRole("admin")}
                className="flex items-center justify-center gap-2"
              >
                <UserCog className="h-4 w-4" />
                <span>Admin</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => loginAsRole("hr")}
                className="flex items-center justify-center gap-2"
              >
                <HelpingHand className="h-4 w-4" />
                <span>HR Manager</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => loginAsRole("interviewer")}
                className="flex items-center justify-center gap-2"
              >
                <BadgeInfo className="h-4 w-4" />
                <span>Interviewer</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => loginAsRole("candidate")}
                className="flex items-center justify-center gap-2"
              >
                <CircleUser className="h-4 w-4" />
                <span>Candidate</span>
              </Button>
            </div>

            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800">
                This is a demo application. All authentication is simulated. Any password will work with the demo emails.
              </p>
            </div>
          </div> */}
        </CardContent>
        <Separator />
        <CardFooter className="flex flex-col space-y-4 p-6">
          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link 
              to="/auth/register" 
              className="text-system-blue-600 hover:text-system-blue-800 dark:text-system-blue-400 dark:hover:text-system-blue-300 font-medium"
            >
              Create one now
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
