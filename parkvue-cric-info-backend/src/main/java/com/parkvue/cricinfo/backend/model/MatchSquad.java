package com.parkvue.cricinfo.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;

@Data
@Entity
@Table(name = "match_squads")
public class MatchSquad {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "match_id")
    private Match match;

    @ManyToOne
    @JoinColumn(name = "team_id")
    private Team team;

    @ManyToOne
    @JoinColumn(name = "player_id")
    private Player player;

    @Column(name = "is_playing_xi")
    private boolean playingXi = true;

    @Column(name = "is_captain")
    private boolean captain = false;

    @Column(name = "is_wk")
    private boolean wk = false;
}
