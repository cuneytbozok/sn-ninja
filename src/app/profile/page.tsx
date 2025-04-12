"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, User, Briefcase, Building, Mail, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface UserProfile {
  first_name: string;
  last_name: string;
  company: string;
  job_title: string;
}

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordChanging, setIsPasswordChanging] = useState(false);
  const [isEmailChanging, setIsEmailChanging] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    first_name: "",
    last_name: "",
    company: "",
    job_title: "",
  });
  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [newEmail, setNewEmail] = useState("");
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    } else if (user) {
      loadUserProfile();
    }
  }, [user, isLoading, router]);

  const loadUserProfile = async () => {
    setIsProfileLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user?.user_metadata) {
        setProfile({
          first_name: user.user_metadata.first_name || "",
          last_name: user.user_metadata.last_name || "",
          company: user.user_metadata.company || "",
          job_title: user.user_metadata.job_title || "",
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: profile.first_name,
          last_name: profile.last_name,
          company: profile.company,
          job_title: profile.job_title,
        }
      });
      
      if (error) throw error;
      
      toast.success("Profile updated successfully");
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError(err.message || "Failed to update profile");
      toast.error("Error updating profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    
    if (password.new !== password.confirm) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (password.new.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    setIsPasswordChanging(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password.new
      });
      
      if (error) throw error;
      
      toast.success("Password updated successfully");
      
      // Reset password fields
      setPassword({
        current: "",
        new: "",
        confirm: "",
      });
    } catch (err: any) {
      console.error("Error updating password:", err);
      setPasswordError(err.message || "Failed to update password");
      toast.error("Error updating password");
    } finally {
      setIsPasswordChanging(false);
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    
    if (!newEmail) {
      setEmailError("New email is required");
      return;
    }

    if (newEmail === user?.email) {
      setEmailError("New email must be different from current email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setIsEmailChanging(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail,
      }, {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      });
      
      if (error) throw error;
      
      setEmailSent(true);
      toast.success("Verification email sent", {
        description: "Please check your email to confirm the change."
      });
    } catch (err: any) {
      console.error("Error updating email:", err);
      setEmailError(err.message || "Failed to update email");
      toast.error("Error updating email");
    } finally {
      setIsEmailChanging(false);
    }
  };

  if (isLoading || isProfileLoading) {
    return (
      <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container py-10 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="security">Password & Security</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal details and company information
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleProfileSave}>
                <CardContent className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <Label htmlFor="email">Email Address</Label>
                      </div>
                      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                          >
                            Change Email
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Change Email Address</DialogTitle>
                            <DialogDescription>
                              {emailSent 
                                ? "Verification email sent. Check your inbox." 
                                : "Enter your new email address. You'll need to verify this email before the change takes effect."}
                            </DialogDescription>
                          </DialogHeader>
                          
                          {!emailSent ? (
                            <form onSubmit={handleEmailChange} className="space-y-4 py-4">
                              {emailError && (
                                <Alert variant="destructive">
                                  <AlertCircle className="h-4 w-4" />
                                  <AlertDescription>{emailError}</AlertDescription>
                                </Alert>
                              )}
                              <div className="space-y-2">
                                <Label htmlFor="currentEmail">Current Email</Label>
                                <Input
                                  id="currentEmail"
                                  value={user?.email || ""}
                                  disabled
                                  className="bg-muted/50"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="newEmail">New Email</Label>
                                <Input
                                  id="newEmail"
                                  type="email"
                                  placeholder="new.email@example.com"
                                  value={newEmail}
                                  onChange={(e) => setNewEmail(e.target.value)}
                                  required
                                />
                              </div>
                              <DialogFooter className="pt-4">
                                <Button 
                                  type="submit" 
                                  disabled={isEmailChanging}
                                  className="w-full"
                                >
                                  {isEmailChanging ? "Sending..." : "Send Verification Email"}
                                </Button>
                              </DialogFooter>
                            </form>
                          ) : (
                            <div className="py-6 text-center space-y-4">
                              <p className="text-muted-foreground">
                                We've sent a verification email to <span className="font-medium">{newEmail}</span>.
                                Please check your inbox and follow the instructions.
                              </p>
                              <Button 
                                variant="outline" 
                                onClick={() => {
                                  setEmailDialogOpen(false);
                                  setEmailSent(false);
                                  setNewEmail("");
                                }}
                                className="w-full"
                              >
                                Close
                              </Button>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="flex items-center rounded-md border px-3 py-2 bg-muted/50">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{user?.email}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <Label htmlFor="firstName">First Name</Label>
                      </div>
                      <Input
                        id="firstName"
                        value={profile.first_name}
                        onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <Label htmlFor="lastName">Last Name</Label>
                      </div>
                      <Input
                        id="lastName"
                        value={profile.last_name}
                        onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                      <Label htmlFor="company">Company</Label>
                    </div>
                    <Input
                      id="company"
                      value={profile.company}
                      onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                      <Label htmlFor="jobTitle">Job Title</Label>
                    </div>
                    <Input
                      id="jobTitle"
                      value={profile.job_title}
                      onChange={(e) => setProfile({ ...profile, job_title: e.target.value })}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end pt-6">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <form onSubmit={handlePasswordChange}>
                <CardContent className="space-y-6">
                  {passwordError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{passwordError}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      placeholder="••••••••"
                      value={password.current}
                      onChange={(e) => setPassword({ ...password, current: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="••••••••"
                      value={password.new}
                      onChange={(e) => setPassword({ ...password, new: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={password.confirm}
                      onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">Password must be at least 8 characters long</p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end pt-6">
                  <Button type="submit" disabled={isPasswordChanging}>
                    {isPasswordChanging ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 