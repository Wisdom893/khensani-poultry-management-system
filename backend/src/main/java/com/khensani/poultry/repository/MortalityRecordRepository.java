
package com.khensani.poultry.repository;

import com.khensani.poultry.entity.MortalityRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MortalityRecordRepository
        extends JpaRepository<MortalityRecord, Long> {

    List<MortalityRecord> findByFlockIdOrderByMortalityDateDesc(Long flockId);

    long countByFlockId(Long flockId);

    boolean existsByFlockId(Long flockId);
}
