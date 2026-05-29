package com.parkvue.cricinfo.backend.controller;

import com.parkvue.cricinfo.backend.dto.MatchSummaryDTO;
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
        summary.setInnings(scorerService.getInningsByMatchId(id));
        
        // Fetch recent deliveries for the first innings found (simplified)
        if (!summary.getInnings().isEmpty()) {
            summary.setRecentDeliveries(scorerService.getDeliveriesByInningsId(summary.getInnings().get(0).getId()));
        }
        
        return summary;
    }
}
