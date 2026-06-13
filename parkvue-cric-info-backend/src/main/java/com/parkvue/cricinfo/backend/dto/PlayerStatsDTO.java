package com.parkvue.cricinfo.backend.dto;

import java.math.BigDecimal;

public class PlayerStatsDTO {
    // Batting
    private int totalRuns = 0;
    private int highestScore = 0;
    private double battingAverage = 0.0;
    private double strikeRate = 0.0;
    private int fours = 0;
    private int sixes = 0;
    private int matchesPlayed = 0;
    private int ballsFaced = 0;
    private int dismissals = 0;

    // Bowling
    private int totalWickets = 0;
    private double economyRate = 0.0;
    private String bestFigures = "0/0";
    private BigDecimal oversBowled = BigDecimal.ZERO;
    private int runsConceded = 0;

    // Getters and Setters
    public int getTotalRuns() { return totalRuns; }
    public void setTotalRuns(int totalRuns) { this.totalRuns = totalRuns; }
    public int getHighestScore() { return highestScore; }
    public void setHighestScore(int highestScore) { this.highestScore = highestScore; }
    public double getBattingAverage() { return battingAverage; }
    public void setBattingAverage(double battingAverage) { this.battingAverage = battingAverage; }
    public double getStrikeRate() { return strikeRate; }
    public void setStrikeRate(double strikeRate) { this.strikeRate = strikeRate; }
    public int getFours() { return fours; }
    public void setFours(int fours) { this.fours = fours; }
    public int getSixes() { return sixes; }
    public void setSixes(int sixes) { this.sixes = sixes; }
    public int getMatchesPlayed() { return matchesPlayed; }
    public void setMatchesPlayed(int matchesPlayed) { this.matchesPlayed = matchesPlayed; }
    public int getBallsFaced() { return ballsFaced; }
    public void setBallsFaced(int ballsFaced) { this.ballsFaced = ballsFaced; }
    public int getDismissals() { return dismissals; }
    public void setDismissals(int dismissals) { this.dismissals = dismissals; }
    public int getTotalWickets() { return totalWickets; }
    public void setTotalWickets(int totalWickets) { this.totalWickets = totalWickets; }
    public double getEconomyRate() { return economyRate; }
    public void setEconomyRate(double economyRate) { this.economyRate = economyRate; }
    public String getBestFigures() { return bestFigures; }
    public void setBestFigures(String bestFigures) { this.bestFigures = bestFigures; }
    public BigDecimal getOversBowled() { return oversBowled; }
    public void setOversBowled(BigDecimal oversBowled) { this.oversBowled = oversBowled; }
    public int getRunsConceded() { return runsConceded; }
    public void setRunsConceded(int runsConceded) { this.runsConceded = runsConceded; }
}
