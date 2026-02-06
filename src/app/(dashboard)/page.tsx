"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Eye,
  DollarSign,
  Video,
  Clock,
  Star,
  TrendingUp,
  TrendingDown,
  Play,
  Plus,
  RefreshCw,
  ArrowRight,
  BarChart3,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatNumber,
  formatCurrency,
  formatRelativeTime,
  getScoreColor,
  cn,
} from "@/lib/utils/index";

interface StatsData {
  totalPosted: number;
  totalViews: number;
  totalRevenue: number;
  inQueue: number;
  avgQualityScore: number;
  trends: {
    posted: number;
    views: number;
    revenue: number;
    queue: number;
    quality: number;
  };
  recentPosts: {
    id: string;
    caption: string;
    platform: string;
    views: number;
    engagement_rate: number;
    posted_date: string;
  }[];
  upcomingQueue: {
    id: string;
    concept: string;
    scene_type: string;
    scheduled_post_time: string | null;
    validation_score: number;
  }[];
}

const fallbackStats: StatsData = {
  totalPosted: 247,
  totalViews: 12_400_000,
  totalRevenue: 8750.0,
  inQueue: 12,
  avgQualityScore: 8.2,
  trends: {
    posted: 12,
    views: 18.5,
    revenue: 22.3,
    queue: -3,
    quality: 0.4,
  },
  recentPosts: [
    {
      id: "1",
      caption: "That moment when the backrooms shift... #minecraft #horror",
      platform: "tiktok",
      views: 584000,
      engagement_rate: 8.7,
      posted_date: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
      id: "2",
      caption: "Entity 303 was never just a myth. Full video on YT.",
      platform: "youtube",
      views: 142000,
      engagement_rate: 6.2,
      posted_date: new Date(Date.now() - 8 * 3600000).toISOString(),
    },
    {
      id: "3",
      caption: "POV: You hear digging below your base at 3am",
      platform: "tiktok",
      views: 923000,
      engagement_rate: 11.4,
      posted_date: new Date(Date.now() - 14 * 3600000).toISOString(),
    },
    {
      id: "4",
      caption: "This seed should NOT exist... #cursed #minecraft",
      platform: "tiktok",
      views: 1_200_000,
      engagement_rate: 14.2,
      posted_date: new Date(Date.now() - 24 * 3600000).toISOString(),
    },
    {
      id: "5",
      caption: "The fog rolled in and everything changed",
      platform: "youtube",
      views: 89000,
      engagement_rate: 5.8,
      posted_date: new Date(Date.now() - 36 * 3600000).toISOString(),
    },
  ],
  upcomingQueue: [
    {
      id: "q1",
      concept: "Abandoned mineshaft with echoing whispers and flickering torches",
      scene_type: "liminal",
      scheduled_post_time: new Date(Date.now() + 3 * 3600000).toISOString(),
      validation_score: 8.9,
    },
    {
      id: "q2",
      concept: "Herobrine sighting in deep dark biome with sculk sensors",
      scene_type: "entity",
      scheduled_post_time: new Date(Date.now() + 7 * 3600000).toISOString(),
      validation_score: 9.1,
    },
    {
      id: "q3",
      concept: "World corruption glitch spreading across ocean monument",
      scene_type: "glitch",
      scheduled_post_time: new Date(Date.now() + 11 * 3600000).toISOString(),
      validation_score: 7.8,
    },
  ],
};

async function fetchStats(): Promise<StatsData> {
  const res = await fetch("/api/stats");
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

const statCards = [
  {
    key: "totalPosted" as const,
    label: "Total Posted",
    icon: Video,
    trendKey: "posted" as const,
    format: (v: number) => formatNumber(v),
  },
  {
    key: "totalViews" as const,
    label: "Total Views",
    icon: Eye,
    trendKey: "views" as const,
    format: (v: number) => formatNumber(v),
  },
  {
    key: "totalRevenue" as const,
    label: "Revenue",
    icon: DollarSign,
    trendKey: "revenue" as const,
    format: (v: number) => formatCurrency(v),
  },
  {
    key: "inQueue" as const,
    label: "In Queue",
    icon: Clock,
    trendKey: "queue" as const,
    format: (v: number) => v.toString(),
  },
  {
    key: "avgQualityScore" as const,
    label: "Avg Quality Score",
    icon: Star,
    trendKey: "quality" as const,
    format: (v: number) => v.toFixed(1),
  },
];

function SkeletonCard() {
  return (
    <Card className="bg-[#1a1a1a] border-border">
      <CardContent className="p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-8 w-32 bg-muted rounded" />
          <div className="h-3 w-20 bg-muted rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

function SkeletonTable() {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-12 bg-muted rounded" />
      ))}
    </div>
  );
}

