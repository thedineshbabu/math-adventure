-- Math Adventure Database Schema for Supabase
-- Run this in Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  avatar TEXT DEFAULT '🧒',
  pin_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_players_username ON players(LOWER(username));
CREATE INDEX IF NOT EXISTS idx_players_email ON players(LOWER(email));

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_player ON sessions(player_id);

-- Progress table
CREATE TABLE IF NOT EXISTS progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  problem_type TEXT NOT NULL,
  difficulty INTEGER DEFAULT 1,
  correct INTEGER DEFAULT 0,
  total INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  xp INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, problem_type)
);

CREATE INDEX IF NOT EXISTS idx_progress_player ON progress(player_id);

-- History table
CREATE TABLE IF NOT EXISTS history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  problem TEXT NOT NULL,
  answer TEXT NOT NULL,
  user_answer TEXT,
  correct BOOLEAN,
  time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_history_player ON history(player_id);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  achievement TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, achievement)
);

CREATE INDEX IF NOT EXISTS idx_achievements_player ON achievements(player_id);

-- Daily challenges table
CREATE TABLE IF NOT EXISTS daily_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  challenge_date DATE NOT NULL,
  problems_completed INTEGER DEFAULT 0,
  total_problems INTEGER DEFAULT 5,
  bonus_xp_earned INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, challenge_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_player ON daily_challenges(player_id);
CREATE INDEX IF NOT EXISTS idx_daily_date ON daily_challenges(challenge_date);

-- Unlocked avatars table
CREATE TABLE IF NOT EXISTS unlocked_avatars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  avatar_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, avatar_id)
);

CREATE INDEX IF NOT EXISTS idx_avatars_player ON unlocked_avatars(player_id);

-- Fast answers tracking (for Robot avatar unlock)
CREATE TABLE IF NOT EXISTS fast_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  count INTEGER DEFAULT 0,
  UNIQUE(player_id)
);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE history ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE unlocked_avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE fast_answers ENABLE ROW LEVEL SECURITY;

-- Policies for public access (since we handle auth in our backend)
-- Allow all operations for now (our backend validates tokens)
CREATE POLICY "Allow all for players" ON players FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for sessions" ON sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for progress" ON progress FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for history" ON history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for achievements" ON achievements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for daily_challenges" ON daily_challenges FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for unlocked_avatars" ON unlocked_avatars FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for fast_answers" ON fast_answers FOR ALL USING (true) WITH CHECK (true);

-- Success message
SELECT 'Math Adventure schema created successfully!' as message;
