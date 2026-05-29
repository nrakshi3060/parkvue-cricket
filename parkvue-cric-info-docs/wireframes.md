# parkvue-cric-info: Mobile Wireframes

This document outlines the core screen layouts for the iOS and Android applications. Since the app is cross-platform (React Native), the fundamental layout remains consistent, adhering to native navigation patterns (bottom tabs, header bars).

---

## 1. Score Viewer Screens

### 1.1 Home Screen (Dashboard)
The landing page for all users, focusing on immediate access to active games.

```text
+-----------------------------------+
|  [Menu]     parkvue-cric-info     |
+-----------------------------------+
|  [ LIVE ] [ UPCOMING ] [ RECENT ] |
+-----------------------------------+
|                                   |
|  *LIVE - Parkvue Premier League*  |
|  -------------------------------  |
|  Panthers: 124/3 (15.2 Ov)        |
|  Challengers: Yet to bat          |
|                                   |
|  J. Doe 45* (30) | Bowler 2/15    |
|  -------------------------------  |
|  Last 6: 1 4 . W 1 6              |
|                                   |
+-----------------------------------+
|                                   |
|  *UPCOMING - Parkvue Cup*         |
|  -------------------------------  |
|  Team A vs Team B                 |
|  Starts in 2 hours                |
|                                   |
+-----------------------------------+
|                                   |
| [Home]    [Tournaments]   [Login] |
+-----------------------------------+
```

### 1.2 Match Center (Live View)
The primary screen for consuming a live match via Server-Sent Events (SSE).
See [wireframe-live.puml](./wireframe-live.puml) for a graphical version.

```text
+-----------------------------------+
|  < Back     Panthers vs Chal...   |
+-----------------------------------+
|  [ LIVE ] [ SCORECARD ] [ INFO ]  |
+-----------------------------------+
|  PAN: 156/4 (18.0)                |
|  CRR: 8.66                        |
+-----------------------------------+
|  Batters                   R   B  |
| > J. Doe                  65  40  |
|   S. Smith                12  10  |
+-----------------------------------+
|  Bowlers                   O  W/R |
| > M. Johnson              3.0 1/24|
+-----------------------------------+
|  Recent: W 1 1 4 6 2              |
+-----------------------------------+
|  Commentary:                      |
|                                   |
|  17.6: M. Johnson to J. Doe,      |
|  Two runs! Played to deep mid-w...|
|                                   |
|  17.5: M. Johnson to J. Doe,      |
|  SIX! Massive hit down the grou...|
+-----------------------------------+
```

---

## 2. Scorer Screens (Admin)

### 2.1 Scorer Dashboard (Pre-Match)
Where the scorer initializes the match.

```text
+-----------------------------------+
|  [Menu]      Scorer Admin         |
+-----------------------------------+
|  Active Match: PAN vs CIC         |
|  Status: Toss Completed           |
+-----------------------------------+
|  [ Select Playing XI ]            |
|  [ Record Toss Result ]           |
|                                   |
|  Opening Batters:                 |
|  [ Select Striker v ]             |
|  [ Select Non-Striker v ]             |
|                                   |
|  Opening Bowler:                  |
|  [ Select Bowler v ]              |
|                                   |
|  [ START MATCH ]                  |
+-----------------------------------+
```

### 2.2 Live Scoring Data Entry (The Hot Path)
Designed for rapid, one-handed input in the field.

```text
+-----------------------------------+
|  < End Innings    Match Control   |
+-----------------------------------+
|  PAN: 45/0 (5.2)                  |
|  Striker: J. Doe (20*)            |
|  Bowler: M. Johnson (1.2)         |
+-----------------------------------+
|          RUNS SCORED              |
|  [ 0 ] [ 1 ] [ 2 ] [ 3 ] [ 4 ]    |
|  [ 5 ] [ 6 ] [ Custom ]           |
+-----------------------------------+
|            EXTRAS                 |
|  [ Wide ] [ No Ball ] [ Bye ]     |
|  [ Leg Bye ] [ Penalty ]          |
+-----------------------------------+
|           WICKET                  |
|  [ OUT! ] -> Opens Wicket Modal   |
+-----------------------------------+
|  Current Over: 1 4 .              |
+-----------------------------------+
|  [ UNDO LAST BALL ]  [ SUBMIT ]   |
+-----------------------------------+
```
