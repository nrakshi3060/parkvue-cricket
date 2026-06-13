package com.parkvue.cricinfo.backend.controller;

import com.parkvue.cricinfo.backend.dto.PlayerStatsDTO;
import com.parkvue.cricinfo.backend.service.AnalyticsService;
import com.parkvue.cricinfo.backend.service.ScorerService;
import com.parkvue.cricinfo.backend.model.Player;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @Autowired
    private ScorerService scorerService;

    @GetMapping("/players")
    public List<Player> getAllPlayers() {
        return scorerService.getAllPlayers();
    }

    @GetMapping("/players/{id}")
    public PlayerStatsDTO getPlayerStats(@PathVariable UUID id) {
        return analyticsService.getPlayerStats(id);
    }
}
