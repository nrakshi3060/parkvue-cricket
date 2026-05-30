package com.parkvue.cricinfo.backend.service;

import com.parkvue.cricinfo.backend.model.*;
import com.parkvue.cricinfo.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
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

    // --- Tournament Methods ---
    public List<Tournament> getAllTournaments() { return tournamentRepository.findAll(); }
    public Tournament createTournament(Tournament tournament) { return tournamentRepository.save(tournament); }
    public Tournament getTournamentById(UUID id) { return tournamentRepository.findById(id).orElse(null); }
    
    public Tournament updateTournament(UUID id, Tournament details) {
        Tournament t = tournamentRepository.findById(id).orElseThrow();
        t.setName(details.getName());
        t.setStartDate(details.getStartDate());
        t.setEndDate(details.getEndDate());
        t.setStatus(details.getStatus());
        return tournamentRepository.save(t);
    }
    public void deleteTournament(UUID id) { tournamentRepository.deleteById(id); }

    // --- Team Methods ---
    public List<Team> getAllTeams() { return teamRepository.findAll(); }
    public Team createTeam(Team team) { return teamRepository.save(team); }
    public Team getTeamById(UUID id) { return teamRepository.findById(id).orElse(null); }
    
    public Team updateTeam(UUID id, Team details) {
        Team t = teamRepository.findById(id).orElseThrow();
        t.setName(details.getName());
        t.setShortName(details.getShortName());
        return teamRepository.save(t);
    }
    public void deleteTeam(UUID id) { teamRepository.deleteById(id); }

    // --- Player Methods ---
    public List<Player> getAllPlayers() { return playerRepository.findAll(); }
    public Player createPlayer(Player player) { return playerRepository.save(player); }
    public Player getPlayerById(UUID id) { return playerRepository.findById(id).orElse(null); }
    
    public Player updatePlayer(UUID id, Player details) {
        Player p = playerRepository.findById(id).orElseThrow();
        p.setFirstName(details.getFirstName());
        p.setLastName(details.getLastName());
        p.setRole(details.getRole());
        p.setBattingStyle(details.getBattingStyle());
        p.setBowlingStyle(details.getBowlingStyle());
        return playerRepository.save(p);
    }
    public void deletePlayer(UUID id) { playerRepository.deleteById(id); }

    // --- Match Methods ---
    public List<Match> getAllMatches() { return matchRepository.findAll(); }
    public Match createMatch(Match match) { return matchRepository.save(match); }
    public Match getMatchById(UUID id) { return matchRepository.findById(id).orElse(null); }
    
    public Match updateMatch(UUID id, Match details) {
        Match m = matchRepository.findById(id).orElseThrow();
        m.setTournament(details.getTournament());
        m.setTeam1(details.getTeam1());
        m.setTeam2(details.getTeam2());
        m.setVenue(details.getVenue());
        m.setScheduledTime(details.getScheduledTime());
        m.setStatus(details.getStatus());
        m.setTossWinner(details.getTossWinner());
        m.setTossDecision(details.getTossDecision());
        return matchRepository.save(m);
    }
    public void deleteMatch(UUID id) { matchRepository.deleteById(id); }

    // --- MatchSquad Methods ---
    public List<MatchSquad> getSquadByMatchId(UUID matchId) {
        return matchSquadRepository.findAll().stream()
                .filter(s -> s.getMatch().getId().equals(matchId))
                .toList();
    }
    public MatchSquad addPlayerToSquad(MatchSquad squad) { return matchSquadRepository.save(squad); }
    public void removePlayerFromSquad(UUID id) { matchSquadRepository.deleteById(id); }

    // --- Innings Methods ---
    public Innings createInnings(Innings innings) { return inningsRepository.save(innings); }
    public List<Innings> getInningsByMatchId(UUID matchId) {
        return inningsRepository.findAll().stream()
                .filter(i -> i.getMatch().getId().equals(matchId))
                .toList();
    }

    // --- Delivery Methods ---
    @Transactional
    public Delivery submitDelivery(Delivery delivery) {
        Innings innings = inningsRepository.findById(delivery.getInnings().getId())
                .orElseThrow(() -> new RuntimeException("Innings not found"));

        String extraType = delivery.getExtrasType();
        boolean isWide = "Wide".equalsIgnoreCase(extraType);
        boolean isNoBall = "No-Ball".equalsIgnoreCase(extraType);
        boolean isLegalBall = !isWide && !isNoBall;

        int extraRuns = (isWide || isNoBall) ? 1 : 0;
        delivery.setExtrasRuns(extraRuns);

        int runsThisBall = delivery.getRunsBatter() + extraRuns;
        innings.setTotalRuns(innings.getTotalRuns() + runsThisBall);

        if (delivery.isWicket()) {
            innings.setTotalWickets(innings.getTotalWickets() + 1);
        }

        if (isLegalBall) {
            innings.setTotalOvers(incrementOvers(innings.getTotalOvers()));
        }

        BigDecimal currentOvers = innings.getTotalOvers();
        delivery.setOverNumber(currentOvers.intValue());
        int ballNum = currentOvers.remainder(BigDecimal.ONE).movePointRight(1).intValue();
        delivery.setBallNumber(ballNum);

        inningsRepository.save(innings);
        return deliveryRepository.save(delivery);
    }

    private BigDecimal incrementOvers(BigDecimal currentOvers) {
        if (currentOvers == null) currentOvers = BigDecimal.ZERO;
        int fullOvers = currentOvers.intValue();
        int balls = currentOvers.remainder(BigDecimal.ONE).movePointRight(1).intValue();
        balls++;
        if (balls >= 6) {
            fullOvers++;
            balls = 0;
        }
        return new BigDecimal(fullOvers + (balls / 10.0)).setScale(1, RoundingMode.HALF_UP);
    }

    public List<Delivery> getDeliveriesByInningsId(UUID inningsId) {
        return deliveryRepository.findRecentByInningsId(inningsId);
    }
}
