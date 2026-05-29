-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. tournaments
CREATE TABLE tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) CHECK (status IN ('Upcoming', 'Ongoing', 'Completed')) DEFAULT 'Upcoming',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. teams
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. players
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('Batsman', 'Bowler', 'All-rounder', 'WK')),
    batting_style VARCHAR(50),
    bowling_style VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. matches
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    team1_id UUID REFERENCES teams(id),
    team2_id UUID REFERENCES teams(id),
    venue VARCHAR(255),
    scheduled_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) CHECK (status IN ('Upcoming', 'Live', 'Completed')) DEFAULT 'Upcoming',
    toss_winner_id UUID REFERENCES teams(id),
    toss_decision VARCHAR(20) CHECK (toss_decision IN ('Bat', 'Bowl')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. match_squads
CREATE TABLE match_squads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id),
    player_id UUID REFERENCES players(id),
    is_playing_xi BOOLEAN DEFAULT true,
    is_captain BOOLEAN DEFAULT false,
    is_wk BOOLEAN DEFAULT false,
    UNIQUE(match_id, player_id)
);

-- 6. innings
CREATE TABLE innings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    batting_team_id UUID REFERENCES teams(id),
    bowling_team_id UUID REFERENCES teams(id),
    innings_number INTEGER CHECK (innings_number IN (1, 2)),
    total_runs INTEGER DEFAULT 0,
    total_wickets INTEGER DEFAULT 0,
    total_overs NUMERIC(5,2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(match_id, innings_number)
);

-- 7. deliveries
CREATE TABLE deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    innings_id UUID REFERENCES innings(id) ON DELETE CASCADE,
    over_number INTEGER NOT NULL,
    ball_number INTEGER NOT NULL,
    batter_id UUID REFERENCES players(id),
    non_striker_id UUID REFERENCES players(id),
    bowler_id UUID REFERENCES players(id),
    runs_batter INTEGER DEFAULT 0,
    extras_type VARCHAR(20) CHECK (extras_type IN ('Wide', 'No-Ball', 'Bye', 'Leg-Bye', 'None')) DEFAULT 'None',
    extras_runs INTEGER DEFAULT 0,
    is_wicket BOOLEAN DEFAULT false,
    wicket_type VARCHAR(50),
    player_out_id UUID REFERENCES players(id),
    fielder_id UUID REFERENCES players(id),
    commentary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create basic indexes for read performance
CREATE INDEX idx_deliveries_innings_id ON deliveries(innings_id);
CREATE INDEX idx_matches_tournament_id ON matches(tournament_id);
