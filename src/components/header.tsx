"use client";

import Link from "next/link";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, UserCircle2 } from "lucide-react";

export default function Header() {
  const [isAuth, setIsAuth] = useState(false);

  return (
    <header className="border-b border-border/40 bg-black">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6 mx-auto">
        <div className="flex items-center gap-6 md:gap-8 lg:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-white">SN NINJA</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="text-sm font-medium text-white hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Docs
            </Link>
            <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              About
            </Link>
            <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Help
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4 ml-auto">
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon" className="rounded-full">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <SheetHeader className="text-left mb-4">
                <SheetTitle>Navigation Menu</SheetTitle>
              </SheetHeader>
              <nav className="grid gap-6 text-lg font-medium">
                <Link href="/" className="hover:text-primary transition-colors">
                  Home
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Docs
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  About
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Help
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          {isAuth ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt="User" />
                    <AvatarFallback>
                      <UserCircle2 className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/logout">Log out</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-3">
              <Button asChild variant="ghost" className="hidden md:flex" size="sm">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 