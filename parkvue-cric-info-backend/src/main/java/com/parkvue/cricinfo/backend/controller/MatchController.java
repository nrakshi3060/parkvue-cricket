package com.parkvue.cricinfo.backend.controller;

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
}
