# User Flows: parkvue-cric-info

## Visual Overviews
- [Use Case Diagram](./use-cases.puml): Roles and their interactions with the system.
- [Live Scoring Sequence](./scoring-sequence.puml): The technical flow of a ball being bowled and scored.
- [Match State Diagram](./match-state.puml): The lifecycle of a match from start to finish.

## Personas

1. **The Scorer (Admin/Privileged)**
   - **Role:** The data provider. Responsible for setting up tournaments and inputting live, ball-by-ball match data.
   - **Access:** Requires secure authentication.
   - **Needs:** Fast data entry, error correction capabilities, and tournament management.

2. **The Score Viewer (Consumer)**
   - **Role:** The data consumer. Wants to see live scores, commentary, and statistics.
   - **Access:** Public access (no login required for core viewing).
   - **Needs:** Low-latency updates, intuitive UI, and historical context.

---

## 1. Scorer Flows

### Flow 1.1: Tournament Setup (Pre-Match)
The Scorer must set up the infrastructure before a match can begin.
1. **Login:** Scorer authenticates into the Admin Portal (Web or App).
2. **Create Tournament:** Enters tournament name, dates, and format.
3. **Register Teams:** Creates teams and assigns them to the tournament.
4. **Register Players:** Adds players to the teams, defining their roles (Batsman, Bowler, etc.).
5. **Schedule Match:** Selects two teams, sets the venue and scheduled time.

### Flow 1.2: Match Initialization
Pre-match procedures immediately before the first ball.
1. **Select Match:** Scorer navigates to an 'Upcoming' match.
2. **Define Squads:** Selects the Playing XI for both teams from the registered players.
3. **The Toss:** Records which team won the toss and their decision (Bat/Bowl).
4. **Start Match:** Changes match status to 'Live'. Selects the opening batters (Striker, Non-Striker) and the opening Bowler.

### Flow 1.3: Live Scoring (The Hot Path)
The high-frequency loop during the match.
1. **Input Delivery:** For each ball, the scorer selects:
   - Runs scored (0-6).
   - Extras (Wide, No-Ball, Bye, Leg-Bye).
   - Wicket (if applicable) -> Prompts to select wicket type, fielder, and the incoming new batter.
2. **Submit:** Scorer taps "Submit Delivery".
3. **System Action:** System records the delivery, updates Redis, and pushes the SSE event to all viewers.
4. **Over Completion:** At the end of an over, the system prompts the Scorer to select the next Bowler.

### Flow 1.4: Error Correction (Undo/Edit)
Crucial for maintaining data integrity when human error occurs.
1. **Undo Last Ball:** Scorer taps 'Undo'. The system rolls back the last delivery, reverts the score and strike rotation, and pushes an updated state to viewers.
2. **Edit Previous Delivery:** Scorer navigates to the 'Commentary/Log' view, selects a specific past ball, and modifies the outcome. The system recalculates the scorecard from that point forward and syncs the updated state.

---

## 2. Score Viewer Flows

### Flow 2.1: Discovery & Match Selection
1. **Open App:** Viewer opens the React Native mobile app. No login required.
2. **Home Screen:** Viewer sees a dashboard of 'Live', 'Upcoming', and 'Recent' matches.
3. **Select Match:** Viewer taps a 'Live' match to enter the Match Center.

### Flow 2.2: Live Consumption
1. **Match Center Load:** App fetches the initial state (Scorecard, Recent Deliveries) from the Spring Boot REST API (which hits Redis for speed).
2. **SSE Connection:** App silently establishes a Server-Sent Events (SSE) connection to the backend.
3. **Real-Time Updates:** As the Scorer inputs data, the Viewer sees:
   - Total score incrementing.
   - Batsman scores updating in real-time.
   - New commentary appearing automatically at the top of the feed without refreshing.

### Flow 2.3: Statistical Deep-Dive
1. **View Scorecard:** Viewer navigates to the 'Scorecard' tab to see full batting/bowling figures.
2. **Player Profiles:** Viewer taps on a player's name to view their historical statistics, aggregated across the tournament.
3. **Points Table:** Viewer checks the tournament standings based on match results.
