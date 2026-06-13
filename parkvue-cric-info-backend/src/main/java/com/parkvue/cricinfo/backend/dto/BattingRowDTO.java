package com.parkvue.cricinfo.backend.dto;

public class BattingRowDTO {
    private String playerName;
    private int runs = 0;
    private int balls = 0;
    private int fours = 0;
    private int sixes = 0;
    private double strikeRate = 0.0;
    private String dismissalInfo = "not out";

    public String getPlayerName() { return playerName; }
    public void setPlayerName(String playerName) { this.playerName = playerName; }
    public int getRuns() { return runs; }
    public void setRuns(int runs) { this.runs = runs; }
    public int getBalls() { return balls; }
    public void setBalls(int balls) { this.balls = balls; }
    public int getFours() { return fours; }
    public void setFours(int fours) { this.fours = fours; }
    public int getSixes() { return sixes; }
    public void setSixes(int sixes) { this.sixes = sixes; }
    public double getStrikeRate() { return strikeRate; }
    public void setStrikeRate(double strikeRate) { this.strikeRate = strikeRate; }
    public String getDismissalInfo() { return dismissalInfo; }
    public void setDismissalInfo(String dismissalInfo) { this.dismissalInfo = dismissalInfo; }
}
