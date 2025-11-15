import { Button } from "@/components/ui/button";
import { SkipForward } from "lucide-react";

interface VideoPlayerProps {
  videoId: string | null;
  source: string | null;
  feedOwnerName?: string;
  onNextVideo: () => void;
}

export const VideoPlayer = ({
  videoId,
  source,
  feedOwnerName,
  onNextVideo,
}: VideoPlayerProps) => {
  return (
    <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
      {/* Video Container */}
      <div className="relative aspect-[9/16] bg-black max-w-md mx-auto">
        {videoId ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0`}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <div className="text-center space-y-2">
              <p>No video playing</p>
              <p className="text-sm">Add videos to queue or wait for next</p>
            </div>
          </div>
        )}
      </div>

      {/* Info Bar */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {source === "queue" ? (
              <p className="text-sm text-muted-foreground">
                Playing from <span className="text-foreground font-medium">Queue</span>
              </p>
            ) : source === "feed" && feedOwnerName ? (
              <p className="text-sm text-muted-foreground">
                Playing from{" "}
                <span className="text-primary font-medium">{feedOwnerName}'s</span> feed
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Ready to play</p>
            )}
          </div>

          <Button onClick={onNextVideo} size="sm" className="gap-2">
            <SkipForward className="w-4 h-4" />
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};
