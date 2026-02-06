"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Clock,
  Sparkles,
  AlertCircle,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  formatDateTime,
  formatRelativeTime,
  getScoreColor,
  cn,
} from "@/lib/utils/index";
import type { ContentQueue, ContentStatus, SceneType } from "@/types/database.types";

const fallbackQueue: ContentQueue[] = [
  {
    id: "1",
    concept: "Abandoned mineshaft with echoing whispers and flickering torches leading to an impossible room",
    veo_prompt: "Cinematic Minecraft horror scene: abandoned mineshaft stretching into darkness, torches flickering with dying light, faint whispers echoing from the walls, camera slowly advancing through narrow corridors, dust particles floating in dim light, sudden reveal of an impossible geometric room at the end",
    caption: "Nobody talks about what's at the end of seed -1234567890... #minecraft #horror #creepy",
    scene_description: "A long, narrow mineshaft corridor with deteriorating supports. Torches flicker irregularly. The sound of pickaxes echoes from nowhere. At the end, the corridor opens into a perfect cubic room with no exits.",
    scene_type: "liminal",
    validation_score: 8.9,
    brand_score: 9.1,
    viral_score: 8.5,
    prompt_score: 9.0,
    approved: true,
    status: "approved",
    veo_video_url: null,
    drive_file_id: null,
    scheduled_post_time: new Date(Date.now() + 3 * 3600000).toISOString(),
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 3600000).toISOString(),
  },
  {
    id: "2",
    concept: "Herobrine sighting in deep dark biome with sculk sensors activating in a pattern",
    veo_prompt: "Minecraft horror footage: deep dark biome, sculk sensors pulsing in an unnatural pattern, a pale white figure visible in the distance between sculk pillars, camera zooms in as figure disappears, all sensors activate simultaneously, darkness floods the screen",
    caption: "The sculk sensors spelled something out... I wish I never translated it. #herobrine #minecraft",
    scene_description: "The deep dark biome stretches endlessly. Sculk sensors activate one by one in a deliberate pattern. Between distant columns, a white-eyed figure watches. When noticed, it vanishes, and every sensor in the biome activates at once.",
    scene_type: "entity",
    validation_score: 9.1,
    brand_score: 8.8,
    viral_score: 9.4,
    prompt_score: 9.0,
    approved: true,
    status: "approved",
    veo_video_url: null,
    drive_file_id: null,
    scheduled_post_time: new Date(Date.now() + 7 * 3600000).toISOString(),
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
  {
    id: "3",
    concept: "World corruption glitch spreading across ocean monument like digital decay",
    veo_prompt: "Minecraft glitch horror: ocean monument underwater, blocks beginning to corrupt and dissolve into void, corruption spreading like infection, guardian mobs frozen mid-animation, water draining into corrupted blocks, distorted textures and missingno-like patterns",
    caption: "My world started deleting itself... and it's still going. #minecraft #glitch #cursed",
    scene_description: "An ocean monument begins to corrupts block by block. The corruption spreads like a virus, turning blocks into void patches with distorted textures. Guardians freeze in place as the corruption reaches them.",
    scene_type: "glitch",
    validation_score: 7.8,
    brand_score: 7.5,
    viral_score: 8.2,
    prompt_score: 7.5,
    approved: false,
    status: "pending",
    veo_video_url: null,
    drive_file_id: null,
    scheduled_post_time: null,
    created_at: new Date(Date.now() - 1 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 3600000).toISOString(),
  },
  {
    id: "4",
    concept: "Impossible Nether fortress room with gravity-defying lava and inverted architecture",
    veo_prompt: "Surreal Minecraft horror: nether fortress interior, lava flowing upward defying gravity, rooms connected in impossible M.C. Escher geometry, wither skeletons walking on walls and ceilings, camera rotates to reveal the fortress is inside-out",
    caption: "The fortress was built by something that doesn't understand our physics. #minecraft #nether #horror",
    scene_description: "A Nether fortress where the laws of physics don't apply. Lava flows upward, corridors connect at impossible angles, and wither skeletons patrol on walls and ceilings as if gravity is local to each surface.",
    scene_type: "build",
    validation_score: 8.4,
    brand_score: 8.6,
    viral_score: 7.9,
    prompt_score: 8.7,
    approved: true,
    status: "generated",
    veo_video_url: "https://example.com/video.mp4",
    drive_file_id: "abc123",
    scheduled_post_time: new Date(Date.now() + 15 * 3600000).toISOString(),
    created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
  {
    id: "5",
    concept: "Empty village at night with all doors removed and beds facing the same direction",
    veo_prompt: "Eerie Minecraft scene: village at midnight, every door has been removed from every house, all beds are facing the same impossible direction, no villagers present, footstep sounds from empty houses, camera peers through doorless frames revealing identical interiors",
    caption: "Every bed in the village was facing the same way. Every door was gone. #minecraft #horror #creepypasta",
    scene_description: "A village at night where something has removed every door. Inside each house, the beds face the exact same direction. No villagers remain. The player's footsteps echo against unnatural silence.",
    scene_type: "liminal",
    validation_score: 8.7,
    brand_score: 9.0,
    viral_score: 8.8,
    prompt_score: 8.3,
    approved: true,
    status: "posted",
    veo_video_url: "https://example.com/video2.mp4",
    drive_file_id: "def456",
    scheduled_post_time: new Date(Date.now() - 2 * 3600000).toISOString(),
    created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: "6",
    concept: "Cave sound source discovered - it was never ambient audio",
    veo_prompt: "Found-footage Minecraft horror: player mining deep underground, cave ambient sound plays, player follows the sound source, discovers it's coming from a specific block, breaks the block to reveal a small chamber with signs written in enchanting table language",
    caption: "I found where cave sounds actually come from. I wish I hadn't. #minecraft #horror",
    scene_description: "A player mines deep underground following a cave sound to its source. The sound emanates from a specific block. Breaking it reveals a tiny sealed chamber with signs covered in enchanting table glyphs.",
    scene_type: "entity",
    validation_score: 6.9,
    brand_score: 7.2,
    viral_score: 6.5,
    prompt_score: 7.0,
    approved: false,
    status: "rejected",
    veo_video_url: null,
    drive_file_id: null,
    scheduled_post_time: null,
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 3600000).toISOString(),
  },
];

