import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Registration form schema
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Please enter a valid email address"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z.string().optional(),
  isArtist: z.boolean().default(false),
});

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [location, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Registration form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      fullName: "",
      phone: "",
      isArtist: false,
    },
  });

  const onLoginSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(values);
  };

  const onRegisterSubmit = (values: z.infer<typeof registerSchema>) => {
    registerMutation.mutate(values);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-light">
      <Header />

      <main className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Hero/Info Section */}
            <div className="bg-gray-800 rounded-xl p-8 hidden md:flex flex-col justify-center">
              <h1 className="text-4xl font-heading text-light mb-4">Welcome to <span className="text-primary">InkSync</span></h1>
              <p className="text-gray-300 mb-6 text-lg">
                Join our advanced tattoo scheduling platform and get access to:
              </p>
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>AI-powered artist and time slot recommendations</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Intelligent waitlist for preferred artists and dates</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Instant notifications for cancellations and openings</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Manage all your appointments in one place</span>
                </li>
              </ul>
              <div className="mt-8">
                <div className="relative h-44 overflow-hidden rounded-lg">
                  <img 
                    src="https://images.unsplash.com/photo-1609554496796-c52fbbb69def?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300&q=80" 
                    alt="Tattoo studio interior" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60"></div>
                  <div className="absolute bottom-0 left-0 p-4">
                    <p className="text-white font-heading text-xl">Experience the future of tattoo scheduling</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Auth Forms */}
            <div className="bg-gray-800 rounded-xl p-8">
              <Tabs 
                defaultValue="login" 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                {/* Login Form */}
                <TabsContent value="login">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-heading text-light">Sign in to your account</h2>
                      <p className="text-gray-400 mt-1">Enter your credentials to access your account</p>
                    </div>

                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-light">Username</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="yourusername" 
                                  className="bg-gray-700 border-gray-600 text-light"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-light">Password</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="••••••••" 
                                  className="bg-gray-700 border-gray-600 text-light"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button 
                          type="submit" 
                          className="w-full bg-primary text-white"
                          disabled={loginMutation.isPending}
                        >
                          {loginMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Signing in...
                            </>
                          ) : (
                            "Sign In"
                          )}
                        </Button>
                      </form>
                    </Form>

                    <div className="text-center">
                      <p className="text-gray-400 text-sm">
                        Don't have an account?{" "}
                        <button 
                          className="text-primary hover:underline" 
                          onClick={() => setActiveTab("register")}
                        >
                          Register
                        </button>
                      </p>
                    </div>

                    {/* Quick Login Section for Development */}
                    <div className="mt-8 pt-6 border-t border-gray-700">
                      <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Quick Login (Development Only)
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          type="button" 
                          variant="outline"
                          className="text-xs h-9 border-gray-600 hover:bg-gray-700"
                          onClick={() => loginMutation.mutate({ username: "customer", password: "password123" })}
                        >
                          Login as Customer
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline"
                          className="text-xs h-9 border-gray-600 hover:bg-gray-700"
                          onClick={() => loginMutation.mutate({ username: "artist1", password: "password123" })}
                        >
                          Login as Artist 1
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline"
                          className="text-xs h-9 border-gray-600 hover:bg-gray-700"
                          onClick={() => loginMutation.mutate({ username: "artist2", password: "password123" })}
                        >
                          Login as Artist 2
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline"
                          className="text-xs h-9 border-gray-600 hover:bg-gray-700"
                          onClick={() => loginMutation.mutate({ username: "admin", password: "admin123" })}
                        >
                          Login as Admin
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Register Form */}
                <TabsContent value="register">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-heading text-light">Create a new account</h2>
                      <p className="text-gray-400 mt-1">Fill in your details to get started</p>
                    </div>

                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-light">Username</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="yourusername" 
                                  className="bg-gray-700 border-gray-600 text-light"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-light">Full Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="John Doe" 
                                  className="bg-gray-700 border-gray-600 text-light"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-light">Email</FormLabel>
                              <FormControl>
                                <Input 
                                  type="email" 
                                  placeholder="you@example.com" 
                                  className="bg-gray-700 border-gray-600 text-light"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-light">Phone (Optional)</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="(555) 123-4567" 
                                  className="bg-gray-700 border-gray-600 text-light"
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription className="text-gray-500">
                                For appointment notifications
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-light">Password</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="••••••••" 
                                  className="bg-gray-700 border-gray-600 text-light"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button 
                          type="submit" 
                          className="w-full bg-primary text-white"
                          disabled={registerMutation.isPending}
                        >
                          {registerMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating account...
                            </>
                          ) : (
                            "Create Account"
                          )}
                        </Button>
                      </form>
                    </Form>

                    <div className="text-center">
                      <p className="text-gray-400 text-sm">
                        Already have an account?{" "}
                        <button 
                          className="text-primary hover:underline" 
                          onClick={() => setActiveTab("login")}
                        >
                          Sign in
                        </button>
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
