-- Create sessions table
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID,
  current_feed_user_id UUID,
  join_code TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  vote_threshold FLOAT DEFAULT 0.5,
  current_video_id TEXT,
  current_source TEXT CHECK (current_source IN ('queue', 'feed')),
  current_queue_item_id UUID,
  playback_started_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create participants table
CREATE TABLE public.participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  is_host BOOLEAN DEFAULT false,
  is_connected BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_seen_at TIMESTAMPTZ DEFAULT now()
);

-- Create queue_items table
CREATE TABLE public.queue_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  title TEXT,
  thumbnail_url TEXT,
  added_by UUID REFERENCES public.participants(id) ON DELETE SET NULL,
  played BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create votes table
CREATE TABLE public.votes (
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  vote BOOLEAN NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (session_id, user_id)
);

-- Create feeds table
CREATE TABLE public.feeds (
  user_id UUID PRIMARY KEY REFERENCES public.participants(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  items JSONB DEFAULT '[]'::jsonb,
  pointer_index INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add foreign key constraint for host_id and current_feed_user_id
ALTER TABLE public.sessions 
  ADD CONSTRAINT fk_sessions_host 
  FOREIGN KEY (host_id) REFERENCES public.participants(id) ON DELETE SET NULL;

ALTER TABLE public.sessions 
  ADD CONSTRAINT fk_sessions_current_feed 
  FOREIGN KEY (current_feed_user_id) REFERENCES public.participants(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX idx_participants_session ON public.participants(session_id);
CREATE INDEX idx_queue_items_session ON public.queue_items(session_id);
CREATE INDEX idx_queue_items_played ON public.queue_items(session_id, played);
CREATE INDEX idx_votes_session ON public.votes(session_id);
CREATE INDEX idx_sessions_join_code ON public.sessions(join_code);

-- Enable Row Level Security
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feeds ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow all operations for now (public access for MVP)
-- Sessions
CREATE POLICY "Allow all on sessions" ON public.sessions FOR ALL USING (true) WITH CHECK (true);

-- Participants
CREATE POLICY "Allow all on participants" ON public.participants FOR ALL USING (true) WITH CHECK (true);

-- Queue Items
CREATE POLICY "Allow all on queue_items" ON public.queue_items FOR ALL USING (true) WITH CHECK (true);

-- Votes
CREATE POLICY "Allow all on votes" ON public.votes FOR ALL USING (true) WITH CHECK (true);

-- Feeds
CREATE POLICY "Allow all on feeds" ON public.feeds FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.queue_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.feeds;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_votes_updated_at BEFORE UPDATE ON public.votes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feeds_updated_at BEFORE UPDATE ON public.feeds
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();