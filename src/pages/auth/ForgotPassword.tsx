
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Define form schema using zod
const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword: React.FC = () => {
  const { resetPassword, loading } = useAuth();
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  // Initialize form with react-hook-form
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      await resetPassword(data.email);
      setIsSubmitted(true);
      // Auth context handles toast
    } catch (error) {
      console.error("Reset password error:", error);
      // Auth context handles error toast
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-system-blue-50 to-system-blue-100 dark:from-system-gray-900 dark:to-system-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fade-in shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">
            Enter your email to receive a password reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <div className="text-center p-4">
              <div className="text-system-green-500 text-3xl mb-4">✓</div>
              <h3 className="text-lg font-medium mb-2">Check your email</h3>
              <p className="text-muted-foreground mb-4">
                We've sent a password reset link to your email address.
              </p>
              <p className="text-sm text-muted-foreground">
                Didn't receive an email? Check your spam folder or{" "}
                <button 
                  className="text-system-blue-600 hover:text-system-blue-800 dark:text-system-blue-400 dark:hover:text-system-blue-300"
                  onClick={() => setIsSubmitted(false)}
                >
                  try again
                </button>
              </p>
            </div>
          ) : (
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
                      <FormDescription>
                        We'll send a password reset link to this email address.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending..." : "Send reset link"}
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

export default ForgotPassword;
