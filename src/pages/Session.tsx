import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SessionHeader } from "@/components/session/SessionHeader";
import { VideoPlayer } from "@/components/session/VideoPlayer";
import { QueuePanel } from "@/components/session/QueuePanel";
import { VotePanel } from "@/components/session/VotePanel";
import { ParticipantsList } from "@/components/session/ParticipantsList";
import { ChatPanel } from "@/components/session/ChatPanel";
import { RealtimeChannel } from "@supabase/supabase-js";

const createPlaceholderFeed = () => {
  return [
    { videoId: "WxnN05vOuSM", title: "Skibidi Toilet Meme", thumbnail: "https://img.youtube.com/vi/WxnN05vOuSM/maxresdefault.jpg" },
    { videoId: "iik25wqIuFo", title: "Discord Mod Caught", thumbnail: "https://img.youtube.com/vi/iik25wqIuFo/maxresdefault.jpg" },
    { videoId: "grd-K33tOSM", title: "Sigma Grindset", thumbnail: "https://img.youtube.com/vi/grd-K33tOSM/maxresdefault.jpg" },
    { videoId: "DyDfgMOUjCI", title: "Bad to the Bone", thumbnail: "https://img.youtube.com/vi/DyDfgMOUjCI/maxresdefault.jpg" },
    { videoId: "CKjaFG4YN6g", title: "Giga Chad Theme", thumbnail: "https://img.youtube.com/vi/CKjaFG4YN6g/maxresdefault.jpg" },
    { videoId: "Ag1o3koTLWM", title: "Vine Boom Sound", thumbnail: "https://img.youtube.com/vi/Ag1o3koTLWM/maxresdefault.jpg" },
    { videoId: "kMpRVY1imzM", title: "Quandale Dingle", thumbnail: "https://img.youtube.com/vi/kMpRVY1imzM/maxresdefault.jpg" },
    { videoId: "xvFZjo5PgG0", title: "Never Back Down", thumbnail: "https://img.youtube.com/vi/xvFZjo5PgG0/maxresdefault.jpg" },
    { videoId: "8mkofgRW1II", title: "Goofy Ahh Beat", thumbnail: "https://img.youtube.com/vi/8mkofgRW1II/maxresdefault.jpg" },
    { videoId: "vTIIMJ9tUc8", title: "Emotional Damage", thumbnail: "https://img.youtube.com/vi/vTIIMJ9tUc8/maxresdefault.jpg" },
    { videoId: "9bZkp7q19f0", title: "Gangnam Style Clip", thumbnail: "https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg" },
    { videoId: "2ZIpFytCSVc", title: "Skeleton Dance", thumbnail: "https://img.youtube.com/vi/2ZIpFytCSVc/maxresdefault.jpg" },
    { videoId: "BfnjX88Va4Y", title: "Subway Surfers", thumbnail: "https://img.youtube.com/vi/BfnjX88Va4Y/maxresdefault.jpg" },
    { videoId: "GIYHyB2yjM4", title: "Only in Ohio", thumbnail: "https://img.youtube.com/vi/GIYHyB2yjM4/maxresdefault.jpg" },
    { videoId: "4n0xNbfJLR8", title: "Coconut Song", thumbnail: "https://img.youtube.com/vi/4n0xNbfJLR8/maxresdefault.jpg" },
    { videoId: "KQ6zr6kCPj8", title: "STANDING HERE", thumbnail: "https://img.youtube.com/vi/KQ6zr6kCPj8/maxresdefault.jpg" },
    { videoId: "enYdAxVcNZA", title: "Taco Bell Bong", thumbnail: "https://img.youtube.com/vi/enYdAxVcNZA/maxresdefault.jpg" },
    { videoId: "TzXXHVhGXTQ", title: "Bruh Sound Effect", thumbnail: "https://img.youtube.com/vi/TzXXHVhGXTQ/maxresdefault.jpg" },
    { videoId: "NL6CDXGi8ms", title: "Coffin Dance", thumbnail: "https://img.youtube.com/vi/NL6CDXGi8ms/maxresdefault.jpg" },
    { videoId: "lpiB2wMc49g", title: "Windows XP Error", thumbnail: "https://img.youtube.com/vi/lpiB2wMc49g/maxresdefault.jpg" },
    { videoId: "j5a0jTc9S10", title: "Plankton Yelling", thumbnail: "https://img.youtube.com/vi/j5a0jTc9S10/maxresdefault.jpg" },
    { videoId: "4feUSTS21-8", title: "Fart with Reverb", thumbnail: "https://img.youtube.com/vi/4feUSTS21-8/maxresdefault.jpg" },
    { videoId: "b9434BoGkNQ", title: "Metal Pipe Sound", thumbnail: "https://img.youtube.com/vi/b9434BoGkNQ/maxresdefault.jpg" },
    { videoId: "8QxIIz1yEsA", title: "Roblox Oof Sound", thumbnail: "https://img.youtube.com/vi/8QxIIz1yEsA/maxresdefault.jpg" },
    { videoId: "gKAT2tGAInA", title: "Yoinky Sploinky", thumbnail: "https://img.youtube.com/vi/gKAT2tGAInA/maxresdefault.jpg" },
    { videoId: "cPCLFtxpadE", title: "Samsung Notification", thumbnail: "https://img.youtube.com/vi/cPCLFtxpadE/maxresdefault.jpg" },
    { videoId: "HF913kG9w4k", title: "Anime Wow", thumbnail: "https://img.youtube.com/vi/HF913kG9w4k/maxresdefault.jpg" },
    { videoId: "r3eaGx5Z3Q4", title: "John Cena Meme", thumbnail: "https://img.youtube.com/vi/r3eaGx5Z3Q4/maxresdefault.jpg" },
    { videoId: "OFr74zI1LBM", title: "Meme Sound Pack", thumbnail: "https://img.youtube.com/vi/OFr74zI1LBM/maxresdefault.jpg" },
    { videoId: "M5V_IXMewl4", title: "Bababooey", thumbnail: "https://img.youtube.com/vi/M5V_IXMewl4/maxresdefault.jpg" },
  ];
};

