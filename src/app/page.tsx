"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ArrowRight,
  Sparkles,
  MessageCircle,
  Search,
  Library,
  LogOut,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth, signOutUser } from "@/lib/supabase";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <span className="font-serif text-xl font-semibold text-foreground tracking-wide">
                Muzakkir
              </span>
            </div>
            <div className="flex items-center gap-3">
              {loading ? (
                <div className="h-9 w-32 animate-pulse bg-muted rounded-md" />
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <User className="size-4" />
                      {user.user_metadata?.full_name ||
                        user.user_metadata?.display_name ||
                        user.email?.split("@")[0]}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled>
                      <User className="mr-2 size-4" />
                      {user.email}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={async () => {
                        const result = await signOutUser();
                        if (!result.error) {
                          router.push("/");
                        }
                      }}
                    >
                      <LogOut className="mr-2 size-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button asChild variant="outline">
                    <Link href="/signin">Sign In</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/30 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-32 items-center">
            {/* Left side - Hero Text */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
                <span className="text-sm text-primary font-medium">
                  AI-Powered Reading
                </span>
              </div>

              {/* Main heading */}
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                Discover the <span className="text-primary">Wisdom</span> of
                Risale-i Nur
              </h1>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
                Experience the profound teachings of Bediüzzaman Said Nursi with
                an intelligent AI companion that helps you understand, explore,
                and connect with the text.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button asChild size="lg" className="gap-2 shadow-lg">
                  <Link href="/read">
                    Start Reading
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="gap-2">
                  <Link href="/read">
                    <MessageCircle className="size-4" />
                    Ask AI
                  </Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="flex gap-8 mt-12 justify-center lg:justify-start">
                <div>
                  <p className="text-2xl font-bold text-foreground">33+</p>
                  <p className="text-sm text-muted-foreground">Treatises</p>
                </div>
                <div className="w-px bg-border" />
                <div>
                  <p className="text-2xl font-bold text-foreground">AI</p>
                  <p className="text-sm text-muted-foreground">Powered</p>
                </div>
                <div className="w-px bg-border" />
                <div>
                  <p className="text-2xl font-bold text-foreground">24/7</p>
                  <p className="text-sm text-muted-foreground">Available</p>
                </div>
              </div>
            </div>

            {/* Right side - Screenshot */}
            <div className="relative lg:scale-150 lg:translate-x-8">
              {/* Decorative frame */}
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 via-accent/20 to-primary/10 rounded-2xl blur-xl" />

              {/* Screenshot container */}
              <div className="relative bg-card rounded-xl border border-border shadow-2xl overflow-hidden">
                {/* Screenshot */}
                <div className="relative aspect-[4/3]">
                  <Image
                    src="/hero_image_muzakkir.png"
                    alt="Muzakkir App - AI-powered Risale-i Nur reader"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32 relative bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Your Intelligent Reading Companion
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Powered by advanced AI to help you deeply understand and engage
              with the sacred texts
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Feature 1 */}
            <div className="group p-6 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MessageCircle className="size-6 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                Ask Anything
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Select any passage and ask questions. Get insightful
                explanations grounded in the text&apos;s wisdom.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-6 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Search className="size-6 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                Semantic Search
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Find relevant passages across all books using meaning-based
                search, not just keywords.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-6 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Library className="size-6 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                Complete Collection
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Access the entire Risale-i Nur collection in a beautiful,
                distraction-free reading experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-8 sm:p-12 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 rounded-2xl border border-primary/20">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Begin Your Journey
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              Explore the timeless teachings with the help of AI. Understanding
              has never been more accessible.
            </p>
            <Button asChild size="lg" className="gap-2 shadow-lg">
              <Link href="/read">
                Start Reading Now
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                <BookOpen className="size-4 text-primary" />
              </div>
              <span className="font-serif text-lg font-semibold text-foreground">
                Muzakkir
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Bediüzzaman Said Nursi &middot; Risale-i Nur Külliyatı
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
