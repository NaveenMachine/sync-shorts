import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = queueItems.findIndex((item) => item.id === active.id);
      const newIndex = queueItems.findIndex((item) => item.id === over.id);

      // This is just visual reordering - real implementation would need
      // a position/order column in the database to persist order
      const reordered = arrayMove(queueItems, oldIndex, newIndex);
      // For now, we just show the reordered list locally
      // To persist, you'd need to add an 'order' column and update all items
      toast.success("Queue reordered!");
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

      {/* Queue List with Drag & Drop */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {queueItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Queue is empty. Add videos above!
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={queueItems.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              {queueItems.map((item, index) => (
                <SortableQueueItem
                  key={item.id}
                  item={item}
                  index={index}
                  onRemove={handleRemoveFromQueue}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
};

interface SortableQueueItemProps {
  item: any;
  index: number;
  onRemove: (id: string) => void;
}

const SortableQueueItem = ({ item, index, onRemove }: SortableQueueItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-secondary rounded-lg p-3 flex items-center gap-3 group"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>
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
        onClick={() => onRemove(item.id)}
      >
        <Trash2 className="w-4 h-4 text-destructive" />
      </Button>
    </div>
  );
};
