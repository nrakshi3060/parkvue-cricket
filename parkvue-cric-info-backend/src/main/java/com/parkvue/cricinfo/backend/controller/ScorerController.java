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

    // --- Tournament Endpoints ---
    @GetMapping("/tournaments")
    public List<Tournament> getAllTournaments() { return scorerService.getAllTournaments(); }
    @PostMapping("/tournaments")
    public Tournament createTournament(@RequestBody Tournament tournament) { return scorerService.createTournament(tournament); }
    @GetMapping("/tournaments/{id}")
    public ResponseEntity<Tournament> getTournamentById(@PathVariable UUID id) {
        Tournament t = scorerService.getTournamentById(id);
        return t != null ? ResponseEntity.ok(t) : ResponseEntity.notFound().build();
    }
    @PutMapping("/tournaments/{id}")
    public Tournament updateTournament(@PathVariable UUID id, @RequestBody Tournament details) { return scorerService.updateTournament(id, details); }
    @DeleteMapping("/tournaments/{id}")
    public void deleteTournament(@PathVariable UUID id) { scorerService.deleteTournament(id); }

    // --- Team Endpoints ---
    @GetMapping("/teams")
    public List<Team> getAllTeams() { return scorerService.getAllTeams(); }
    @PostMapping("/teams")
    public Team createTeam(@RequestBody Team team) { return scorerService.createTeam(team); }
    @GetMapping("/teams/{id}")
    public ResponseEntity<Team> getTeamById(@PathVariable UUID id) {
        Team t = scorerService.getTeamById(id);
        return t != null ? ResponseEntity.ok(t) : ResponseEntity.notFound().build();
    }
    @PutMapping("/teams/{id}")
    public Team updateTeam(@PathVariable UUID id, @RequestBody Team details) { return scorerService.updateTeam(id, details); }
    @DeleteMapping("/teams/{id}")
    public void deleteTeam(@PathVariable UUID id) { scorerService.deleteTeam(id); }

    // --- Player Endpoints ---
    @GetMapping("/players")
    public List<Player> getAllPlayers() { return scorerService.getAllPlayers(); }
    @PostMapping("/players")
    public Player createPlayer(@RequestBody Player player) { return scorerService.createPlayer(player); }
    @GetMapping("/players/{id}")
    public ResponseEntity<Player> getPlayerById(@PathVariable UUID id) {
        Player p = scorerService.getPlayerById(id);
        return p != null ? ResponseEntity.ok(p) : ResponseEntity.notFound().build();
    }
    @PutMapping("/players/{id}")
    public Player updatePlayer(@PathVariable UUID id, @RequestBody Player details) { return scorerService.updatePlayer(id, details); }
    @DeleteMapping("/players/{id}")
    public void deletePlayer(@PathVariable UUID id) { scorerService.deletePlayer(id); }

    // --- Match Endpoints ---
    @GetMapping("/matches")
    public List<Match> getAllMatches() { return scorerService.getAllMatches(); }
    @PostMapping("/matches")
    public Match createMatch(@RequestBody Match match) { return scorerService.createMatch(match); }
    @GetMapping("/matches/{id}")
    public ResponseEntity<Match> getMatchById(@PathVariable UUID id) {
        Match m = scorerService.getMatchById(id);
        return m != null ? ResponseEntity.ok(m) : ResponseEntity.notFound().build();
    }
    @PutMapping("/matches/{id}")
    public Match updateMatch(@PathVariable UUID id, @RequestBody Match details) { return scorerService.updateMatch(id, details); }
    @DeleteMapping("/matches/{id}")
    public void deleteMatch(@PathVariable UUID id) { scorerService.deleteMatch(id); }

    // --- MatchSquad Endpoints ---
    @GetMapping("/matches/{matchId}/squad")
    public List<MatchSquad> getSquadByMatchId(@PathVariable UUID matchId) { return scorerService.getSquadByMatchId(matchId); }
    @PostMapping("/squad")
    public MatchSquad addPlayerToSquad(@RequestBody MatchSquad squad) { return scorerService.addPlayerToSquad(squad); }
    @DeleteMapping("/squad/{id}")
    public void removePlayerFromSquad(@PathVariable UUID id) { scorerService.removePlayerFromSquad(id); }

    // --- Innings Endpoints ---
    @PostMapping("/innings")
    public Innings createInnings(@RequestBody Innings innings) { return scorerService.createInnings(innings); }
    @GetMapping("/matches/{matchId}/innings")
    public List<Innings> getInningsByMatchId(@PathVariable UUID matchId) { return scorerService.getInningsByMatchId(matchId); }

    // --- Delivery Endpoints ---
    @PostMapping("/deliveries")
    public Delivery submitDelivery(@RequestBody Delivery delivery) { return scorerService.submitDelivery(delivery); }
    
    @DeleteMapping("/innings/{inningsId}/undo")
    public void undoLastBall(@PathVariable UUID inningsId) { scorerService.undoLastBall(inningsId); }

    @GetMapping("/innings/{inningsId}/deliveries")
    public List<Delivery> getDeliveriesByInningsId(@PathVariable UUID inningsId) { return scorerService.getDeliveriesByInningsId(inningsId); }
}
