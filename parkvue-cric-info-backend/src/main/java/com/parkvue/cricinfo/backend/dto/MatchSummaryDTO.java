package com.parkvue.cricinfo.backend.dto;

import com.parkvue.cricinfo.backend.model.Delivery;
import com.parkvue.cricinfo.backend.model.Innings;
import com.parkvue.cricinfo.backend.model.Match;
import java.util.List;

public class MatchSummaryDTO {
    private Match match;
    private List<Innings> innings;
    private List<Delivery> recentDeliveries;

    public Match getMatch() { return match; }
    public void setMatch(Match match) { this.match = match; }
    public List<Innings> getInnings() { return innings; }
    public void setInnings(List<Innings> innings) { this.innings = innings; }
    public List<Delivery> getRecentDeliveries() { return recentDeliveries; }
    public void setRecentDeliveries(List<Delivery> recentDeliveries) { this.recentDeliveries = recentDeliveries; }
}
