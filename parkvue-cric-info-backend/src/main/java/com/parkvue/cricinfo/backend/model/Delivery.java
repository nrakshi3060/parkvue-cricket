package com.parkvue.cricinfo.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;

@Data
@Entity
@Table(name = "deliveries")
public class Delivery {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "innings_id")
    private Innings innings;

    @Column(name = "over_number")
    private Integer overNumber;

    @Column(name = "ball_number")
    private Integer ballNumber;

    @ManyToOne
    @JoinColumn(name = "batter_id")
    private Player batter;

    @ManyToOne
    @JoinColumn(name = "non_striker_id")
    private Player nonStriker;

    @ManyToOne
    @JoinColumn(name = "bowler_id")
    private Player bowler;

    @Column(name = "runs_batter")
    private Integer runsBatter = 0;

    @Column(name = "extras_type")
    private String extrasType = "None";

    @Column(name = "extras_runs")
    private Integer extrasRuns = 0;

    @Column(name = "is_wicket")
    private boolean wicket = false;

    @Column(name = "wicket_type")
    private String wicketType;

    @ManyToOne
    @JoinColumn(name = "player_out_id")
    private Player playerOut;

    @ManyToOne
    @JoinColumn(name = "fielder_id")
    private Player fielder;

    private String commentary;
}
