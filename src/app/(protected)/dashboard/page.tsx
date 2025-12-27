"use client";

import { useAuth } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, BookMarked, Clock, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();

  const stats = [
    {
      title: "Books Read",
      value: "3",
      description: "Books completed this month",
      icon: BookOpen,
      color: "text-blue-500",
    },
    {
      title: "Notes Created",
      value: "24",
      description: "Notes taken this week",
      icon: BookMarked,
      color: "text-green-500",
    },
    {
      title: "Reading Time",
      value: "12h 30m",
      description: "Time spent this week",
      icon: Clock,
      color: "text-orange-500",
    },
    {
      title: "Progress",
      value: "68%",
      description: "Overall completion",
      icon: TrendingUp,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back,{" "}
          {user?.user_metadata?.full_name?.split(" ")[0] || "Reader"}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Here&apos;s an overview of your reading journey
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`size-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Reading</CardTitle>
            <CardDescription>
              Books you&apos;ve been reading recently
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    The First Word
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Last read 2 hours ago
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  45% complete
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    The Thirtieth Word
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Last read yesterday
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  78% complete
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    The Twenty-Third Flash
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Last read 3 days ago
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  100% complete
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Notes</CardTitle>
            <CardDescription>
              Your latest insights and reflections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  Reflection on divine names
                </p>
                <p className="text-sm text-muted-foreground">
                  The discussion of the divine names in this chapter really
                  resonated with me...
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  Key points from Chapter 30
                </p>
                <p className="text-sm text-muted-foreground">
                  Three main themes emerged: creation, purpose, and destiny...
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  Question about miracles
                </p>
                <p className="text-sm text-muted-foreground">
                  Need to explore more about the role of miracles in faith...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
