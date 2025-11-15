import { Users, Crown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ParticipantsListProps {
  participants: any[];
  currentFeedOwnerId: string | null;
}

export const ParticipantsList = ({
  participants,
  currentFeedOwnerId,
}: ParticipantsListProps) => {
  const activeParticipants = participants.filter((p) => p.is_connected);

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">
          Participants ({activeParticipants.length})
        </h2>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {activeParticipants.map((participant) => {
          const isHost = participant.is_host;
          const isFeedOwner = participant.id === currentFeedOwnerId;
          const initials = participant.display_name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

          return (
            <div
              key={participant.id}
              className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                isFeedOwner
                  ? "bg-primary/10 border border-primary/20"
                  : "bg-secondary"
              }`}
            >
              <Avatar className="w-10 h-10">
                <AvatarFallback className={isFeedOwner ? "bg-primary text-primary-foreground" : ""}>
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">
                    {participant.display_name}
                  </p>
                  {isHost && (
                    <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                  )}
                </div>
                {isFeedOwner && (
                  <p className="text-xs text-primary">Algorithm Owner</p>
                )}
              </div>

              <div
                className={`w-2 h-2 rounded-full ${
                  participant.is_connected ? "bg-green-500" : "bg-gray-500"
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
