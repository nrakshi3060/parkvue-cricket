package com.parkvue.cricinfo.backend.controller;

import com.parkvue.cricinfo.backend.model.*;
import com.parkvue.cricinfo.backend.service.ScorerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/scorer")
public class ScorerController {

    @Autowired
    private ScorerService scorerService;

    // Tournament Endpoints
    @GetMapping("/tournaments")
    public List<Tournament> getAllTournaments() {
        return scorerService.getAllTournaments();
    }

    @PostMapping("/tournaments")
    public Tournament createTournament(@RequestBody Tournament tournament) {
        return scorerService.createTournament(tournament);
    }

    @GetMapping("/tournaments/{id}")
    public ResponseEntity<Tournament> getTournamentById(@PathVariable UUID id) {
        Tournament tournament = scorerService.getTournamentById(id);
        if (tournament != null) {
            return ResponseEntity.ok(tournament);
        }
        return ResponseEntity.notFound().build();
    }

    // Team Endpoints
    @GetMapping("/teams")
    public List<Team> getAllTeams() {
        return scorerService.getAllTeams();
    }

    @PostMapping("/teams")
    public Team createTeam(@RequestBody Team team) {
        return scorerService.createTeam(team);
    }

    @GetMapping("/teams/{id}")
    public ResponseEntity<Team> getTeamById(@PathVariable UUID id) {
        Team team = scorerService.getTeamById(id);
        if (team != null) {
            return ResponseEntity.ok(team);
        }
        return ResponseEntity.notFound().build();
    }

    // Player Endpoints
    @GetMapping("/players")
    public List<Player> getAllPlayers() {
        return scorerService.getAllPlayers();
    }

    @PostMapping("/players")
    public Player createPlayer(@RequestBody Player player) {
        return scorerService.createPlayer(player);
    }

    @GetMapping("/players/{id}")
    public ResponseEntity<Player> getPlayerById(@PathVariable UUID id) {
        Player player = scorerService.getPlayerById(id);
        if (player != null) {
            return ResponseEntity.ok(player);
        }
        return ResponseEntity.notFound().build();
    }

    // Match Endpoints
    @GetMapping("/matches")
    public List<Match> getAllMatches() {
        return scorerService.getAllMatches();
    }

    @PostMapping("/matches")
    public Match createMatch(@RequestBody Match match) {
        return scorerService.createMatch(match);
    }

    @GetMapping("/matches/{id}")
    public ResponseEntity<Match> getMatchById(@PathVariable UUID id) {
        Match match = scorerService.getMatchById(id);
        if (match != null) {
            return ResponseEntity.ok(match);
        }
        return ResponseEntity.notFound().build();
    }

    // MatchSquad Endpoints
    @GetMapping("/matches/{matchId}/squad")
    public List<MatchSquad> getSquadByMatchId(@PathVariable UUID matchId) {
        return scorerService.getSquadByMatchId(matchId);
    }

    @PostMapping("/squad")
    public MatchSquad addPlayerToSquad(@RequestBody MatchSquad squad) {
        return scorerService.addPlayerToSquad(squad);
    }

    // Innings Endpoints
    @PostMapping("/innings")
    public Innings createInnings(@RequestBody Innings innings) {
        return scorerService.createInnings(innings);
    }

    @GetMapping("/matches/{matchId}/innings")
    public List<Innings> getInningsByMatchId(@PathVariable UUID matchId) {
        return scorerService.getInningsByMatchId(matchId);
    }

    // Delivery Endpoints
    @PostMapping("/deliveries")
    public Delivery submitDelivery(@RequestBody Delivery delivery) {
        return scorerService.submitDelivery(delivery);
    }

    @GetMapping("/innings/{inningsId}/deliveries")
    public List<Delivery> getDeliveriesByInningsId(@PathVariable UUID inningsId) {
        return scorerService.getDeliveriesByInningsId(inningsId);
    }
}
