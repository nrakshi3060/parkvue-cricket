# parkvue-cric-info System Architecture

## Overview
`parkvue-cric-info` is a cross-platform mobile application for live cricket scoring. This document outlines the high-level system architecture, technology stack, and data flow.

For a visual representation, see [system-design.puml](./system-design.puml).

## Technology Stack
- **Frontend (Mobile App):** React Native (iOS & Android)
- **Backend API & Event Emitter:** Java Spring Boot
- **Database:** PostgreSQL (Relational Data)
- **Cache / In-Memory Store:** Redis (Live state management)
- **Deployment Strategy:** Local Machine (Docker Compose for infrastructure)

## High-Level Architecture Components

### 1. React Native Mobile App
- **Role:** Consumer of data. Displays live match centers, player statistics, tournament tables, and commentary.
- **Communication:**
  - Uses standard **HTTP REST APIs** to fetch static or historical data (e.g., past matches, player profiles).
  - Uses **Server-Sent Events (SSE)** to receive unidirectional, real-time updates for live matches (e.g., new ball bowled, score updates).

### 2. Spring Boot Backend Service
- **Role:** The central nervous system handling business logic, data persistence, and real-time broadcasting.
- **Key Modules:**
  - **Admin/Scorer API:** Secure REST endpoints where scorers submit ball-by-ball events.
  - **Client REST API:** Read-optimized endpoints serving historical data to the mobile app.
  - **Live Score Engine:** Processes incoming delivery events, calculates the new match state (score, strike rotation), and orchestrates data storage.
  - **SSE Emitter:** Maintains persistent connections with active users and pushes localized events when the Live Score Engine updates.

### 3. Redis (Caching Layer)
- **Role:** High-speed, in-memory data store to handle the massive read-throughput typical of live sports apps.
- **Cache Strategy:**
  - **Live Match State:** The current score, batters at the crease, and current bowler are cached as a single JSON object.
  - **Recent Over:** The last 6-12 deliveries are cached to instantly load the commentary view.
  - When the Spring Boot app processes a new ball, it updates PostgreSQL and immediately overwrites the Redis cache before emitting the SSE.

### 4. PostgreSQL (Persistent Storage)
- **Role:** The source of truth for all structured relational data (Tournaments, Teams, Players, Deliveries).
- Refer to `database-schema.md` for exact table structures.

## Data Flow: Processing a Live Delivery

1. **Action:** The Scorer inputs "4 Runs" for the current ball via an admin interface.
2. **Ingestion:** The Spring Boot backend receives the HTTP POST request containing the `Delivery` payload.
3. **Persistence:** The `Delivery` is written to the `deliveries` table in PostgreSQL.
4. **Cache Update:** The Spring Boot service recalculates the live match summary and updates the Redis key for that specific `match_id`.
5. **Broadcast:** The Spring Boot SSE controller pushes the updated match state JSON to all React Native clients currently subscribed to that match's event stream.
6. **Client Render:** The React Native app receives the SSE event and instantly updates the UI (score goes up, commentary updates).
