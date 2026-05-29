package com.parkvue.cricinfo.backend.model;

import jakarta.persistence.*;
import java.util.UUID;

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

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Innings getInnings() { return innings; }
    public void setInnings(Innings innings) { this.innings = innings; }
    public Integer getOverNumber() { return overNumber; }
    public void setOverNumber(Integer overNumber) { this.overNumber = overNumber; }
    public Integer getBallNumber() { return ballNumber; }
    public void setBallNumber(Integer ballNumber) { this.ballNumber = ballNumber; }
    public Player getBatter() { return batter; }
    public void setBatter(Player batter) { this.batter = batter; }
    public Player getNonStriker() { return nonStriker; }
    public void setNonStriker(Player nonStriker) { this.nonStriker = nonStriker; }
    public Player getBowler() { return bowler; }
    public void setBowler(Player bowler) { this.bowler = bowler; }
    public Integer getRunsBatter() { return runsBatter; }
    public void setRunsBatter(Integer runsBatter) { this.runsBatter = runsBatter; }
    public String getExtrasType() { return extrasType; }
    public void setExtrasType(String extrasType) { this.extrasType = extrasType; }
    public Integer getExtrasRuns() { return extrasRuns; }
    public void setExtrasRuns(Integer extrasRuns) { this.extrasRuns = extrasRuns; }
    public boolean isWicket() { return wicket; }
    public void setWicket(boolean wicket) { this.wicket = wicket; }
    public String getWicketType() { return wicketType; }
    public void setWicketType(String wicketType) { this.wicketType = wicketType; }
    public Player getPlayerOut() { return playerOut; }
    public void setPlayerOut(Player playerOut) { this.playerOut = playerOut; }
    public Player getFielder() { return fielder; }
    public void setFielder(Player fielder) { this.fielder = fielder; }
    public String getCommentary() { return commentary; }
    public void setCommentary(String commentary) { this.commentary = commentary; }
}
