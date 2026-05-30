package com.parkvue.cricinfo.backend.repository;

import com.parkvue.cricinfo.backend.model.Delivery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.UUID;

public interface DeliveryRepository extends JpaRepository<Delivery, UUID> {
    
    @Query("SELECT d FROM Delivery d WHERE d.innings.id = :inningsId ORDER BY d.overNumber DESC, d.ballNumber DESC")
    List<Delivery> findRecentByInningsId(@Param("inningsId") UUID inningsId);
}
