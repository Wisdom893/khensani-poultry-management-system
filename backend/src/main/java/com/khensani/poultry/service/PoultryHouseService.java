package com.khensani.poultry.service;

import com.khensani.poultry.entity.PoultryHouse;
import com.khensani.poultry.repository.PoultryHouseRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service
public class PoultryHouseService {

    private final PoultryHouseRepository poultryHouseRepository;

    public PoultryHouseService(
            PoultryHouseRepository poultryHouseRepository) {
        this.poultryHouseRepository = poultryHouseRepository;
    }

    public List<PoultryHouse> getAllHouses() {
        return poultryHouseRepository.findAll();
    }

    public PoultryHouse getHouseById(Long id) {
        return poultryHouseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Poultry house not found"));
    }

    public PoultryHouse createHouse(PoultryHouse house) {
        prepareHouse(house);

        if (poultryHouseRepository
                .existsByHouseNumberIgnoreCase(house.getHouseNumber())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "A poultry house with this house number already exists");
        }

        return poultryHouseRepository.save(house);
    }

    public PoultryHouse updateHouse(Long id, PoultryHouse updatedHouse) {
        PoultryHouse existingHouse = getHouseById(id);

        prepareHouse(updatedHouse);

        boolean duplicateNumber = poultryHouseRepository
                .existsByHouseNumberIgnoreCase(
                        updatedHouse.getHouseNumber());

        if (duplicateNumber && !existingHouse.getHouseNumber()
                .equalsIgnoreCase(updatedHouse.getHouseNumber())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "A poultry house with this house number already exists");
        }

        existingHouse.setHouseNumber(updatedHouse.getHouseNumber());
        existingHouse.setName(updatedHouse.getName());
        existingHouse.setFarmSite(updatedHouse.getFarmSite());
        existingHouse.setCapacity(updatedHouse.getCapacity());
        existingHouse.setHouseType(updatedHouse.getHouseType());
        existingHouse.setStatus(updatedHouse.getStatus());
        existingHouse.setDescription(updatedHouse.getDescription());

        return poultryHouseRepository.save(existingHouse);
    }

    private void prepareHouse(PoultryHouse house) {
        if (house.getHouseNumber() != null) {
            house.setHouseNumber(house.getHouseNumber().trim());
        }

        if (house.getName() != null) {
            house.setName(house.getName().trim());
        }

        if (house.getFarmSite() != null) {
            house.setFarmSite(house.getFarmSite().trim());
        }

        if (house.getHouseType() != null) {
            house.setHouseType(house.getHouseType().trim());
        }

        if (house.getDescription() != null) {
            house.setDescription(house.getDescription().trim());
        }

        if (house.getStatus() == null) {
            house.setStatus(
                    com.khensani.poultry.entity.PoultryHouseStatus.ACTIVE);
        }
    }

}
