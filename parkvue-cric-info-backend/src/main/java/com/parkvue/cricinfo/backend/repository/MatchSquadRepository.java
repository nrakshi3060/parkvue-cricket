package com.parkvue.cricinfo.backend.repository;

import com.parkvue.cricinfo.backend.model.MatchSquad;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface MatchSquadRepository extends JpaRepository<MatchSquad, UUID> {
}
