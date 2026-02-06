"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Eye,
  ThumbsUp,
  Share2,
  MessageCircle,
  TrendingUp,
  Trophy,
} from "lucide-react";
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
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatNumber, formatDate, cn } from "@/lib/utils/index";

type TimeRange = "7d" | "30d" | "90d" | "all";

// Generate realistic mock data for views over time
function generateViewsData(days: number) {
  const data = [];
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const baseViews = 15000 + Math.random() * 35000;
    const weekendBoost = [0, 6].includes(date.getDay()) ? 1.4 : 1;
    data.push({
      date: date.toISOString().split("T")[0],
      views: Math.round(baseViews * weekendBoost + Math.random() * 10000),
      tiktok: Math.round((baseViews * weekendBoost * 0.7) + Math.random() * 8000),
      youtube: Math.round((baseViews * weekendBoost * 0.3) + Math.random() * 4000),
    });
  }
  return data;
}

const engagementByPlatform = [
  { platform: "TikTok", views: 8_420_000, likes: 620_000, shares: 185_000, comments: 94_000 },
  { platform: "YouTube", views: 3_980_000, likes: 210_000, shares: 62_000, comments: 43_000 },
];

const performanceBySceneType = [
  { name: "Liminal", value: 38, avgViews: 52000, color: "#a855f7" },
  { name: "Entity", value: 32, avgViews: 68000, color: "#ef4444" },
  { name: "Glitch", value: 18, avgViews: 44000, color: "#06b6d4" },
  { name: "Build", value: 12, avgViews: 31000, color: "#f59e0b" },
];

const topPerformers = [
  {
    id: "1",
    caption: "This seed should NOT exist... #cursed #minecraft",
    platform: "tiktok",
    views: 2_400_000,
    engagement: 14.2,
    scene_type: "glitch",
    posted: "2026-01-28",
  },
  {
    id: "2",
    caption: "POV: You hear digging below your base at 3am",
    platform: "tiktok",
    views: 1_850_000,
    engagement: 11.4,
    scene_type: "entity",
    posted: "2026-01-25",
  },
  {
    id: "3",
    caption: "Nobody talks about what happens on day 1000...",
    platform: "tiktok",
    views: 1_620_000,
    engagement: 9.8,
    scene_type: "liminal",
    posted: "2026-01-20",
  },
  {
    id: "4",
    caption: "The fog rolled in and everything changed",
    platform: "youtube",
    views: 890_000,
    engagement: 7.2,
    scene_type: "liminal",
    posted: "2026-01-18",
  },
  {
    id: "5",
    caption: "Entity 303 was never just a myth. Full video.",
    platform: "youtube",
    views: 742_000,
    engagement: 6.5,
    scene_type: "entity",
    posted: "2026-01-15",
  },
];

const platformColors: Record<string, string> = {
  tiktok: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  youtube: "bg-red-600/20 text-red-400 border-red-600/30",
};

