# Scorer Flow Test Plan

This document provides a sequence of `curl` commands to verify the **Scorer Flow** in the `parkvue-cric-info` backend.

## Prerequisites
- The backend must be running (either via `podman compose up` or `mvn spring-boot:run`).
- The PostgreSQL database must be accessible.

---

## 1. Setup Phase (Administrative)

### Step 1.1: Create a Tournament
**Request:**
```bash
curl -X POST http://localhost:8080/api/scorer/tournaments \
-H "Content-Type: application/json" \
-d '{
  "name": "Parkvue Championship 2024",
  "startDate": "2024-06-01",
  "endDate": "2024-06-15",
  "status": "Upcoming"
}'
```
**Expected Response:** `200 OK` with a JSON object containing a generated `id` (UUID). **Save this ID.**

### Step 1.2: Create Teams
**Request (Team A):**
```bash
curl -X POST http://localhost:8080/api/scorer/teams \
-H "Content-Type: application/json" \
-d '{"name": "Parkvue Panthers", "shortName": "PVP"}'
```
**Request (Team B):**
```bash
curl -X POST http://localhost:8080/api/scorer/teams \
-H "Content-Type: application/json" \
-d '{"name": "Cricinfo Challengers", "shortName": "CIC"}'
```
**Expected Response:** JSON objects with `id`s for both teams.

### Step 1.3: Create Players
**Request:**
```bash
curl -X POST http://localhost:8080/api/scorer/players \
-H "Content-Type: application/json" \
-d '{
  "firstName": "John",
  "lastName": "Smith",
  "role": "Batsman",
  "battingStyle": "Right Hand"
}'
```

---

## 2. Match Phase

### Step 2.1: Schedule a Match
Use the IDs from the previous steps.
**Request:**
```bash
curl -X POST http://localhost:8080/api/scorer/matches \
-H "Content-Type: application/json" \
-d '{
  "tournament": {"id": "TOURNAMENT_UUID"},
  "team1": {"id": "TEAM_A_UUID"},
  "team2": {"id": "TEAM_B_UUID"},
  "venue": "Parkvue Oval",
  "status": "Upcoming"
}'
```

### Step 2.2: Initialize Innings
**Request:**
```bash
curl -X POST http://localhost:8080/api/scorer/innings \
-H "Content-Type: application/json" \
-d '{
  "match": {"id": "MATCH_UUID"},
  "battingTeam": {"id": "TEAM_A_UUID"},
  "bowlingTeam": {"id": "TEAM_B_UUID"},
  "inningsNumber": 1
}'
```

---

## 3. Live Scoring Phase

### Step 3.1: Submit a Delivery
**Request:**
```bash
curl -X POST http://localhost:8080/api/scorer/deliveries \
-H "Content-Type: application/json" \
-d '{
  "innings": {"id": "INNINGS_UUID"},
  "overNumber": 0,
  "ballNumber": 1,
  "runsBatter": 4,
  "commentary": "Beautiful cover drive for four!"
}'
```

---

## 4. Verification

### Step 4.1: Retrieve All Deliveries for Innings
```bash
curl http://localhost:8080/api/scorer/innings/INNINGS_UUID/deliveries
```

---

## Troubleshooting: Podman "krunkit" Error
If you see `no such file or directory: .../krunkit-debug.sh`, your Podman machine is corrupted. 

**Fix Steps:**
1.  **Reset Podman Machine:**
    ```bash
    podman machine rm -f podman-machine-default
    podman machine init
    podman machine start
    ```
2.  **Verify Status:**
    ```bash
    podman machine list
    ```
    (Ensure status is 'Currently running')
