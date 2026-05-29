package com.parkvue.cricinfo.backend.model;

import jakarta.persistence.*;
import java.util.UUID;

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

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Match getMatch() { return match; }
    public void setMatch(Match match) { this.match = match; }
    public Team getTeam() { return team; }
    public void setTeam(Team team) { this.team = team; }
    public Player getPlayer() { return player; }
    public void setPlayer(Player player) { this.player = player; }
    public boolean isPlayingXi() { return playingXi; }
    public void setPlayingXi(boolean playingXi) { this.playingXi = playingXi; }
    public boolean isCaptain() { return captain; }
    public void setCaptain(boolean captain) { this.captain = captain; }
    public boolean isWk() { return wk; }
    public void setWk(boolean wk) { this.wk = wk; }
}