const sceneTypeColors: Record<string, string> = {
  liminal: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  entity: "bg-red-500/20 text-red-400 border-red-500/30",
  glitch: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  build: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

interface AnalyticsData {
  totalViews: number;
  totalLikes: number;
  totalShares: number;
  totalComments: number;
  avgEngagement: number;
  totalPosts: number;
}

const fallbackAnalytics: AnalyticsData = {
  totalViews: 12_400_000,
  totalLikes: 830_000,
  totalShares: 247_000,
  totalComments: 137_000,
  avgEngagement: 9.8,
  totalPosts: 247,
};

async function fetchAnalytics(): Promise<AnalyticsData> {
  const res = await fetch("/api/analytics");
  if (!res.ok) throw new Error("Failed to fetch analytics");
  return res.json();
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a1a] border border-border rounded-lg px-4 py-3 shadow-xl">
        <p className="text-xs text-muted-foreground mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {formatNumber(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  const { data: analytics } = useQuery<AnalyticsData>({
    queryKey: ["analytics"],
    queryFn: fetchAnalytics,
    placeholderData: fallbackAnalytics,
  });

  const stats = analytics ?? fallbackAnalytics;

  const viewsData = useMemo(() => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : 180;
    return generateViewsData(days);
  }, [timeRange]);

  const metricCards = [
    { label: "Total Views", value: stats.totalViews, icon: Eye, format: formatNumber },
    { label: "Total Likes", value: stats.totalLikes, icon: ThumbsUp, format: formatNumber },
    { label: "Total Shares", value: stats.totalShares, icon: Share2, format: formatNumber },
    { label: "Total Comments", value: stats.totalComments, icon: MessageCircle, format: formatNumber },
    { label: "Avg Engagement", value: stats.avgEngagement, icon: TrendingUp, format: (v: number) => v.toFixed(1) + "%" },
    { label: "Total Posts", value: stats.totalPosts, icon: Trophy, format: (v: number) => v.toString() },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#e0e0e0]">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track performance across all platforms
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {(["7d", "30d", "90d", "all"] as TimeRange[]).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              className={cn(
                timeRange === range
                  ? "bg-[#8B0000] hover:bg-[#a00000] text-white"
                  : "border-border text-muted-foreground hover:text-[#e0e0e0] hover:bg-[#ffffff08]"
              )}
              onClick={() => setTimeRange(range)}
            >
              {range === "all" ? "All" : range}
            </Button>
          ))}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {metricCards.map((card) => (
          <Card key={card.label} className="bg-[#1a1a1a] border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <card.icon className="h-4 w-4 text-[#8B0000]" />
                <span className="text-xs text-muted-foreground">{card.label}</span>
              </div>
              <p className="text-xl font-bold text-[#e0e0e0]">
                {card.format(card.value)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Views Over Time Chart */}
      <Card className="bg-[#1a1a1a] border-border">
        <CardHeader>
          <CardTitle className="text-lg text-[#e0e0e0]">
            Views Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={viewsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis
                  dataKey="date"
                  stroke="#666"
                  tick={{ fill: "#999", fontSize: 12 }}
                  tickFormatter={(value) => {
                    const d = new Date(value);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                  }}
                />
                <YAxis
                  stroke="#666"
                  tick={{ fill: "#999", fontSize: 12 }}
                  tickFormatter={(v) => formatNumber(v)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ color: "#999", fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="tiktok"
                  name="TikTok"
                  stroke="#ec4899"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5, fill: "#ec4899" }}
                />
                <Line
                  type="monotone"
                  dataKey="youtube"
                  name="YouTube"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5, fill: "#ef4444" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Engagement & Scene Type Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement by Platform */}
        <Card className="bg-[#1a1a1a] border-border">
          <CardHeader>
            <CardTitle className="text-lg text-[#e0e0e0]">
              Engagement by Platform
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={engagementByPlatform}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis
                    dataKey="platform"
                    stroke="#666"
                    tick={{ fill: "#999", fontSize: 12 }}
                  />
                  <YAxis
                    stroke="#666"
                    tick={{ fill: "#999", fontSize: 12 }}
                    tickFormatter={(v) => formatNumber(v)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: "#999", fontSize: 12 }} />
                  <Bar dataKey="likes" name="Likes" fill="#ec4899" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="shares" name="Shares" fill="#8B0000" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="comments" name="Comments" fill="#ff4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Performance by Scene Type */}
        <Card className="bg-[#1a1a1a] border-border">
          <CardHeader>
            <CardTitle className="text-lg text-[#e0e0e0]">
              Performance by Scene Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={performanceBySceneType}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {performanceBySceneType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [`${value}%`, name]}
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #333",
                      borderRadius: "8px",
                      color: "#e0e0e0",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {performanceBySceneType.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2 text-sm">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-muted-foreground">{entry.name}</span>
                  <span className="text-[#e0e0e0] ml-auto font-mono text-xs">
                    ~{formatNumber(entry.avgViews)} avg
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers Table */}
      <Card className="bg-[#1a1a1a] border-border">
        <CardHeader>
          <CardTitle className="text-lg text-[#e0e0e0]">
            Top Performing Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">#</TableHead>
                <TableHead className="text-muted-foreground">Caption</TableHead>
                <TableHead className="text-muted-foreground">Platform</TableHead>
                <TableHead className="text-muted-foreground">Scene Type</TableHead>
                <TableHead className="text-muted-foreground text-right">Views</TableHead>
                <TableHead className="text-muted-foreground text-right">Engagement</TableHead>
                <TableHead className="text-muted-foreground text-right">Posted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topPerformers.map((item, index) => (
                <TableRow key={item.id} className="border-border hover:bg-[#ffffff05]">
                  <TableCell className="font-mono text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-medium text-[#e0e0e0] max-w-[300px] truncate">
                    {item.caption}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "capitalize text-xs",
                        platformColors[item.platform]
                      )}
                    >
                      {item.platform}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "capitalize text-xs",
                        sceneTypeColors[item.scene_type]
                      )}
                    >
                      {item.scene_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-[#e0e0e0] font-mono">
                    {formatNumber(item.views)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-green-500 font-mono">
                      {item.engagement}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground text-sm">
                    {formatDate(item.posted)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
