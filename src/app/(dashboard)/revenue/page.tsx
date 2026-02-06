"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
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
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  formatCurrency,
  formatNumber,
  formatDate,
  cn,
} from "@/lib/utils/index";

type TimeRange = "7d" | "30d" | "90d" | "all";

// Generate revenue timeline data
function generateRevenueTimeline(days: number) {
  const data = [];
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const baseTikTok = 25 + Math.random() * 55;
    const baseYouTube = 40 + Math.random() * 80;
    const baseProducts = 10 + Math.random() * 30;
    const baseAffiliate = 5 + Math.random() * 15;
    const weekendBoost = [0, 6].includes(date.getDay()) ? 1.3 : 1;
    data.push({
      date: date.toISOString().split("T")[0],
      tiktok_fund: parseFloat((baseTikTok * weekendBoost).toFixed(2)),
      youtube_adsense: parseFloat((baseYouTube * weekendBoost).toFixed(2)),
      product_sales: parseFloat((baseProducts * weekendBoost).toFixed(2)),
      affiliate: parseFloat((baseAffiliate * weekendBoost).toFixed(2)),
    });
  }
  return data;
}

// Monthly breakdown for stacked bar chart
const monthlyBreakdown = [
  { month: "Sep", tiktok_fund: 820, youtube_adsense: 1340, product_sales: 420, affiliate: 180 },
  { month: "Oct", tiktok_fund: 960, youtube_adsense: 1520, product_sales: 510, affiliate: 220 },
  { month: "Nov", tiktok_fund: 1100, youtube_adsense: 1680, product_sales: 580, affiliate: 260 },
  { month: "Dec", tiktok_fund: 1350, youtube_adsense: 2100, product_sales: 720, affiliate: 340 },
  { month: "Jan", tiktok_fund: 1480, youtube_adsense: 2350, product_sales: 810, affiliate: 390 },
  { month: "Feb", tiktok_fund: 520, youtube_adsense: 780, product_sales: 280, affiliate: 130 },
];

const topEarningVideos = [
  {
    id: "1",
    caption: "This seed should NOT exist... #cursed #minecraft",
    platform: "tiktok",
    views: 2_400_000,
    revenue: 1_240.00,
    posted: "2026-01-28",
  },
  {
    id: "2",
    caption: "POV: You hear digging below your base at 3am",
    platform: "tiktok",
    views: 1_850_000,
    revenue: 920.50,
    posted: "2026-01-25",
  },
  {
    id: "3",
    caption: "Entity 303 Full Investigation - 45 min documentary",
    platform: "youtube",
    views: 890_000,
    revenue: 780.00,
    posted: "2026-01-18",
  },
  {
    id: "4",
    caption: "Nobody talks about what happens on day 1000...",
    platform: "tiktok",
    views: 1_620_000,
    revenue: 650.30,
    posted: "2026-01-20",
  },
  {
    id: "5",
    caption: "The Backrooms of Minecraft - Complete Exploration",
    platform: "youtube",
    views: 742_000,
    revenue: 595.00,
    posted: "2026-01-15",
  },
  {
    id: "6",
    caption: "Herobrine sighting with proof - world download",
    platform: "youtube",
    views: 520_000,
    revenue: 445.20,
    posted: "2026-01-10",
  },
  {
    id: "7",
    caption: "The fog rolled in and everything changed",
    platform: "youtube",
    views: 480_000,
    revenue: 390.00,
    posted: "2026-01-08",
  },
];

const platformColors: Record<string, string> = {
  tiktok: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  youtube: "bg-red-600/20 text-red-400 border-red-600/30",
};

const sourceColors = {
  tiktok_fund: "#ec4899",
  youtube_adsense: "#ef4444",
  product_sales: "#f59e0b",
  affiliate: "#8b5cf6",
};

const sourceLabels: Record<string, string> = {
  tiktok_fund: "TikTok Fund",
  youtube_adsense: "YouTube AdSense",
  product_sales: "Product Sales",
  affiliate: "Affiliate",
};

interface RevenueData {
  totalRevenue: number;
  thisMonth: number;
  lastMonth: number;
  avgPerVideo: number;
  projected: number;
  totalVideos: number;
}

const fallbackRevenue: RevenueData = {
  totalRevenue: 18_750.00,
  thisMonth: 1_710.00,
  lastMonth: 5_030.00,
  avgPerVideo: 75.91,
  projected: 5_450.00,
  totalVideos: 247,
};

async function fetchRevenue(): Promise<RevenueData> {
  const res = await fetch("/api/revenue");
  if (!res.ok) throw new Error("Failed to fetch revenue");
  return res.json();
}

const RevenueTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((sum, entry) => sum + entry.value, 0);
    return (
      <div className="bg-[#1a1a1a] border border-border rounded-lg px-4 py-3 shadow-xl">
        <p className="text-xs text-muted-foreground mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {sourceLabels[entry.name] || entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
        <p className="text-sm font-bold text-[#e0e0e0] mt-1 pt-1 border-t border-border">
          Total: {formatCurrency(total)}
        </p>
      </div>
    );
  }
  return null;
};

