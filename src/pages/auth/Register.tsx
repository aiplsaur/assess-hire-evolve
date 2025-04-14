import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserRole } from "@/types";
import { MailCheck, AlertCircle } from "lucide-react";

// Define form schema using zod
const registerSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
  role: z.enum(["candidate", "interviewer", "hr", "admin"] as const).default("candidate"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const { signUp, loading } = useAuth();
  const [registrationState, setRegistrationState] = useState<{
    requiresConfirmation?: boolean;
    incomplete?: boolean;
    error?: string;
  }>({});

  // Initialize form with react-hook-form
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "candidate",
    },
  });

  // Handle form submission
  const onSubmit = async (data: RegisterFormValues) => {
    try {
      // Reset registration state before attempting registration
      setRegistrationState({});
      
      const result = await signUp(
        data.email,
        data.password,
        data.firstName,
        data.lastName,
        data.role
      );
      
      // Handle different registration states
      if (result?.requiresConfirmation) {
        setRegistrationState({ requiresConfirmation: true });
      } else if (result?.incomplete) {
        setRegistrationState({ incomplete: true });
      }
      // Success without special states is handled by AuthContext (redirect)
    } catch (error) {
      console.error("Registration error:", error);
      setRegistrationState({ 
        error: error instanceof Error ? error.message : "Registration failed" 
      });
    }
  };

  // Render confirmation message if email confirmation is required
  if (registrationState.requiresConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-system-blue-50 to-system-blue-100 dark:from-system-gray-900 dark:to-system-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md animate-fade-in shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Check Your Email</CardTitle>
            <CardDescription className="text-center">
              We've sent you a confirmation email. Please check your inbox and click the confirmation link to activate your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="p-4 rounded-full bg-system-blue-100">
              <MailCheck className="h-12 w-12 text-system-blue-600" />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 p-6">
            <Link 
              to="/auth/login" 
              className="w-full text-center text-system-blue-600 hover:text-system-blue-800 font-medium"
            >
              Back to Login
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Render incomplete registration message
  if (registrationState.incomplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-system-blue-50 to-system-blue-100 dark:from-system-gray-900 dark:to-system-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md animate-fade-in shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Account Created</CardTitle>
            <CardDescription className="text-center">
              Your account was created but we encountered an issue setting up your profile. You can try signing in now.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="p-4 rounded-full bg-system-yellow-100">
              <AlertCircle className="h-12 w-12 text-system-yellow-600" />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 p-6">
            <Link 
              to="/auth/login" 
              className="w-full text-center text-system-blue-600 hover:text-system-blue-800 font-medium"
            >
              Go to Login
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Normal registration form
  return (
    <div className="min-h-screen bg-gradient-to-b from-system-blue-50 to-system-blue-100 dark:from-system-gray-900 dark:to-system-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fade-in shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
          <CardDescription className="text-center">
            Join AnthemHire to streamline your hiring process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>I am a</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="candidate">Job Seeker</SelectItem>
                        <SelectItem value="interviewer">Interviewer</SelectItem>
                        <SelectItem value="hr">HR Manager</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <Separator />
        <CardFooter className="flex flex-col space-y-4 p-6">
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link 
              to="/auth/login" 
              className="text-system-blue-600 hover:text-system-blue-800 dark:text-system-blue-400 dark:hover:text-system-blue-300 font-medium"
            >
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
