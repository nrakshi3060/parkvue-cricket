package com.parkvue.cricinfo.backend.controller;

import com.parkvue.cricinfo.backend.dto.MatchSummaryDTO;
import com.parkvue.cricinfo.backend.model.Innings;
import com.parkvue.cricinfo.backend.model.Match;
import com.parkvue.cricinfo.backend.service.ScorerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/matches")
public class MatchController {

    @Autowired
    private ScorerService scorerService;

    @GetMapping
    public List<Match> getAllMatches() {
        return scorerService.getAllMatches();
    }

    @GetMapping("/live")
    public List<Match> getLiveMatches() {
        return scorerService.getAllMatches().stream()
                .filter(m -> "Live".equalsIgnoreCase(m.getStatus()))
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public Match getMatchById(@PathVariable UUID id) {
        return scorerService.getMatchById(id);
    }

    @GetMapping("/{id}/summary")
    public MatchSummaryDTO getMatchSummary(@PathVariable UUID id) {
        MatchSummaryDTO summary = new MatchSummaryDTO();
        summary.setMatch(scorerService.getMatchById(id));
        
        List<Innings> allInnings = scorerService.getInningsByMatchId(id);
        summary.setInnings(allInnings);
        
        // Fetch deliveries for the LATEST innings found
        if (!allInnings.isEmpty()) {
            Innings latestInnings = allInnings.stream()
                    .max((i1, i2) -> i1.getInningsNumber().compareTo(i2.getInningsNumber()))
                    .get();
            summary.setRecentDeliveries(scorerService.getDeliveriesByInningsId(latestInnings.getId()));
        }
        
        return summary;
    }
}
