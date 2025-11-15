import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface VotePanelProps {
  sessionId: string;
  participantId: string;
  votes: any[];
  participants: any[];
  currentFeedOwnerId: string | null;
  voteThreshold: number;
}

export const VotePanel = ({
  sessionId,
  participantId,
  votes,
  participants,
  currentFeedOwnerId,
  voteThreshold,
}: VotePanelProps) => {
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    const userVote = votes.find((v) => v.user_id === participantId);
    setHasVoted(userVote?.vote || false);
  }, [votes, participantId]);

  const activeParticipants = participants.filter((p) => p.is_connected && p.id !== currentFeedOwnerId);
  const yesVotes = votes.filter((v) => v.vote).length;
  const votePercentage = activeParticipants.length > 0 ? (yesVotes / activeParticipants.length) * 100 : 0;

  const handleVote = async () => {
    setIsVoting(true);
    try {
      const newVoteValue = !hasVoted;

      // Upsert vote
      const { error: voteError } = await supabase.from("votes").upsert({
        session_id: sessionId,
        user_id: participantId,
        vote: newVoteValue,
        updated_at: new Date().toISOString(),
      });

      if (voteError) throw voteError;

      // Check if threshold reached
      const updatedYesVotes = newVoteValue ? yesVotes + 1 : yesVotes - 1;
      const thresholdReached = updatedYesVotes / activeParticipants.length >= voteThreshold;

      if (thresholdReached && newVoteValue) {
        // Find eligible participants (not current owner)
        const eligibleParticipants = activeParticipants.filter((p) => p.id !== currentFeedOwnerId);

        if (eligibleParticipants.length > 0) {
          // Pick random new owner
          const randomIndex = Math.floor(Math.random() * eligibleParticipants.length);
          const newOwner = eligibleParticipants[randomIndex];

          // Update session
          const { error: updateError } = await supabase
            .from("sessions")
            .update({ current_feed_user_id: newOwner.id })
            .eq("id", sessionId);

          if (updateError) throw updateError;

          // Reset all votes
          const { error: deleteError } = await supabase.from("votes").delete().eq("session_id", sessionId);

          if (deleteError) throw deleteError;

          toast.success(`Algorithm switched to ${newOwner.display_name}!`);
        }
      }

      setHasVoted(newVoteValue);
    } catch (error: any) {
      console.error("Error voting:", error);
      toast.error("Failed to vote");
    } finally {
      setIsVoting(false);
    }
  };

  // Don't show if only 1 participant
  if (activeParticipants.length <= 1) {
    return null;
  }

  const isOwner = currentFeedOwnerId === participantId;

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4 space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-2">Switch Algorithm</h2>
        <p className="text-sm text-muted-foreground">
          {isOwner ? "You're the algorithm owner - others can vote to switch" : "Vote to switch whose feed plays next"}
        </p>
      </div>

      <Button
        onClick={handleVote}
        disabled={isVoting || isOwner}
        variant={hasVoted ? "destructive" : "secondary"}
        className="w-full"
      >
        <ThumbsDown className="w-4 h-4 mr-2" />
        {isOwner ? "You're the Owner" : hasVoted ? "Remove Vote" : "Vote to Switch"}
      </Button>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {yesVotes} / {activeParticipants.length} voted
          </span>
          <span className="text-muted-foreground">{Math.round(voteThreshold * 100)}% needed</span>
        </div>
        <Progress value={votePercentage} className="h-2" />
      </div>
    </div>
  );
};
