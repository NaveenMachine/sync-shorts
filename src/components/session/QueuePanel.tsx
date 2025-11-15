import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface QueuePanelProps {
  sessionId: string;
  participantId: string;
  queueItems: any[];
}

export const QueuePanel = ({
  sessionId,
  participantId,
  queueItems,
}: QueuePanelProps) => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
      /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    // Check if it's just a video ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
      return url;
    }

    return null;
  };

  const handleAddToQueue = async () => {
    if (!youtubeUrl.trim()) {
      toast.error("Please enter a YouTube URL");
      return;
    }

    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      toast.error("Invalid YouTube URL");
      return;
    }

    setIsAdding(true);
    try {
      const { error } = await supabase.from("queue_items").insert({
        session_id: sessionId,
        video_id: videoId,
        added_by: participantId,
        thumbnail_url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      });

      if (error) throw error;

      setYoutubeUrl("");
      toast.success("Added to queue!");
    } catch (error: any) {
      console.error("Error adding to queue:", error);
      toast.error("Failed to add to queue");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveFromQueue = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("queue_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      toast.success("Removed from queue");
    } catch (error: any) {
      console.error("Error removing from queue:", error);
      toast.error("Failed to remove from queue");
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4 space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-2">Queue</h2>
        <p className="text-sm text-muted-foreground">
          Add YouTube Shorts to play next
        </p>
      </div>

      {/* Add to Queue */}
      <div className="space-y-2">
        <Input
          placeholder="Paste YouTube Shorts URL"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          className="bg-secondary border-border"
          onKeyDown={(e) => e.key === "Enter" && handleAddToQueue()}
        />
        <Button
          onClick={handleAddToQueue}
          disabled={isAdding}
          className="w-full"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          {isAdding ? "Adding..." : "Add to Queue"}
        </Button>
      </div>

      {/* Queue List */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {queueItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Queue is empty. Add videos above!
          </div>
        ) : (
          queueItems.map((item, index) => (
            <div
              key={item.id}
              className="bg-secondary rounded-lg p-3 flex items-center gap-3 group"
            >
              <span className="text-xs font-medium text-muted-foreground w-6">
                #{index + 1}
              </span>
              {item.thumbnail_url && (
                <img
                  src={item.thumbnail_url}
                  alt=""
                  className="w-16 h-9 object-cover rounded"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {item.title || "YouTube Short"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {item.video_id}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveFromQueue(item.id)}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
