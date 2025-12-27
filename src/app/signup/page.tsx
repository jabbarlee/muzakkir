import Link from "next/link";
import Image from "next/image";
import { BookOpen, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                <BookOpen className="size-4 text-primary" />
              </div>
              <span className="font-serif text-xl font-semibold text-foreground tracking-wide">
                Muzakkir
              </span>
            </Link>
            <Button asChild variant="ghost" size="sm">
              <Link href="/" className="gap-2">
                <ArrowLeft className="size-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/30 rounded-full blur-3xl" />
      </div>

      {/* Sign Up Form */}
      <div className="relative flex items-center justify-center min-h-screen px-4 py-24">
        <div className="w-full max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left side - Image */}
            <div className="hidden lg:block">
              <div className="relative w-full h-[700px] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/signup_page_image.png"
                  alt="Muzakkir Signup"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* Right side - Form */}
            <div className="w-full max-w-md mx-auto lg:mx-0">
              <Card className="shadow-xl">
                <CardHeader className="space-y-2 text-center">
                  <CardTitle className="text-3xl">Create Account</CardTitle>
                  <CardDescription className="text-base">
                    Begin your journey through the wisdom of Risale-i Nur
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        autoComplete="name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        autoComplete="email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Create a strong password"
                        autoComplete="new-password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Re-enter your password"
                        autoComplete="new-password"
                      />
                    </div>
                    <Button type="submit" className="w-full" size="lg">
                      Create Account
                    </Button>
                  </form>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <Button variant="outline" size="lg">
                      <svg className="size-5" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Google
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <div className="text-sm text-center text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                      href="/signin"
                      className="text-primary font-medium hover:underline"
                    >
                      Sign in
                    </Link>
                  </div>
                </CardFooter>
              </Card>

              <p className="text-center text-sm text-muted-foreground mt-6">
                By creating an account, you agree to our Terms of Service and
                Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
