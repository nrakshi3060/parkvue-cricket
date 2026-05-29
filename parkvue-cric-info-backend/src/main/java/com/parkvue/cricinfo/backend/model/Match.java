package com.parkvue.cricinfo.backend.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "matches")
public class Match {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "tournament_id")
    private Tournament tournament;

    @ManyToOne
    @JoinColumn(name = "team1_id")
    private Team team1;

    @ManyToOne
    @JoinColumn(name = "team2_id")
    private Team team2;

    private String venue;

    @Column(name = "scheduled_time")
    private OffsetDateTime scheduledTime;

    @Column(length = 50)
    private String status;

    @ManyToOne
    @JoinColumn(name = "toss_winner_id")
    private Team tossWinner;

    @Column(name = "toss_decision", length = 20)
    private String tossDecision;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Tournament getTournament() { return tournament; }
    public void setTournament(Tournament tournament) { this.tournament = tournament; }
    public Team getTeam1() { return team1; }
    public void setTeam1(Team team1) { this.team1 = team1; }
    public Team getTeam2() { return team2; }
    public void setTeam2(Team team2) { this.team2 = team2; }
    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }
    public OffsetDateTime getScheduledTime() { return scheduledTime; }
    public void setScheduledTime(OffsetDateTime scheduledTime) { this.scheduledTime = scheduledTime; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Team getTossWinner() { return tossWinner; }
    public void setTossWinner(Team tossWinner) { this.tossWinner = tossWinner; }
    public String getTossDecision() { return tossDecision; }
    public void setTossDecision(String tossDecision) { this.tossDecision = tossDecision; }
}
