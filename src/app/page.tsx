"use client";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <SignedIn>
        <Card className="w-full max-w-md border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>
              You are currently signed in to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center mb-2">
              <UserButton afterSignOutUrl="/" />
            </div>
            <Button variant="outline" className="w-full" onClick={() => window.location.href = "/dashboard"}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </SignedIn>
      
      <SignedOut>
        <Card className="w-full max-w-md border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Stake Manager</CardTitle>
            <CardDescription>
              Sign in to manage your stake accounts and bets
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-3 pt-2">
              <SignInButton mode="modal">
                <Button className="w-full bg-primary hover:bg-primary/90">
                  Sign In
                </Button>
              </SignInButton>
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <span className="relative bg-background px-2 text-xs text-muted-foreground">
                  OR
                </span>
              </div>
              <SignUpButton mode="modal">
                <Button variant="outline" className="w-full">
                  Create an Account
                </Button>
              </SignUpButton>
            </div>
          </CardContent>
        </Card>
      </SignedOut>
    </div>
  );
}
