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
    // Sample YouTube Shorts for initial feed
    const sampleShorts = [
      { videoId: "dQw4w9WgXcQ", title: "Sample Short 1", thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg" },
      { videoId: "jNQXAC9IVRw", title: "Sample Short 2", thumbnail: "https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg" },
      { videoId: "9bZkp7q19f0", title: "Sample Short 3", thumbnail: "https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg" },
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