const Session = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const participantId = searchParams.get("participantId");

  const [session, setSession] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [queueItems, setQueueItems] = useState<any[]>([]);
  const [votes, setVotes] = useState<any[]>([]);
  const [currentFeedOwner, setCurrentFeedOwner] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const presenceChannelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!sessionId || !participantId) {
      navigate("/");
      return;
    }

    loadSessionData();
    setupRealtimeSubscription();
    setupPresenceTracking();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (presenceChannelRef.current) {
        supabase.removeChannel(presenceChannelRef.current);
      }
    };
  }, [sessionId, participantId]);

  const loadSessionData = async () => {
    try {
      // Load session
      const { data: sessionData, error: sessionError } = await supabase
        .from("sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (sessionError) throw sessionError;
      setSession(sessionData);

      // Load participants
      const { data: participantsData, error: participantsError } = await supabase
        .from("participants")
        .select("*")
        .eq("session_id", sessionId);

      if (participantsError) throw participantsError;
      setParticipants(participantsData || []);

      // Load feed owner
      if (sessionData.current_feed_user_id) {
        const feedOwner = participantsData?.find(
          (p) => p.id === sessionData.current_feed_user_id
        );
        setCurrentFeedOwner(feedOwner);
      }

      // Initialize feed if not exists
      if (sessionData.current_feed_user_id) {
        const { data: feedData } = await supabase
          .from("feeds")
          .select("*")
          .eq("user_id", sessionData.current_feed_user_id)
          .maybeSingle();

        if (!feedData) {
          // Fetch real YouTube feed
          let feedItems = [];
          try {
            console.log("Attempting to fetch YouTube feed...");
            const { data: youtubeData, error: youtubeError } = await supabase.functions.invoke(
              "fetch-youtube-feed",
              {
                body: { query: "skibidi toilet brainrot memes shorts", maxResults: 50 },
              }
            );

            if (youtubeError) {
              console.error("YouTube API error:", youtubeError);
              feedItems = createPlaceholderFeed();
            } else if (youtubeData?.items && youtubeData.items.length > 0) {
              feedItems = youtubeData.items;
              console.log("Successfully fetched YouTube feed with", feedItems.length, "items");
            } else {
              console.log("No items returned from YouTube API, using placeholder feed");
              feedItems = createPlaceholderFeed();
            }
          } catch (error) {
            console.error("Failed to fetch YouTube feed:", error);
            feedItems = createPlaceholderFeed();
          }

          // Insert feed with either YouTube data or placeholder
          await supabase.from("feeds").insert({
            user_id: sessionData.current_feed_user_id,
            session_id: sessionId,
            items: feedItems,
            pointer_index: 0,
          });
          console.log("Feed initialized with", feedItems.length, "videos");
        }
      }

      // Load queue
      const { data: queueData, error: queueError } = await supabase
        .from("queue_items")
        .select("*")
        .eq("session_id", sessionId)
        .eq("played", false)
        .order("created_at", { ascending: true });

      if (queueError) throw queueError;
      setQueueItems(queueData || []);

      // Load votes
      const { data: votesData, error: votesError } = await supabase
        .from("votes")
        .select("*")
        .eq("session_id", sessionId);

      if (votesError) throw votesError;
      setVotes(votesData || []);

      setLoading(false);
    } catch (error: any) {
      console.error("Error loading session:", error);
      toast.error("Failed to load session");
      navigate("/");
    }
  };

  const setupPresenceTracking = async () => {
    // Mark this participant as connected
    await supabase
      .from("participants")
      .update({ is_connected: true, last_seen_at: new Date().toISOString() })
      .eq("id", participantId);

    const presenceChannel = supabase.channel(`presence:${sessionId}`, {
      config: {
        presence: {
          key: participantId,
        },
      },
    });

    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState();
        const presentIds = Object.keys(state).flatMap((key) =>
          state[key].map((presence: any) => presence.participant_id)
        );

        // Update all participants in this session
        supabase
          .from("participants")
          .select("id")
          .eq("session_id", sessionId)
          .then(({ data: allParticipants }) => {
            if (allParticipants) {
              allParticipants.forEach((p) => {
                const isPresent = presentIds.includes(p.id);
                supabase
                  .from("participants")
                  .update({ is_connected: isPresent })
                  .eq("id", p.id)
                  .then(() => {});
              });
            }
          });
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        console.log("User joined:", key);
        newPresences.forEach((presence: any) => {
          supabase
            .from("participants")
            .update({ is_connected: true, last_seen_at: new Date().toISOString() })
            .eq("id", presence.participant_id)
            .then(() => {});
        });
      })
      .on("presence", { event: "leave" }, async ({ key, leftPresences }) => {
        console.log("User left:", key);
        
        for (const presence of leftPresences) {
          await supabase
            .from("participants")
            .update({ is_connected: false, last_seen_at: new Date().toISOString() })
            .eq("id", presence.participant_id);
          
          // Check if the leaving user is the current algorithm owner
          if (session?.current_feed_user_id === presence.participant_id) {
            console.log("Algorithm owner left, selecting new owner...");
            
            // Get all connected participants except the one leaving
            const { data: connectedParticipants } = await supabase
              .from("participants")
              .select("*")
              .eq("session_id", sessionId)
              .eq("is_connected", true)
              .neq("id", presence.participant_id);
            
            if (connectedParticipants && connectedParticipants.length > 0) {
              // Select random participant
              const newOwner = connectedParticipants[
                Math.floor(Math.random() * connectedParticipants.length)
              ];
              
              // Update session with new owner
              await supabase
                .from("sessions")
                .update({ current_feed_user_id: newOwner.id })
                .eq("id", sessionId);
              
              // Create feed for new owner if it doesn't exist
              const { data: existingFeed } = await supabase
                .from("feeds")
                .select("*")
                .eq("user_id", newOwner.id)
                .maybeSingle();
              
              if (!existingFeed) {
                await supabase.from("feeds").insert({
                  user_id: newOwner.id,
                  session_id: sessionId,
                  items: createPlaceholderFeed(),
                  pointer_index: 0,
                });
              }
              
              console.log("New algorithm owner assigned:", newOwner.display_name);
              toast.success(`${newOwner.display_name} is now the algorithm owner`);
            }
          }
        }
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await presenceChannel.track({
            participant_id: participantId,
            online_at: new Date().toISOString(),
          });
        }
      });

    presenceChannelRef.current = presenceChannel;
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`session:${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sessions",
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          console.log("Session updated:", payload);
          setSession(payload.new);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "participants",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          console.log("Participants updated:", payload);
          loadSessionData();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "queue_items",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          console.log("Queue updated:", payload);
          loadSessionData();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "votes",
          filter: `session_id=eq.${sessionId}`,
        },
        async (payload) => {
          console.log("Votes updated:", payload);
          // Only refetch votes instead of all data to prevent flashing
          const { data: votesData } = await supabase
            .from("votes")
            .select("*")
            .eq("session_id", sessionId);
          
          if (votesData) {
            setVotes(votesData);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;
  };

  const handleNextVideo = async () => {
    try {
      let nextVideoId = null;
      let nextSource = null;

      // Check if there's a queue item
      if (queueItems.length > 0) {
        const nextItem = queueItems[0];
        nextVideoId = nextItem.video_id;
        nextSource = "queue";

        // Mark as played
        await supabase
          .from("queue_items")
          .update({ played: true })
          .eq("id", nextItem.id);
      } else if (session?.current_feed_user_id) {
        // Get from feed
        const { data: feed } = await supabase
          .from("feeds")
          .select("*")
          .eq("user_id", session.current_feed_user_id)
          .single();

        if (feed && feed.items) {
          const items = Array.isArray(feed.items) ? feed.items : [];
          const currentIndex = feed.pointer_index || 0;
          
          if (currentIndex < items.length && items[currentIndex]) {
            const item = items[currentIndex] as { videoId: string; title?: string; thumbnail?: string };
            nextVideoId = item.videoId;
            nextSource = "feed";

            // Update pointer
            await supabase
              .from("feeds")
              .update({ pointer_index: currentIndex + 1 })
              .eq("user_id", session.current_feed_user_id);
          }
        }
      }

      if (nextVideoId) {
        // Update session
        await supabase
          .from("sessions")
          .update({
            current_video_id: nextVideoId,
            current_source: nextSource,
            playback_started_at: new Date().toISOString(),
          })
          .eq("id", sessionId);
      } else {
        toast.error("No more videos to play");
      }
    } catch (error: any) {
      console.error("Error playing next video:", error);
      toast.error("Failed to play next video");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <SessionHeader session={session} />

        {/* Main Layout */}
        <div className="grid lg:grid-cols-[300px_1fr_300px] gap-4">
          {/* Left Column - Participants & Voting */}
          <div className="space-y-4 lg:order-1">
            <ParticipantsList
              participants={participants}
              currentFeedOwnerId={session?.current_feed_user_id}
            />
            <VotePanel
              sessionId={sessionId!}
              participantId={participantId!}
              votes={votes}
              participants={participants}
              currentFeedOwnerId={session?.current_feed_user_id}
              voteThreshold={session?.vote_threshold || 0.5}
            />
          </div>

          {/* Center Column - Video Player */}
          <div className="lg:order-2">
            <VideoPlayer
              videoId={session?.current_video_id}
              source={session?.current_source}
              feedOwnerName={currentFeedOwner?.display_name}
              onNextVideo={handleNextVideo}
              isAlgorithmOwner={participantId === session?.current_feed_user_id}
            />
          </div>

          {/* Right Column - Queue & Chat */}
          <div className="space-y-4 lg:order-3">
            <QueuePanel
              sessionId={sessionId!}
              participantId={participantId!}
              queueItems={queueItems}
            />
            <ChatPanel
              sessionId={sessionId!}
              participantId={participantId!}
              participants={participants}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Session;
