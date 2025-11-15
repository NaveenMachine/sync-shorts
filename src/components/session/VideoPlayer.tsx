import { Button } from "@/components/ui/button";
import { SkipForward } from "lucide-react";
import { useEffect, useRef } from "react";

interface VideoPlayerProps {
  videoId: string | null;
  source: string | null;
  feedOwnerName?: string;
  onNextVideo: () => void;
  isAlgorithmOwner: boolean;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

export const VideoPlayer = ({
  videoId,
  source,
  feedOwnerName,
  onNextVideo,
  isAlgorithmOwner,
}: VideoPlayerProps) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      if (window.YT && window.YT.Player && videoId && containerRef.current) {
        // Clear container
        containerRef.current.innerHTML = '';
        
        playerRef.current = new window.YT.Player(containerRef.current, {
          videoId: videoId,
          playerVars: {
            autoplay: 1,
            playsinline: 1,
            rel: 0,
          },
          events: {
            onStateChange: (event: any) => {
              // YT.PlayerState.ENDED = 0
              if (event.data === 0) {
                console.log('Video ended, playing next...');
                onNextVideo();
              }
            },
          },
        });
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoId, onNextVideo]);

  return (
    <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
      {/* Video Container */}
      <div className="relative aspect-[9/16] bg-black max-w-md mx-auto">
        {videoId ? (
          <div ref={containerRef} className="absolute inset-0 w-full h-full" />
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

          {isAlgorithmOwner && (
            <Button 
              onClick={onNextVideo} 
              size="sm" 
              className="gap-2"
            >
              <SkipForward className="w-4 h-4" />
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
