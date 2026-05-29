# parkvue-cric-info Context

You are working on the `parkvue-cric-info` workspace.

## System Architecture Overview
- **Frontend:** React Native (Cross-platform Mobile).
- **Backend:** Java Spring Boot.
- **Database:** PostgreSQL.
- **Caching:** Redis.
- **Real-Time Strategy:** Server-Sent Events (SSE) from Spring Boot to React Native for live score updates.
- **Deployment:** Local Docker environment.

## Design Principles
1. **Performance:** Live match data (scorecards, recent commentary) MUST prioritize Redis for reads to minimize PostgreSQL load during active matches.
2. **Real-Time:** Use unidirectional SSE for pushing updates to clients. WebSockets are NOT required for the consumer app, as clients only need to read live scores, not send them.
3. **Data Integrity:** PostgreSQL remains the source of truth. All events must be persisted to the `deliveries` table before updating caches.
4. **Scoring Logic:** All core cricket logic (strike rotation, extra runs calculation, over completion) resides in the Spring Boot backend, NOT the frontend.

## Key Documentation Files
- Database Schema: `parkvue-cric-info-docs/database-schema.md`
- System Architecture: `parkvue-cric-info-docs/system-architecture.md`
