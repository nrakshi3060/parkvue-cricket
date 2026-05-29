# parkvue-cric-info Database Schema

## Overview
This document outlines the PostgreSQL database schema for `parkvue-cric-info`, a live cricket scoring application designed for Limited Overs (T20/ODI) formats. It supports real-time live scoring, player statistics, tournament management, and ball-by-ball commentary.

## Core Entities

### 1. tournaments
Manages leagues and series.
- `id` (UUID, Primary Key)
- `name` (String)
- `start_date` (Date)
- `end_date` (Date)
- `status` (Enum: Upcoming, Ongoing, Completed)

### 2. teams
Participating teams.
- `id` (UUID, Primary Key)
- `name` (String)
- `short_name` (String)

### 3. players
Player profiles and roles.
- `id` (UUID, Primary Key)
- `first_name` (String)
- `last_name` (String)
- `role` (Enum: Batsman, Bowler, All-rounder, WK)
- `batting_style` (String)
- `bowling_style` (String)

### 4. matches
Individual games within a tournament.
- `id` (UUID, Primary Key)
- `tournament_id` (UUID, Foreign Key -> tournaments)
- `team1_id` (UUID, Foreign Key -> teams)
- `team2_id` (UUID, Foreign Key -> teams)
- `venue` (String)
- `scheduled_time` (Timestamp)
- `status` (Enum: Upcoming, Live, Completed)
- `toss_winner_id` (UUID, Foreign Key -> teams)
- `toss_decision` (Enum: Bat, Bowl)

### 5. match_squads
The playing XI and substitutes for each match.
- `id` (UUID, Primary Key)
- `match_id` (UUID, Foreign Key -> matches)
- `team_id` (UUID, Foreign Key -> teams)
- `player_id` (UUID, Foreign Key -> players)
- `is_playing_xi` (Boolean)
- `is_captain` (Boolean)
- `is_wk` (Boolean)

### 6. innings
Tracks the overall state of an innings.
- `id` (UUID, Primary Key)
- `match_id` (UUID, Foreign Key -> matches)
- `batting_team_id` (UUID, Foreign Key -> teams)
- `bowling_team_id` (UUID, Foreign Key -> teams)
- `innings_number` (Integer: 1 or 2)
- `total_runs` (Integer)
- `total_wickets` (Integer)
- `total_overs` (Numeric)

### 7. deliveries (Ball-by-Ball)
The crucial table for live scoring and commentary.
- `id` (UUID, Primary Key)
- `innings_id` (UUID, Foreign Key -> innings)
- `over_number` (Integer)
- `ball_number` (Integer: 1 to 6+)
- `batter_id` (UUID, Foreign Key -> players)
- `non_striker_id` (UUID, Foreign Key -> players)
- `bowler_id` (UUID, Foreign Key -> players)
- `runs_batter` (Integer)
- `extras_type` (Enum: Wide, No-Ball, Bye, Leg-Bye, None)
- `extras_runs` (Integer)
- `is_wicket` (Boolean)
- `wicket_type` (Enum: Bowled, Caught, LBW, Run Out, etc.)
- `player_out_id` (UUID, Nullable, Foreign Key -> players)
- `fielder_id` (UUID, Nullable, Foreign Key -> players)
- `commentary` (Text)

### 8. Scorecards (Materialized Views or Derived Tables)
- `scorecard_batting`: Derived from deliveries to aggregate runs, balls faced, 4s, 6s, and strike rate per batter per match.
- `scorecard_bowling`: Derived from deliveries to aggregate overs, maidens, runs conceded, wickets, and economy rate per bowler per match.

## Real-Time Strategy
- Utilize **PostgreSQL LISTEN/NOTIFY** to stream inserts from the `deliveries` table directly to an event handler (e.g., Node.js backend) to broadcast real-time updates via WebSockets to connected clients.
