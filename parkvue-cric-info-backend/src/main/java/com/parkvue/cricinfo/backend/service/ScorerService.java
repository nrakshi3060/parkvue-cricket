package com.parkvue.cricinfo.backend.service;

import com.parkvue.cricinfo.backend.model.*;
import com.parkvue.cricinfo.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
public class ScorerService {

    @Autowired
    private TournamentRepository tournamentRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private MatchSquadRepository matchSquadRepository;

    @Autowired
    private InningsRepository inningsRepository;

    @Autowired
    private DeliveryRepository deliveryRepository;

    // Tournament Methods
    public List<Tournament> getAllTournaments() {
        return tournamentRepository.findAll();
    }

    public Tournament createTournament(Tournament tournament) {
        return tournamentRepository.save(tournament);
    }

    public Tournament getTournamentById(UUID id) {
        return tournamentRepository.findById(id).orElse(null);
    }

    // Team Methods
    public List<Team> getAllTeams() {
        return teamRepository.findAll();
    }

    public Team createTeam(Team team) {
        return teamRepository.save(team);
    }

    public Team getTeamById(UUID id) {
        return teamRepository.findById(id).orElse(null);
    }

    // Player Methods
    public List<Player> getAllPlayers() {
        return playerRepository.findAll();
    }

    public Player createPlayer(Player player) {
        return playerRepository.save(player);
    }

    public Player getPlayerById(UUID id) {
        return playerRepository.findById(id).orElse(null);
    }

    // Match Methods
    public List<Match> getAllMatches() {
        return matchRepository.findAll();
    }

    public Match createMatch(Match match) {
        return matchRepository.save(match);
    }

    public Match getMatchById(UUID id) {
        return matchRepository.findById(id).orElse(null);
    }

    // MatchSquad Methods
    public List<MatchSquad> getSquadByMatchId(UUID matchId) {
        return matchSquadRepository.findAll().stream()
                .filter(s -> s.getMatch().getId().equals(matchId))
                .toList();
    }

    public MatchSquad addPlayerToSquad(MatchSquad squad) {
        return matchSquadRepository.save(squad);
    }

    // Innings Methods
    public Innings createInnings(Innings innings) {
        return inningsRepository.save(innings);
    }

    public List<Innings> getInningsByMatchId(UUID matchId) {
        return inningsRepository.findAll().stream()
                .filter(i -> i.getMatch().getId().equals(matchId))
                .toList();
    }

    // Delivery Methods
    public Delivery submitDelivery(Delivery delivery) {
        return deliveryRepository.save(delivery);
    }

    public List<Delivery> getDeliveriesByInningsId(UUID inningsId) {
        return deliveryRepository.findAll().stream()
                .filter(d -> d.getInnings().getId().equals(inningsId))
                .toList();
    }
}
