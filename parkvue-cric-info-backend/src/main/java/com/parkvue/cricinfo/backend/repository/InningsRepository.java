package com.parkvue.cricinfo.backend.repository;

import com.parkvue.cricinfo.backend.model.Innings;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface InningsRepository extends JpaRepository<Innings, UUID> {
}
