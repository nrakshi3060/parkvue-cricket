package com.parkvue.cricinfo.backend.controller;

import com.parkvue.cricinfo.backend.dto.MatchSummaryDTO;
import com.parkvue.cricinfo.backend.model.Innings;
import com.parkvue.cricinfo.backend.model.Match;
import com.parkvue.cricinfo.backend.service.ScorerService;
import com.parkvue.cricinfo.backend.service.CacheService;
import com.parkvue.cricinfo.backend.service.BroadcastingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/matches")
public class MatchController {

    @Autowired
    private ScorerService scorerService;

    @Autowired
    private CacheService cacheService;

    @Autowired
    private BroadcastingService broadcastingService;

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
        // 1. Try Cache First (Fast Path)
        MatchSummaryDTO cached = cacheService.getCachedMatchSummary(id.toString());
        if (cached != null) return cached;

        // 2. Database Fallback (Slow Path)
        MatchSummaryDTO summary = new MatchSummaryDTO();
        summary.setMatch(scorerService.getMatchById(id));
        
        List<Innings> allInnings = scorerService.getInningsByMatchId(id);
        summary.setInnings(allInnings);
        
        if (!allInnings.isEmpty()) {
            Innings latestInnings = allInnings.stream()
                    .max((i1, i2) -> i1.getInningsNumber().compareTo(i2.getInningsNumber()))
                    .get();
            summary.setRecentDeliveries(scorerService.getDeliveriesByInningsId(latestInnings.getId()));
        }
        
        // 3. Update Cache for subsequent requests
        cacheService.cacheMatchSummary(id.toString(), summary);
        
        return summary;
    }

    @GetMapping(value = "/{id}/stream", produces = "text/event-stream")
    public SseEmitter streamMatchUpdates(@PathVariable UUID id) {
        return broadcastingService.subscribe(id.toString());
    }
}
