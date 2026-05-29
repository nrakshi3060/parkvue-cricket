package com.parkvue.cricinfo.backend.repository;

import com.parkvue.cricinfo.backend.model.Player;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface PlayerRepository extends JpaRepository<Player, UUID> {
}
