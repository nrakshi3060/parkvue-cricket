package com.parkvue.cricinfo.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
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
}
