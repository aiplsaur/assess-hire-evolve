import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
import { authService } from "@/services";
import { useToast } from "@/hooks/use-toast";

// Define form schema using zod
const resetPasswordSchema = z.object({
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const ResetPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Extract token from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');
    
    if (token) {
      setHash(token);
    } else {
      setError("Invalid or missing reset token");
    }
  }, [location]);

  // Initialize form with react-hook-form
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!hash) {
      setError("Missing reset token");
      return;
    }
    
    try {
      setLoading(true);
      
      // Call Supabase to update the user's password
      await authService.updatePassword(hash, data.password);
      
      // Show success message
      setSuccess(true);
      toast({
        title: "Password reset successful",
        description: "Your password has been updated.",
      });
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/auth/login');
      }, 3000);
    } catch (error) {
      console.error("Reset password error:", error);
      setError("Failed to reset password. The link may have expired.");
      toast({
        title: "Password reset failed",
        description: "The reset link may have expired. Please request a new one.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-system-blue-50 to-system-blue-100 dark:from-system-gray-900 dark:to-system-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fade-in shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Reset Your Password</CardTitle>
          <CardDescription className="text-center">
            Create a new password for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center p-4">
              <div className="text-system-red-500 text-3xl mb-4">✕</div>
              <h3 className="text-lg font-medium mb-2">Error</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button 
                asChild
                className="mt-2"
              >
                <Link to="/auth/forgot-password">Request New Link</Link>
              </Button>
            </div>
          ) : success ? (
            <div className="text-center p-4">
              <div className="text-system-green-500 text-3xl mb-4">✓</div>
              <h3 className="text-lg font-medium mb-2">Password Reset Successful</h3>
              <p className="text-muted-foreground mb-4">
                Your password has been updated successfully.
              </p>
              <p className="text-sm text-muted-foreground">
                Redirecting to login...
              </p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
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
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Updating..." : "Reset Password"}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
        <Separator />
        <CardFooter className="flex flex-col space-y-4 p-6">
          <div className="text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link 
              to="/auth/login" 
              className="text-system-blue-600 hover:text-system-blue-800 dark:text-system-blue-400 dark:hover:text-system-blue-300 font-medium"
            >
              Back to login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResetPassword; 