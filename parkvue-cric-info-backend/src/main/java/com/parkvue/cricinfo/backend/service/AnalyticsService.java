package com.parkvue.cricinfo.backend.service;

import com.parkvue.cricinfo.backend.dto.BattingRowDTO;
import com.parkvue.cricinfo.backend.dto.BowlingRowDTO;
import com.parkvue.cricinfo.backend.dto.InningsScorecardDTO;
import com.parkvue.cricinfo.backend.dto.PlayerStatsDTO;
import com.parkvue.cricinfo.backend.dto.ScorecardDTO;
import com.parkvue.cricinfo.backend.model.Delivery;
import com.parkvue.cricinfo.backend.model.Innings;
import com.parkvue.cricinfo.backend.repository.DeliveryRepository;
import com.parkvue.cricinfo.backend.repository.InningsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private DeliveryRepository deliveryRepository;

    @Autowired
    private InningsRepository inningsRepository;

    public PlayerStatsDTO getPlayerStats(UUID playerId) {
        PlayerStatsDTO stats = new PlayerStatsDTO();

        // 1. Fetch all relevant deliveries
        List<Delivery> battingDeliveries = deliveryRepository.findAllByBatterId(playerId);
        List<Delivery> bowlingDeliveries = deliveryRepository.findAllByBowlerId(playerId);
        List<Delivery> dismissalDeliveries = deliveryRepository.findAllByPlayerOutId(playerId);

        // 2. Batting Stats Calculation
        if (!battingDeliveries.isEmpty()) {
            int totalRuns = battingDeliveries.stream().mapToInt(Delivery::getRunsBatter).sum();
            int ballsFaced = (int) battingDeliveries.stream()
                .filter(d -> !"Wide".equalsIgnoreCase(d.getExtrasType()))
                .count();
            int fours = (int) battingDeliveries.stream().filter(d -> d.getRunsBatter() == 4).count();
            int sixes = (int) battingDeliveries.stream().filter(d -> d.getRunsBatter() == 6).count();
            int dismissals = dismissalDeliveries.size();

            Map<UUID, Integer> runsPerInnings = battingDeliveries.stream()
                .collect(Collectors.groupingBy(d -> d.getInnings().getId(), Collectors.summingInt(Delivery::getRunsBatter)));
            int highestScore = runsPerInnings.values().stream().max(Integer::compare).orElse(0);

            stats.setTotalRuns(totalRuns);
            stats.setBallsFaced(ballsFaced);
            stats.setFours(fours);
            stats.setSixes(sixes);
            stats.setDismissals(dismissals);
            stats.setHighestScore(highestScore);
            stats.setMatchesPlayed(runsPerInnings.size());

            if (dismissals > 0) {
                stats.setBattingAverage(totalRuns / (double) dismissals);
            } else {
                stats.setBattingAverage(totalRuns); 
            }

            if (ballsFaced > 0) {
                stats.setStrikeRate((totalRuns * 100.0) / ballsFaced);
            }
        }

        // 3. Bowling Stats Calculation
        if (!bowlingDeliveries.isEmpty()) {
            int totalWickets = (int) bowlingDeliveries.stream().filter(Delivery::isWicket).count();
            int runsConceded = bowlingDeliveries.stream()
                .mapToInt(d -> d.getRunsBatter() + (d.getExtrasRuns() != null ? d.getExtrasRuns() : 0))
                .sum();
            int legalBalls = (int) bowlingDeliveries.stream()
                .filter(d -> !"Wide".equalsIgnoreCase(d.getExtrasType()) && !"No-Ball".equalsIgnoreCase(d.getExtrasType()))
                .count();

            BigDecimal overs = new BigDecimal(legalBalls / 6 + (legalBalls % 6) / 10.0).setScale(1, RoundingMode.HALF_UP);
            
            stats.setTotalWickets(totalWickets);
            stats.setRunsConceded(runsConceded);
            stats.setOversBowled(overs);

            if (overs.doubleValue() > 0) {
                stats.setEconomyRate(runsConceded / Math.max(0.1, overs.doubleValue()));
            }

            Map<UUID, List<Delivery>> bowlsPerInnings = bowlingDeliveries.stream()
                .collect(Collectors.groupingBy(d -> d.getInnings().getId()));
            
            String bestFigures = "0/0";
            int maxWickets = -1;
            int minRuns = 999;

            for (List<Delivery> inningsBowls : bowlsPerInnings.values()) {
                int w = (int) inningsBowls.stream().filter(Delivery::isWicket).count();
                int r = inningsBowls.stream().mapToInt(d -> d.getRunsBatter() + (d.getExtrasRuns() != null ? d.getExtrasRuns() : 0)).sum();
                
                if (w > maxWickets || (w == maxWickets && r < minRuns)) {
                    maxWickets = w;
                    minRuns = r;
                    bestFigures = w + "/" + r;
                }
            }
            stats.setBestFigures(bestFigures);
        }

        return stats;
    }

    public ScorecardDTO generateMatchScorecard(UUID matchId) {
        ScorecardDTO scorecard = new ScorecardDTO();
        List<InningsScorecardDTO> inningsStats = new ArrayList<>();

        List<Innings> allInnings = inningsRepository.findAll().stream()
            .filter(i -> i.getMatch().getId().equals(matchId))
            .sorted((a, b) -> a.getInningsNumber().compareTo(b.getInningsNumber()))
            .toList();

        for (Innings innings : allInnings) {
            InningsScorecardDTO isDTO = new InningsScorecardDTO();
            isDTO.setInnings(innings);

            List<Delivery> deliveries = deliveryRepository.findAll().stream()
                .filter(d -> d.getInnings().getId().equals(innings.getId()))
                .toList();

            // Aggregating Batting
            Map<UUID, List<Delivery>> byBatter = deliveries.stream()
                .filter(d -> d.getBatter() != null)
                .collect(Collectors.groupingBy(d -> d.getBatter().getId()));

            List<BattingRowDTO> battingRows = new ArrayList<>();
            for (Map.Entry<UUID, List<Delivery>> entry : byBatter.entrySet()) {
                List<Delivery> bats = entry.getValue();
                BattingRowDTO row = new BattingRowDTO();
                row.setPlayerName(bats.get(0).getBatter().getFirstName() + " " + bats.get(0).getBatter().getLastName());
                row.setRuns(bats.stream().mapToInt(Delivery::getRunsBatter).sum());
                row.setBalls((int) bats.stream().filter(d -> !"Wide".equalsIgnoreCase(d.getExtrasType())).count());
                row.setFours((int) bats.stream().filter(d -> d.getRunsBatter() == 4).count());
                row.setSixes((int) bats.stream().filter(d -> d.getRunsBatter() == 6).count());
                if (row.getBalls() > 0) {
                    row.setStrikeRate((row.getRuns() * 100.0) / row.getBalls());
                }
                
                deliveries.stream()
                    .filter(d -> d.isWicket() && d.getPlayerOut() != null && d.getPlayerOut().getId().equals(entry.getKey()))
                    .findFirst()
                    .ifPresent(d -> row.setDismissalInfo(d.getWicketType() != null ? d.getWicketType() : "out"));

                battingRows.add(row);
            }
            isDTO.setBatting(battingRows);

            // Aggregating Bowling
            Map<UUID, List<Delivery>> byBowler = deliveries.stream()
                .filter(d -> d.getBowler() != null)
                .collect(Collectors.groupingBy(d -> d.getBowler().getId()));

            List<BowlingRowDTO> bowlingRows = new ArrayList<>();
            for (Map.Entry<UUID, List<Delivery>> entry : byBowler.entrySet()) {
                List<Delivery> bowls = entry.getValue();
                BowlingRowDTO row = new BowlingRowDTO();
                row.setPlayerName(bowls.get(0).getBowler().getFirstName() + " " + bowls.get(0).getBowler().getLastName());
                row.setWickets((int) bowls.stream().filter(Delivery::isWicket).count());
                row.setRunsConceded(bowls.stream().mapToInt(d -> d.getRunsBatter() + (d.getExtrasRuns() != null ? d.getExtrasRuns() : 0)).sum());
                
                int legalBalls = (int) bowls.stream()
                    .filter(d -> !"Wide".equalsIgnoreCase(d.getExtrasType()) && !"No-Ball".equalsIgnoreCase(d.getExtrasType()))
                    .count();
                BigDecimal overs = new BigDecimal(legalBalls / 6 + (legalBalls % 6) / 10.0).setScale(1, RoundingMode.HALF_UP);
                row.setOvers(overs);

                if (overs.doubleValue() > 0) {
                    row.setEconomy(row.getRunsConceded() / Math.max(0.1, overs.doubleValue()));
                }
                bowlingRows.add(row);
            }
            isDTO.setBowling(bowlingRows);

            inningsStats.add(isDTO);
        }

        scorecard.setInnings(inningsStats);
        return scorecard;
    }
}
