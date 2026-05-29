package com.parkvue.cricinfo.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
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
}
