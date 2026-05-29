package com.parkvue.cricinfo.backend;

import com.parkvue.cricinfo.backend.model.Tournament;
import com.parkvue.cricinfo.backend.model.Team;
import com.parkvue.cricinfo.backend.model.Player;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class ScorerFlowIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    public void testFullScorerSetupFlow() {
        // 1. Create Tournament
        Tournament tournament = new Tournament();
        tournament.setName("Test Tournament");
        tournament.setStatus("Upcoming");

        ResponseEntity<Tournament> tResponse = restTemplate.postForEntity("/api/scorer/tournaments", tournament, Tournament.class);
        assertThat(tResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(tResponse.getBody().getId()).isNotNull();

        // 2. Create Team
        Team team = new Team();
        team.setName("Test Team");
        team.setShortName("TT");

        ResponseEntity<Team> teamResponse = restTemplate.postForEntity("/api/scorer/teams", team, Team.class);
        assertThat(teamResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(teamResponse.getBody().getId()).isNotNull();

        // 3. Create Player
        Player player = new Player();
        player.setFirstName("John");
        player.setLastName("Doe");
        player.setRole("Batsman");

        ResponseEntity<Player> pResponse = restTemplate.postForEntity("/api/scorer/players", player, Player.class);
        assertThat(pResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(pResponse.getBody().getId()).isNotNull();
    }
}
