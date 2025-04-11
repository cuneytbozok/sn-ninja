"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { toast } from "sonner";
import { CalendarIcon, SearchIcon, Settings, UserCircle2 } from "lucide-react";

// Mock search history data
const searchHistory = [
  {
    id: 1,
    query: "What is ServiceNow?",
    date: "2023-12-10T14:30:00Z",
  },
  {
    id: 2,
    query: "How to create a flow in ServiceNow?",
    date: "2023-12-09T10:15:00Z",
  },
  {
    id: 3,
    query: "ServiceNow REST API documentation",
    date: "2023-12-05T16:45:00Z",
  },
  {
    id: 4,
    query: "ServiceNow integration with Slack",
    date: "2023-12-01T09:30:00Z",
  },
  {
    id: 5,
    query: "ServiceNow pricing tiers",
    date: "2023-11-28T13:20:00Z",
  },
];

export default function ProfilePage() {
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("john.doe@example.com");
  const [notifications, setNotifications] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Profile updated successfully");
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
      
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="history">Search History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Update your account details and preferences
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSaveProfile}>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src="" alt="User" />
                    <AvatarFallback className="text-3xl">
                      <UserCircle2 className="h-12 w-12" />
                    </AvatarFallback>
                  </Avatar>
                  <Button type="button" variant="outline" size="sm">
                    Change Avatar
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="notifications"
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                  <Label htmlFor="notifications">
                    Receive email notifications
                  </Label>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Search History</CardTitle>
              <CardDescription>
                View your recent searches
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Query</TableHead>
                    <TableHead className="w-[180px]">Date</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchHistory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <SearchIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                          {item.query}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-muted-foreground">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          {new Date(item.date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">Search Again</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 