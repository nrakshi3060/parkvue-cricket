package com.parkvue.cricinfo.backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "innings")
public class Innings {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "match_id")
    private Match match;

    @ManyToOne
    @JoinColumn(name = "batting_team_id")
    private Team battingTeam;

    @ManyToOne
    @JoinColumn(name = "bowling_team_id")
    private Team bowlingTeam;

    @Column(name = "innings_number")
    private Integer inningsNumber;

    @Column(name = "total_runs")
    private Integer totalRuns = 0;

    @Column(name = "total_wickets")
    private Integer totalWickets = 0;

    @Column(name = "total_overs")
    private BigDecimal totalOvers = BigDecimal.ZERO;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Match getMatch() { return match; }
    public void setMatch(Match match) { this.match = match; }
    public Team getBattingTeam() { return battingTeam; }
    public void setBattingTeam(Team battingTeam) { this.battingTeam = battingTeam; }
    public Team getBowlingTeam() { return bowlingTeam; }
    public void setBowlingTeam(Team bowlingTeam) { this.bowlingTeam = bowlingTeam; }
    public Integer getInningsNumber() { return inningsNumber; }
    public void setInningsNumber(Integer inningsNumber) { this.inningsNumber = inningsNumber; }
    public Integer getTotalRuns() { return totalRuns; }
    public void setTotalRuns(Integer totalRuns) { this.totalRuns = totalRuns; }
    public Integer getTotalWickets() { return totalWickets; }
    public void setTotalWickets(Integer totalWickets) { this.totalWickets = totalWickets; }
    public BigDecimal getTotalOvers() { return totalOvers; }
    public void setTotalOvers(BigDecimal totalOvers) { this.totalOvers = totalOvers; }
}