const sceneTypeColors: Record<string, string> = {
  liminal: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  entity: "bg-red-500/20 text-red-400 border-red-500/30",
  glitch: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  build: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

const platformColors: Record<string, string> = {
  tiktok: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  youtube: "bg-red-600/20 text-red-400 border-red-600/30",
};

export default function DashboardPage() {
  const { data, isLoading } = useQuery<StatsData>({
    queryKey: ["stats"],
    queryFn: fetchStats,
    refetchInterval: 30000,
    placeholderData: fallbackStats,
  });

  const stats = data ?? fallbackStats;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#e0e0e0]">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your horror content empire
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-border text-muted-foreground hover:text-[#e0e0e0]"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
          : statCards.map((card) => {
              const value = stats[card.key];
              const trend = stats.trends[card.trendKey];
              const isPositive = trend >= 0;
              return (
                <Card
                  key={card.key}
                  className="bg-[#1a1a1a] border-border glow-red-hover"
                >
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-muted-foreground">
                        {card.label}
                      </span>
                      <card.icon className="h-4 w-4 text-[#8B0000]" />
                    </div>
                    <div className="text-2xl font-bold text-[#e0e0e0]">
                      {card.format(value)}
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-xs">
                      {isPositive ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                      <span
                        className={
                          isPositive ? "text-green-500" : "text-red-500"
                        }
                      >
                        {isPositive ? "+" : ""}
                        {trend}%
                      </span>
                      <span className="text-muted-foreground">vs last week</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      {/* Recent Posts & Upcoming Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Posts Table */}
        <Card className="lg:col-span-2 bg-[#1a1a1a] border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg text-[#e0e0e0]">
              Recent Posts
            </CardTitle>
            <Link href="/analytics">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-[#ff4444]">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <SkeletonTable />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Caption</TableHead>
                    <TableHead className="text-muted-foreground">Platform</TableHead>
                    <TableHead className="text-muted-foreground text-right">Views</TableHead>
                    <TableHead className="text-muted-foreground text-right">Engagement</TableHead>
                    <TableHead className="text-muted-foreground text-right">Posted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentPosts.map((post) => (
                    <TableRow key={post.id} className="border-border hover:bg-[#ffffff05]">
                      <TableCell className="font-medium text-[#e0e0e0] max-w-[250px] truncate">
                        {post.caption}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "capitalize text-xs",
                            platformColors[post.platform] || ""
                          )}
                        >
                          {post.platform}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-[#e0e0e0]">
                        {formatNumber(post.views)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={getScoreColor(post.engagement_rate)}>
                          {post.engagement_rate}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm">
                        {formatRelativeTime(post.posted_date)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Queue */}
        <Card className="bg-[#1a1a1a] border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg text-[#e0e0e0]">
              Upcoming Queue
            </CardTitle>
            <Link href="/queue">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-[#ff4444]">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-24 bg-muted rounded" />
                ))}
              </div>
            ) : (
              stats.upcomingQueue.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-lg bg-[#0a0a0a] border border-border hover:border-[#8B0000]/50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs capitalize",
                        sceneTypeColors[item.scene_type] || ""
                      )}
                    >
                      {item.scene_type}
                    </Badge>
                    <span className={cn("text-xs font-mono", getScoreColor(item.validation_score))}>
                      {item.validation_score.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-sm text-[#e0e0e0] line-clamp-2 mb-2">
                    {item.concept}
                  </p>
                  {item.scheduled_post_time && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatRelativeTime(item.scheduled_post_time)}
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-[#1a1a1a] border-border">
        <CardHeader>
          <CardTitle className="text-lg text-[#e0e0e0]">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button className="bg-[#8B0000] hover:bg-[#a00000] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Generate Content
            </Button>
            <Button variant="outline" className="border-border text-[#e0e0e0] hover:bg-[#ffffff08]">
              <Play className="h-4 w-4 mr-2" />
              Post Next in Queue
            </Button>
            <Link href="/analytics">
              <Button variant="outline" className="border-border text-[#e0e0e0] hover:bg-[#ffffff08]">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="outline" className="border-border text-[#e0e0e0] hover:bg-[#ffffff08]">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
