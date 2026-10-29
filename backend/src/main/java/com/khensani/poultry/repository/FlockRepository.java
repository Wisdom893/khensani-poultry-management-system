
package com.khensani.poultry.repository;

import com.khensani.poultry.entity.Flock;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FlockRepository extends JpaRepository<Flock, Long> {

    boolean existsByFlockReferenceIgnoreCase(String flockReference);
}