async function fetchQueue(): Promise<ContentQueue[]> {
  const res = await fetch("/api/queue");
  if (!res.ok) throw new Error("Failed to fetch queue");
  return res.json();
}

const statusColors: Record<ContentStatus, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  approved: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  generated: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  posted: "bg-green-500/20 text-green-400 border-green-500/30",
  rejected: "bg-red-500/20 text-red-400 border-red-500/30",
};

const sceneTypeColors: Record<SceneType, string> = {
  liminal: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  entity: "bg-red-500/20 text-red-400 border-red-500/30",
  glitch: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  build: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

export default function QueuePage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sceneFilter, setSceneFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<ContentQueue | null>(null);

  const { data, isLoading } = useQuery<ContentQueue[]>({
    queryKey: ["queue"],
    queryFn: fetchQueue,
    placeholderData: fallbackQueue,
  });

  const queue = data ?? fallbackQueue;

  const filtered = queue.filter((item) => {
    if (statusFilter !== "all" && item.status !== statusFilter) return false;
    if (sceneFilter !== "all" && item.scene_type !== sceneFilter) return false;
    if (
      searchQuery &&
      !item.concept.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.caption.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#e0e0e0]">Content Queue</h1>
        <p className="text-muted-foreground mt-1">
          Manage and review upcoming horror content
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px] bg-[#1a1a1a] border-border text-[#e0e0e0]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a1a] border-border">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="generated">Generated</SelectItem>
            <SelectItem value="posted">Posted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sceneFilter} onValueChange={setSceneFilter}>
          <SelectTrigger className="w-full sm:w-[180px] bg-[#1a1a1a] border-border text-[#e0e0e0]">
            <SelectValue placeholder="Scene Type" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a1a] border-border">
            <SelectItem value="all">All Scene Types</SelectItem>
            <SelectItem value="liminal">Liminal</SelectItem>
            <SelectItem value="entity">Entity</SelectItem>
            <SelectItem value="glitch">Glitch</SelectItem>
            <SelectItem value="build">Build</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search concepts or captions..."
            className="pl-10 bg-[#1a1a1a] border-border text-[#e0e0e0] placeholder:text-muted-foreground"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#e0e0e0]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filtered.length} of {queue.length} items
      </p>

      {/* Content Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="bg-[#1a1a1a] border-border">
              <CardContent className="p-5">
                <div className="animate-pulse space-y-3">
                  <div className="flex gap-2">
                    <div className="h-5 w-16 bg-muted rounded" />
                    <div className="h-5 w-16 bg-muted rounded" />
                  </div>
                  <div className="h-4 w-full bg-muted rounded" />
                  <div className="h-4 w-3/4 bg-muted rounded" />
                  <div className="h-10 w-full bg-muted rounded" />
                  <div className="h-4 w-1/2 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="bg-[#1a1a1a] border-border">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-[#e0e0e0] mb-2">
              No content found
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              No content matches your current filters. Try adjusting your search
              criteria or generate new content.
            </p>
            <Button
              className="mt-4 bg-[#8B0000] hover:bg-[#a00000] text-white"
              onClick={() => {
                setStatusFilter("all");
                setSceneFilter("all");
                setSearchQuery("");
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <Card
              key={item.id}
              className="bg-[#1a1a1a] border-border hover:border-[#8B0000]/50 transition-colors cursor-pointer glow-red-hover"
              onClick={() => setSelectedItem(item)}
            >
              <CardContent className="p-5 space-y-3">
                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs capitalize",
                      sceneTypeColors[item.scene_type]
                    )}
                  >
                    {item.scene_type}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs capitalize",
                      statusColors[item.status]
                    )}
                  >
                    {item.status}
                  </Badge>
                </div>

                {/* Concept */}
                <p className="text-sm text-[#e0e0e0] line-clamp-2 font-medium">
                  {item.concept}
                </p>

                {/* Caption */}
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {item.caption}
                </p>

                {/* Quality Score */}
                {item.validation_score !== null && (
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Quality:</span>
                    <span
                      className={cn(
                        "text-sm font-mono font-bold",
                        getScoreColor(item.validation_score)
                      )}
                    >
                      {item.validation_score.toFixed(1)}
                    </span>
                  </div>
                )}

                {/* Scheduled Time */}
                {item.scheduled_post_time && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formatRelativeTime(item.scheduled_post_time)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="bg-[#1a1a1a] border-border text-[#e0e0e0] max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="text-[#e0e0e0] text-xl pr-6">
                  Content Details
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Status & Scene Type */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className={cn(
                      "capitalize",
                      sceneTypeColors[selectedItem.scene_type]
                    )}
                  >
                    {selectedItem.scene_type}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      "capitalize",
                      statusColors[selectedItem.status]
                    )}
                  >
                    {selectedItem.status}
                  </Badge>
                  {selectedItem.approved && (
                    <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                      Approved
                    </Badge>
                  )}
                </div>

                {/* Concept */}
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                    Concept
                  </h4>
                  <p className="text-sm">{selectedItem.concept}</p>
                </div>

                {/* Scene Description */}
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                    Scene Description
                  </h4>
                  <p className="text-sm">{selectedItem.scene_description}</p>
                </div>

                {/* Caption */}
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                    Caption
                  </h4>
                  <p className="text-sm italic">{selectedItem.caption}</p>
                </div>

                {/* VEO Prompt */}
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                    VEO Prompt
                  </h4>
                  <div className="bg-[#0a0a0a] rounded-lg p-3 border border-border">
                    <p className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                      {selectedItem.veo_prompt}
                    </p>
                  </div>
                </div>

                {/* Scores */}
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-3">
                    Quality Scores
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: "Overall", value: selectedItem.validation_score },
                      { label: "Brand", value: selectedItem.brand_score },
                      { label: "Viral", value: selectedItem.viral_score },
                      { label: "Prompt", value: selectedItem.prompt_score },
                    ].map((score) => (
                      <div
                        key={score.label}
                        className="text-center p-3 bg-[#0a0a0a] rounded-lg border border-border"
                      >
                        <p className="text-xs text-muted-foreground mb-1">
                          {score.label}
                        </p>
                        <p
                          className={cn(
                            "text-xl font-bold font-mono",
                            score.value !== null
                              ? getScoreColor(score.value)
                              : "text-muted-foreground"
                          )}
                        >
                          {score.value !== null ? score.value.toFixed(1) : "N/A"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Schedule */}
                {selectedItem.scheduled_post_time && (
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                      Scheduled
                    </h4>
                    <p className="text-sm">
                      {formatDateTime(selectedItem.scheduled_post_time)}{" "}
                      <span className="text-muted-foreground">
                        ({formatRelativeTime(selectedItem.scheduled_post_time)})
                      </span>
                    </p>
                  </div>
                )}

                {/* Timestamps */}
                <div className="flex gap-6 text-xs text-muted-foreground pt-2 border-t border-border">
                  <span>Created: {formatDateTime(selectedItem.created_at)}</span>
                  <span>Updated: {formatDateTime(selectedItem.updated_at)}</span>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
