package com.parkvue.cricinfo.backend.service;

import com.parkvue.cricinfo.backend.dto.PlayerStatsDTO;
import com.parkvue.cricinfo.backend.model.Delivery;
import com.parkvue.cricinfo.backend.repository.DeliveryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private DeliveryRepository deliveryRepository;

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

            // Highest Score (calculated per innings)
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
                stats.setBattingAverage(totalRuns); // Not out average
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
                // Approximate economy: runs / total_overs
                stats.setEconomyRate(runsConceded / Math.max(0.1, overs.doubleValue()));
            }

            // Best Figures
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
}