export default function RevenuePage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  const { data: revenue } = useQuery<RevenueData>({
    queryKey: ["revenue"],
    queryFn: fetchRevenue,
    placeholderData: fallbackRevenue,
  });

  const stats = revenue ?? fallbackRevenue;

  const timelineData = useMemo(() => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : 180;
    return generateRevenueTimeline(days);
  }, [timeRange]);

  const monthChange = stats.lastMonth > 0
    ? ((stats.thisMonth - stats.lastMonth) / stats.lastMonth) * 100
    : 0;

  const summaryCards = [
    {
      label: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      subtitle: `From ${stats.totalVideos} videos`,
    },
    {
      label: "This Month",
      value: formatCurrency(stats.thisMonth),
      icon: Calendar,
      subtitle: (
        <span className={cn("flex items-center gap-1", monthChange >= 0 ? "text-green-500" : "text-red-500")}>
          {monthChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {Math.abs(monthChange).toFixed(1)}% vs last month
        </span>
      ),
    },
    {
      label: "Avg Per Video",
      value: formatCurrency(stats.avgPerVideo),
      icon: TrendingUp,
      subtitle: "Across all platforms",
    },
    {
      label: "Projected (Month)",
      value: formatCurrency(stats.projected),
      icon: TrendingUp,
      subtitle: "Based on current trends",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#e0e0e0]">Revenue</h1>
          <p className="text-muted-foreground mt-1">
            Track earnings across all monetization channels
          </p>
        </div>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.label} className="bg-[#1a1a1a] border-border glow-red-hover">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{card.label}</span>
                <card.icon className="h-4 w-4 text-[#8B0000]" />
              </div>
              <div className="text-2xl font-bold text-[#e0e0e0]">{card.value}</div>
              <div className="mt-2 text-xs text-muted-foreground">
                {card.subtitle}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Breakdown - Stacked Bar */}
      <Card className="bg-[#1a1a1a] border-border">
        <CardHeader>
          <CardTitle className="text-lg text-[#e0e0e0]">
            Revenue Breakdown by Source
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis
                  dataKey="month"
                  stroke="#666"
                  tick={{ fill: "#999", fontSize: 12 }}
                />
                <YAxis
                  stroke="#666"
                  tick={{ fill: "#999", fontSize: 12 }}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip content={<RevenueTooltip />} />
                <Legend
                  wrapperStyle={{ color: "#999", fontSize: 12 }}
                  formatter={(value) => sourceLabels[value] || value}
                />
                <Bar dataKey="tiktok_fund" stackId="a" fill={sourceColors.tiktok_fund} radius={[0, 0, 0, 0]} />
                <Bar dataKey="youtube_adsense" stackId="a" fill={sourceColors.youtube_adsense} radius={[0, 0, 0, 0]} />
                <Bar dataKey="product_sales" stackId="a" fill={sourceColors.product_sales} radius={[0, 0, 0, 0]} />
                <Bar dataKey="affiliate" stackId="a" fill={sourceColors.affiliate} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Timeline - Area Chart */}
      <Card className="bg-[#1a1a1a] border-border">
        <CardHeader>
          <CardTitle className="text-lg text-[#e0e0e0]">
            Revenue Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="tiktokGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={sourceColors.tiktok_fund} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={sourceColors.tiktok_fund} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="youtubeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={sourceColors.youtube_adsense} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={sourceColors.youtube_adsense} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="productsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={sourceColors.product_sales} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={sourceColors.product_sales} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="affiliateGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={sourceColors.affiliate} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={sourceColors.affiliate} stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip content={<RevenueTooltip />} />
                <Legend
                  wrapperStyle={{ color: "#999", fontSize: 12 }}
                  formatter={(value) => sourceLabels[value] || value}
                />
                <Area
                  type="monotone"
                  dataKey="tiktok_fund"
                  stackId="1"
                  stroke={sourceColors.tiktok_fund}
                  fill="url(#tiktokGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="youtube_adsense"
                  stackId="1"
                  stroke={sourceColors.youtube_adsense}
                  fill="url(#youtubeGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="product_sales"
                  stackId="1"
                  stroke={sourceColors.product_sales}
                  fill="url(#productsGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="affiliate"
                  stackId="1"
                  stroke={sourceColors.affiliate}
                  fill="url(#affiliateGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Earning Videos */}
      <Card className="bg-[#1a1a1a] border-border">
        <CardHeader>
          <CardTitle className="text-lg text-[#e0e0e0]">
            Top Earning Videos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">#</TableHead>
                <TableHead className="text-muted-foreground">Caption</TableHead>
                <TableHead className="text-muted-foreground">Platform</TableHead>
                <TableHead className="text-muted-foreground text-right">Views</TableHead>
                <TableHead className="text-muted-foreground text-right">Revenue</TableHead>
                <TableHead className="text-muted-foreground text-right">RPM</TableHead>
                <TableHead className="text-muted-foreground text-right">Posted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topEarningVideos.map((video, index) => {
                const rpm = video.views > 0 ? (video.revenue / video.views) * 1000 : 0;
                return (
                  <TableRow key={video.id} className="border-border hover:bg-[#ffffff05]">
                    <TableCell className="font-mono text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium text-[#e0e0e0] max-w-[300px] truncate">
                      {video.caption}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "capitalize text-xs",
                          platformColors[video.platform]
                        )}
                      >
                        {video.platform}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-[#e0e0e0] font-mono">
                      {formatNumber(video.views)}
                    </TableCell>
                    <TableCell className="text-right text-green-500 font-mono font-bold">
                      {formatCurrency(video.revenue)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground font-mono">
                      {formatCurrency(rpm)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-sm">
                      {formatDate(video.posted)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Revenue Source Legend */}
      <Card className="bg-[#1a1a1a] border-border">
        <CardContent className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(sourceColors).map(([key, color]) => {
              const monthTotal = monthlyBreakdown.reduce((sum, m) => sum + (m[key as keyof typeof m] as number), 0);
              return (
                <div key={key} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  <div>
                    <p className="text-sm text-[#e0e0e0]">{sourceLabels[key]}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(monthTotal)} total</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
