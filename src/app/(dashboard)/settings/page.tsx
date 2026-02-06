"use client";

import { useState } from "react";
import {
  Shield,
  Key,
  Zap,
  SlidersHorizontal,
  Eye,
  EyeOff,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils/index";
import type { GuidelineCategory } from "@/types/database.types";

// ─── Toggle Switch Component ───────────────────────────────────────────────────
function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        checked ? "bg-[#8B0000]" : "bg-muted",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}

// ─── Slider Component ───────────────────────────────────────────────────────────
function Slider({
  value,
  onChange,
  min,
  max,
  step,
  label,
  suffix,
}: {
  value: number;
  onChange: (val: number) => void;
  min: number;
  max: number;
  step: number;
  label: string;
  suffix?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[#e0e0e0]">{label}</span>
        <span className="text-sm font-mono text-[#ff4444]">
          {value.toFixed(1)}{suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-[#8B0000]"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

// ─── Brand Guidelines Data ──────────────────────────────────────────────────────
interface GuidelineRule {
  id: string;
  category: GuidelineCategory;
  rule: string;
  active: boolean;
}

const defaultGuidelines: GuidelineRule[] = [
  { id: "t1", category: "tone", rule: "Maintain eerie, unsettling atmosphere in all captions", active: true },
  { id: "t2", category: "tone", rule: "Use first-person POV for immersive horror experience", active: true },
  { id: "t3", category: "tone", rule: "End captions with suspense or unanswered questions", active: true },
  { id: "t4", category: "tone", rule: "Reference Minecraft lore and community theories", active: true },
  { id: "v1", category: "visual", rule: "Dark, low-light environments with dramatic shadows", active: true },
  { id: "v2", category: "visual", rule: "Include fog or particle effects for atmosphere", active: true },
  { id: "v3", category: "visual", rule: "Camera movement should be slow and deliberate", active: true },
  { id: "v4", category: "visual", rule: "Use desaturated color palette with red accents", active: false },
  { id: "c1", category: "caption", rule: "Include 3-5 relevant hashtags per post", active: true },
  { id: "c2", category: "caption", rule: "Keep captions under 150 characters for TikTok", active: true },
  { id: "c3", category: "caption", rule: "Use ellipsis for suspense (...)", active: true },
  { id: "c4", category: "caption", rule: "Include call-to-action in YouTube descriptions", active: true },
  { id: "f1", category: "forbidden", rule: "No real-world violence or gore references", active: true },
  { id: "f2", category: "forbidden", rule: "No jumpscares with loud audio", active: true },
  { id: "f3", category: "forbidden", rule: "No content targeting younger audiences with extreme horror", active: true },
  { id: "f4", category: "forbidden", rule: "No misleading claims about actual Minecraft bugs", active: false },
];

const categoryMeta: Record<GuidelineCategory, { label: string; color: string }> = {
  tone: { label: "Tone & Voice", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  visual: { label: "Visual Style", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  caption: { label: "Caption Rules", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  forbidden: { label: "Forbidden Content", color: "bg-red-500/20 text-red-400 border-red-500/30" },
};

// ─── API Configuration Data ─────────────────────────────────────────────────────
interface ApiKeyConfig {
  id: string;
  label: string;
  key: string;
  description: string;
}

const defaultApiKeys: ApiKeyConfig[] = [
  { id: "openai", label: "OpenAI API Key", key: "sk-proj-****************************", description: "Used for content generation and quality scoring" },
  { id: "supabase_url", label: "Supabase URL", key: "https://******.supabase.co", description: "Database and backend services" },
  { id: "supabase_key", label: "Supabase Anon Key", key: "eyJhbGciOiJI****************************", description: "Public API key for Supabase" },
  { id: "tiktok", label: "TikTok API Token", key: "tt-****************************", description: "For posting and analytics on TikTok" },
  { id: "youtube", label: "YouTube API Key", key: "AIza****************************", description: "For posting and analytics on YouTube" },
  { id: "google_drive", label: "Google Drive Service Account", key: '{"type":"service_account","project_id":"****"}', description: "For video storage and management" },
];

// ─── Settings Page Component ────────────────────────────────────────────────────
export default function SettingsPage() {
  const [guidelines, setGuidelines] = useState(defaultGuidelines);
  const [apiKeys, setApiKeys] = useState(defaultApiKeys);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [testingKey, setTestingKey] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  // Automation settings
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [autoPublish, setAutoPublish] = useState(false);
  const [autoAnalytics, setAutoAnalytics] = useState(true);
  const [generateInterval, setGenerateInterval] = useState(4);
  const [maxQueueSize, setMaxQueueSize] = useState(20);
  const [analyticsRefresh, setAnalyticsRefresh] = useState(6);

  // Quality thresholds
  const [overallMin, setOverallMin] = useState(7.5);
  const [brandMin, setBrandMin] = useState(7.5);
  const [viralMin, setViralMin] = useState(7.0);
  const [promptMin, setPromptMin] = useState(7.0);

  const toggleGuideline = (id: string) => {
    setGuidelines((prev) =>
      prev.map((g) => (g.id === id ? { ...g, active: !g.active } : g))
    );
  };

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleTestKey = async (id: string) => {
    setTestingKey(id);
    // Simulate API test
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setTestResults((prev) => ({ ...prev, [id]: true }));
    setTestingKey(null);
  };

  const guidelinesByCategory = (category: GuidelineCategory) =>
    guidelines.filter((g) => g.category === category);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#e0e0e0]">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure your horror content generation pipeline
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="brand" className="space-y-6">
        <TabsList className="bg-[#1a1a1a] border border-border p-1">
          <TabsTrigger
            value="brand"
            className="data-[state=active]:bg-[#8B0000] data-[state=active]:text-white text-muted-foreground"
          >
            <Shield className="h-4 w-4 mr-2" />
            Brand Guidelines
          </TabsTrigger>
          <TabsTrigger
            value="api"
            className="data-[state=active]:bg-[#8B0000] data-[state=active]:text-white text-muted-foreground"
          >
            <Key className="h-4 w-4 mr-2" />
            API Configuration
          </TabsTrigger>
          <TabsTrigger
            value="automation"
            className="data-[state=active]:bg-[#8B0000] data-[state=active]:text-white text-muted-foreground"
          >
            <Zap className="h-4 w-4 mr-2" />
            Automation
          </TabsTrigger>
          <TabsTrigger
            value="quality"
            className="data-[state=active]:bg-[#8B0000] data-[state=active]:text-white text-muted-foreground"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Quality Thresholds
          </TabsTrigger>
        </TabsList>

        {/* ─── Brand Guidelines Tab ──────────────────────────────────────── */}
        <TabsContent value="brand" className="space-y-6">
          {(["tone", "visual", "caption", "forbidden"] as GuidelineCategory[]).map(
            (category) => (
              <Card key={category} className="bg-[#1a1a1a] border-border">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={cn("text-xs", categoryMeta[category].color)}
                    >
                      {categoryMeta[category].label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {guidelinesByCategory(category).filter((g) => g.active).length}/
                      {guidelinesByCategory(category).length} active
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {guidelinesByCategory(category).map((rule) => (
                    <div
                      key={rule.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border transition-colors",
                        rule.active
                          ? "bg-[#0a0a0a] border-border"
                          : "bg-[#0a0a0a]/50 border-border/50"
                      )}
                    >
                      <span
                        className={cn(
                          "text-sm",
                          rule.active ? "text-[#e0e0e0]" : "text-muted-foreground line-through"
                        )}
                      >
                        {rule.rule}
                      </span>
                      <Toggle
                        checked={rule.active}
                        onChange={() => toggleGuideline(rule.id)}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )
          )}
        </TabsContent>

        {/* ─── API Configuration Tab ─────────────────────────────────────── */}
        <TabsContent value="api" className="space-y-4">
          {apiKeys.map((apiKey) => (
            <Card key={apiKey.id} className="bg-[#1a1a1a] border-border">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-[#e0e0e0]">
                        {apiKey.label}
                      </h4>
                      {testResults[apiKey.id] && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {apiKey.description}
                    </p>
                    <div className="relative">
                      <Input
                        type={visibleKeys[apiKey.id] ? "text" : "password"}
                        value={apiKey.key}
                        onChange={(e) =>
                          setApiKeys((prev) =>
                            prev.map((k) =>
                              k.id === apiKey.id
                                ? { ...k, key: e.target.value }
                                : k
                            )
                          )
                        }
                        className="bg-[#0a0a0a] border-border text-[#e0e0e0] font-mono text-xs pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => toggleKeyVisibility(apiKey.id)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#e0e0e0]"
                      >
                        {visibleKeys[apiKey.id] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border text-muted-foreground hover:text-[#e0e0e0] hover:bg-[#ffffff08] self-end sm:self-center"
                    onClick={() => handleTestKey(apiKey.id)}
                    disabled={testingKey === apiKey.id}
                  >
                    {testingKey === apiKey.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      "Test Connection"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-end pt-2">
            <Button className="bg-[#8B0000] hover:bg-[#a00000] text-white">
              Save API Configuration
            </Button>
          </div>
        </TabsContent>

        {/* ─── Automation Tab ────────────────────────────────────────────── */}
        <TabsContent value="automation" className="space-y-6">
          {/* Auto Generation */}
          <Card className="bg-[#1a1a1a] border-border">
            <CardHeader>
              <CardTitle className="text-base text-[#e0e0e0]">
                Auto-Generation
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Automatically generate new horror content concepts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#e0e0e0]">Enable Auto-Generation</p>
                  <p className="text-xs text-muted-foreground">
                    Automatically create new content concepts on a schedule
                  </p>
                </div>
                <Toggle checked={autoGenerate} onChange={setAutoGenerate} />
              </div>
              {autoGenerate && (
                <Slider
                  label="Generation Interval (hours)"
                  value={generateInterval}
                  onChange={setGenerateInterval}
                  min={1}
                  max={24}
                  step={0.5}
                  suffix="h"
                />
              )}
              {autoGenerate && (
                <Slider
                  label="Max Queue Size"
                  value={maxQueueSize}
                  onChange={setMaxQueueSize}
                  min={5}
                  max={50}
                  step={1}
                  suffix=""
                />
              )}
            </CardContent>
          </Card>

          {/* Auto Publishing */}
          <Card className="bg-[#1a1a1a] border-border">
            <CardHeader>
              <CardTitle className="text-base text-[#e0e0e0]">
                Auto-Publishing
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Automatically post approved content to platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#e0e0e0]">Enable Auto-Publish</p>
                  <p className="text-xs text-muted-foreground">
                    Post approved content at scheduled times without manual approval
                  </p>
                </div>
                <Toggle checked={autoPublish} onChange={setAutoPublish} />
              </div>
              {!autoPublish && (
                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <p className="text-xs text-yellow-400">
                    Auto-publish is disabled. Content will need manual approval before posting.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analytics Automation */}
          <Card className="bg-[#1a1a1a] border-border">
            <CardHeader>
              <CardTitle className="text-base text-[#e0e0e0]">
                Analytics Collection
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Automatically fetch and analyze performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#e0e0e0]">Enable Auto-Analytics</p>
                  <p className="text-xs text-muted-foreground">
                    Periodically refresh engagement data from all platforms
                  </p>
                </div>
                <Toggle checked={autoAnalytics} onChange={setAutoAnalytics} />
              </div>
              {autoAnalytics && (
                <Slider
                  label="Refresh Interval (hours)"
                  value={analyticsRefresh}
                  onChange={setAnalyticsRefresh}
                  min={1}
                  max={24}
                  step={0.5}
                  suffix="h"
                />
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end pt-2">
            <Button className="bg-[#8B0000] hover:bg-[#a00000] text-white">
              Save Automation Settings
            </Button>
          </div>
        </TabsContent>

        {/* ─── Quality Thresholds Tab ────────────────────────────────────── */}
        <TabsContent value="quality" className="space-y-6">
          <Card className="bg-[#1a1a1a] border-border">
            <CardHeader>
              <CardTitle className="text-base text-[#e0e0e0]">
                Minimum Quality Scores
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Content below these thresholds will be flagged for review or
                automatically rejected. Scores are on a 1-10 scale.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <Slider
                label="Overall Quality Minimum"
                value={overallMin}
                onChange={setOverallMin}
                min={1}
                max={10}
                step={0.5}
                suffix="/10"
              />
              <Slider
                label="Brand Alignment Minimum"
                value={brandMin}
                onChange={setBrandMin}
                min={1}
                max={10}
                step={0.5}
                suffix="/10"
              />
              <Slider
                label="Viral Potential Minimum"
                value={viralMin}
                onChange={setViralMin}
                min={1}
                max={10}
                step={0.5}
                suffix="/10"
              />
              <Slider
                label="Prompt Quality Minimum"
                value={promptMin}
                onChange={setPromptMin}
                min={1}
                max={10}
                step={0.5}
                suffix="/10"
              />
            </CardContent>
          </Card>

          {/* Preview of what current thresholds mean */}
          <Card className="bg-[#1a1a1a] border-border">
            <CardHeader>
              <CardTitle className="text-base text-[#e0e0e0]">
                Threshold Preview
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                How current thresholds would affect recent content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Overall", value: overallMin },
                  { label: "Brand", value: brandMin },
                  { label: "Viral", value: viralMin },
                  { label: "Prompt", value: promptMin },
                ].map((threshold) => (
                  <div
                    key={threshold.label}
                    className="text-center p-4 bg-[#0a0a0a] rounded-lg border border-border"
                  >
                    <p className="text-xs text-muted-foreground mb-2">
                      {threshold.label}
                    </p>
                    <p
                      className={cn(
                        "text-2xl font-bold font-mono",
                        threshold.value >= 8
                          ? "text-green-500"
                          : threshold.value >= 7
                          ? "text-yellow-500"
                          : "text-red-500"
                      )}
                    >
                      {threshold.value.toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {threshold.value >= 8
                        ? "Strict"
                        : threshold.value >= 7
                        ? "Standard"
                        : "Relaxed"}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-2">
            <Button className="bg-[#8B0000] hover:bg-[#a00000] text-white">
              Save Quality Thresholds
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
