package com.khensani.poultry.repository;

import com.khensani.poultry.entity.PoultryHouse;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PoultryHouseRepository extends JpaRepository<PoultryHouse, Long> {

    boolean existsByHouseNumberIgnoreCase(String houseNumber);
    
}
