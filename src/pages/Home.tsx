import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Users, Play } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const codeParam = searchParams.get("code");
  
  const [displayName, setDisplayName] = useState("");
  const [joinCode, setJoinCode] = useState(codeParam || "");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const generateJoinCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  useEffect(() => {
    if (codeParam) {
      setJoinCode(codeParam);
    }
  }, [codeParam]);

  const createSampleFeed = () => {
    // Brainrot YouTube Shorts for initial feed
    const sampleShorts = [
      { videoId: "FBmNHdZsfXQ", title: "Skibidi Toilet #1", thumbnail: "https://img.youtube.com/vi/FBmNHdZsfXQ/maxresdefault.jpg" },
      { videoId: "7q8rDLzJZvY", title: "Sigma Male Grindset", thumbnail: "https://img.youtube.com/vi/7q8rDLzJZvY/maxresdefault.jpg" },
      { videoId: "wJWksPWDKOc", title: "Ohio Final Boss", thumbnail: "https://img.youtube.com/vi/wJWksPWDKOc/maxresdefault.jpg" },
      { videoId: "YbJOTdZBX1g", title: "Subway Surfers Gameplay", thumbnail: "https://img.youtube.com/vi/YbJOTdZBX1g/maxresdefault.jpg" },
      { videoId: "7LKw7UHZw4w", title: "Family Guy Funny Moments", thumbnail: "https://img.youtube.com/vi/7LKw7UHZw4w/maxresdefault.jpg" },
      { videoId: "JVMsQJJn0Aw", title: "Gigachad Theme", thumbnail: "https://img.youtube.com/vi/JVMsQJJn0Aw/maxresdefault.jpg" },
      { videoId: "0RClFPv5r-0", title: "Brainrot Compilation", thumbnail: "https://img.youtube.com/vi/0RClFPv5r-0/maxresdefault.jpg" },
      { videoId: "g7_VlmEamUQ", title: "Discord Mod Memes", thumbnail: "https://img.youtube.com/vi/g7_VlmEamUQ/maxresdefault.jpg" },
      { videoId: "OjNpRbNdR7E", title: "Skibidi Dop Dop Yes Yes", thumbnail: "https://img.youtube.com/vi/OjNpRbNdR7E/maxresdefault.jpg" },
      { videoId: "kZ9tX0ghVcw", title: "Only in Ohio", thumbnail: "https://img.youtube.com/vi/kZ9tX0ghVcw/maxresdefault.jpg" },
      { videoId: "9Gc4QTqslN4", title: "Rizz Memes", thumbnail: "https://img.youtube.com/vi/9Gc4QTqslN4/maxresdefault.jpg" },
      { videoId: "UoaOGuBb0TY", title: "TikTok Cringe Compilation", thumbnail: "https://img.youtube.com/vi/UoaOGuBb0TY/maxresdefault.jpg" },
      { videoId: "W8sGTh7ZpoY", title: "Skeleton Appearing Meme", thumbnail: "https://img.youtube.com/vi/W8sGTh7ZpoY/maxresdefault.jpg" },
      { videoId: "zjedLeVGcfE", title: "POV You're in Ohio", thumbnail: "https://img.youtube.com/vi/zjedLeVGcfE/maxresdefault.jpg" },
      { videoId: "hyjbqr7gYHs", title: "Sigma Male Phonk", thumbnail: "https://img.youtube.com/vi/hyjbqr7gYHs/maxresdefault.jpg" },
      { videoId: "1wnE4vF9CQ4", title: "Goofy Ahh Sounds", thumbnail: "https://img.youtube.com/vi/1wnE4vF9CQ4/maxresdefault.jpg" },
      { videoId: "LDU_Txk06tM", title: "Coconut Mall Meme", thumbnail: "https://img.youtube.com/vi/LDU_Txk06tM/maxresdefault.jpg" },
      { videoId: "NHO84rOp8FQ", title: "Walter White Falling", thumbnail: "https://img.youtube.com/vi/NHO84rOp8FQ/maxresdefault.jpg" },
      { videoId: "ZcoqR9Bwx1Y", title: "Lean Meme", thumbnail: "https://img.youtube.com/vi/ZcoqR9Bwx1Y/maxresdefault.jpg" },
      { videoId: "kJa2kwoZ2a4", title: "Backrooms Found Footage", thumbnail: "https://img.youtube.com/vi/kJa2kwoZ2a4/maxresdefault.jpg" },
      { videoId: "bTAKSRa6dAQ", title: "Gen Z Humor", thumbnail: "https://img.youtube.com/vi/bTAKSRa6dAQ/maxresdefault.jpg" },
      { videoId: "w0AOGeqOnFY", title: "Andrew Tate Sigma", thumbnail: "https://img.youtube.com/vi/w0AOGeqOnFY/maxresdefault.jpg" },
      { videoId: "hH9M-m3WD0g", title: "Morbius Meme", thumbnail: "https://img.youtube.com/vi/hH9M-m3WD0g/maxresdefault.jpg" },
      { videoId: "V-_O7nl0Ii0", title: "Breaking Bad Memes", thumbnail: "https://img.youtube.com/vi/V-_O7nl0Ii0/maxresdefault.jpg" },
      { videoId: "PKtnafFtfEo", title: "Dream Face Reveal", thumbnail: "https://img.youtube.com/vi/PKtnafFtfEo/maxresdefault.jpg" },
    ];
    return sampleShorts;
  };

  const handleCreateSession = async () => {
    if (!displayName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    setIsCreating(true);
    try {
      const joinCode = generateJoinCode();
      
      // Create session
      const { data: session, error: sessionError } = await supabase
        .from("sessions")
        .insert({
          join_code: joinCode,
          is_active: true,
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Create host participant
      const { data: participant, error: participantError } = await supabase
        .from("participants")
        .insert({
          session_id: session.id,
          display_name: displayName,
          is_host: true,
          is_connected: true,
        })
        .select()
        .single();

      if (participantError) throw participantError;

      // Update session with host_id and current_feed_user_id
      const { error: updateError } = await supabase
        .from("sessions")
        .update({
          host_id: participant.id,
          current_feed_user_id: participant.id,
        })
        .eq("id", session.id);

      if (updateError) throw updateError;

      // Create initial feed for host
      const { error: feedError } = await supabase
        .from("feeds")
        .insert({
          user_id: participant.id,
          session_id: session.id,
          items: createSampleFeed(),
          pointer_index: 0,
        });

      if (feedError) throw feedError;

      toast.success("Session created!");
      navigate(`/session/${session.id}?participantId=${participant.id}`);
    } catch (error: any) {
      console.error("Error creating session:", error);
      toast.error("Failed to create session");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinSession = async () => {
    if (!displayName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!joinCode.trim()) {
      toast.error("Please enter a session code");
      return;
    }

    setIsJoining(true);
    try {
      // Find session by join code
      const { data: session, error: sessionError } = await supabase
        .from("sessions")
        .select("*")
        .eq("join_code", joinCode.toUpperCase())
        .eq("is_active", true)
        .single();

      if (sessionError || !session) {
        toast.error("Session not found");
        return;
      }

      // Create participant
      const { data: participant, error: participantError } = await supabase
        .from("participants")
        .insert({
          session_id: session.id,
          display_name: displayName,
          is_host: false,
          is_connected: true,
        })
        .select()
        .single();

      if (participantError) throw participantError;

      // Create feed for participant
      const { error: feedError } = await supabase
        .from("feeds")
        .insert({
          user_id: participant.id,
          session_id: session.id,
          items: createSampleFeed(),
          pointer_index: 0,
        });

      if (feedError) throw feedError;

      toast.success("Joined session!");
      navigate(`/session/${session.id}?participantId=${participant.id}`);
    } catch (error: any) {
      console.error("Error joining session:", error);
      toast.error("Failed to join session");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* Logo/Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-primary mb-4 animate-float">
            <Play className="w-10 h-10 text-white" fill="white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Shorts Jam
          </h1>
          <p className="text-muted-foreground text-lg">
            Watch YouTube Shorts together, vibing with friends
          </p>
        </div>

        {/* Name Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Your Name</label>
          <Input
            placeholder="Enter your display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="h-12 bg-card border-border"
            onKeyDown={(e) => e.key === "Enter" && handleCreateSession()}
          />
        </div>

        {/* Create Session Button */}
        <Button
          onClick={handleCreateSession}
          disabled={isCreating || !displayName.trim()}
          className="w-full h-14 text-lg font-semibold gradient-primary hover:opacity-90 transition-all shadow-glow"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          {isCreating ? "Creating..." : "Start Jam Session"}
        </Button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-background text-muted-foreground">or join existing</span>
          </div>
        </div>

        {/* Join Session */}
        <div className="space-y-3">
          <Input
            placeholder="Enter session code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            className="h-12 bg-card border-border text-center text-lg font-mono tracking-wider"
            maxLength={6}
            onKeyDown={(e) => e.key === "Enter" && handleJoinSession()}
          />
          <Button
            onClick={handleJoinSession}
            disabled={isJoining || !displayName.trim() || !joinCode.trim()}
            variant="secondary"
            className="w-full h-12"
          >
            <Users className="w-5 h-5 mr-2" />
            {isJoining ? "Joining..." : "Join Session"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
