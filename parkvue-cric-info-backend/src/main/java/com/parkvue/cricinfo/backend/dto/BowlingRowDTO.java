package com.parkvue.cricinfo.backend.dto;

import java.math.BigDecimal;

public class BowlingRowDTO {
    private String playerName;
    private BigDecimal overs = BigDecimal.ZERO;
    private int maidens = 0;
    private int runsConceded = 0;
    private int wickets = 0;
    private double economy = 0.0;

    public String getPlayerName() { return playerName; }
    public void setPlayerName(String playerName) { this.playerName = playerName; }
    public BigDecimal getOvers() { return overs; }
    public void setOvers(BigDecimal overs) { this.overs = overs; }
    public int getMaidens() { return maidens; }
    public void setMaidens(int maidens) { this.maidens = maidens; }
    public int getRunsConceded() { return runsConceded; }
    public void setRunsConceded(int runsConceded) { this.runsConceded = runsConceded; }
    public int getWickets() { return wickets; }
    public void setWickets(int wickets) { this.wickets = wickets; }
    public double getEconomy() { return economy; }
    public void setEconomy(double economy) { this.economy = economy; }
}
