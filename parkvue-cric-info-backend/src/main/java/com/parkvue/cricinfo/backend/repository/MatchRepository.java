package com.parkvue.cricinfo.backend.repository;

import com.parkvue.cricinfo.backend.model.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface MatchRepository extends JpaRepository<Match, UUID> {
}
