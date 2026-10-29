
package com.khensani.poultry.service;

import com.khensani.poultry.entity.Flock;
import com.khensani.poultry.entity.FlockStatus;
import com.khensani.poultry.entity.PoultryHouse;
import com.khensani.poultry.repository.FlockRepository;
import com.khensani.poultry.repository.MortalityRecordRepository;
import com.khensani.poultry.repository.PoultryHouseRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class FlockService {

    private final FlockRepository flockRepository;
    private final PoultryHouseRepository poultryHouseRepository;
    private final MortalityRecordRepository mortalityRecordRepository;

    public FlockService(
            FlockRepository flockRepository,
            PoultryHouseRepository poultryHouseRepository,
            MortalityRecordRepository mortalityRecordRepository) {
        this.flockRepository = flockRepository;
        this.poultryHouseRepository = poultryHouseRepository;
        this.mortalityRecordRepository = mortalityRecordRepository;
    }

    @Transactional(readOnly = true)
    public List<Flock> getAllFlocks() {
        return flockRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Flock getFlockById(Long id) {
        return flockRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Flock not found"
                ));
    }

    public Flock createFlock(Flock flock) {
        prepareFlock(flock);

        if (flockRepository.existsByFlockReferenceIgnoreCase(
                flock.getFlockReference())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "A flock with this reference already exists"
            );
        }

        PoultryHouse house = findAndValidateHouse(
                flock.getPoultryHouse().getId()
        );

        flock.setPoultryHouse(house);

        return flockRepository.save(flock);
    }

    public Flock updateFlock(Long id, Flock updatedFlock) {
        Flock existingFlock = getFlockById(id);

        prepareFlock(updatedFlock);

        boolean duplicateReference =
                flockRepository.existsByFlockReferenceIgnoreCase(
                        updatedFlock.getFlockReference()
                );

        if (duplicateReference
                && !existingFlock.getFlockReference()
                .equalsIgnoreCase(updatedFlock.getFlockReference())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "A flock with this reference already exists"
            );
        }

        PoultryHouse house = findAndValidateHouse(
                updatedFlock.getPoultryHouse().getId()
        );

        if (!updatedFlock.getInitialBirdCount()
                .equals(existingFlock.getInitialBirdCount())) {
            long totalDeaths = getTotalDeaths(id);

            if (updatedFlock.getInitialBirdCount() < totalDeaths) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Initial bird count cannot be lower than recorded deaths"
                );
            }
        }

        existingFlock.setFlockReference(
                updatedFlock.getFlockReference()
        );
        existingFlock.setBreed(updatedFlock.getBreed());
        existingFlock.setPlacementDate(updatedFlock.getPlacementDate());
        existingFlock.setInitialBirdCount(
                updatedFlock.getInitialBirdCount()
        );
        existingFlock.setSupplier(updatedFlock.getSupplier());
        existingFlock.setStatus(updatedFlock.getStatus());
        existingFlock.setPoultryHouse(house);

        return flockRepository.save(existingFlock);
    }

    @Transactional(readOnly = true)
    public long getTotalDeaths(Long flockId) {
        getFlockById(flockId);

        return mortalityRecordRepository
                .findByFlockIdOrderByMortalityDateDesc(flockId)
                .stream()
                .mapToLong(record -> record.getNumberOfDeaths())
                .sum();
    }

    @Transactional(readOnly = true)
    public long getCurrentBirdCount(Long flockId) {
        Flock flock = getFlockById(flockId);

        return flock.getInitialBirdCount() - getTotalDeaths(flockId);
    }

    @Transactional(readOnly = true)
    public double getMortalityRate(Long flockId) {
        Flock flock = getFlockById(flockId);
        long totalDeaths = getTotalDeaths(flockId);

        return totalDeaths * 100.0 / flock.getInitialBirdCount();
    }

    private PoultryHouse findAndValidateHouse(Long houseId) {
        if (houseId == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Poultry house is required"
            );
        }

        PoultryHouse house = poultryHouseRepository.findById(houseId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Poultry house not found"
                ));

        if (house.getStatus() !=
                com.khensani.poultry.entity.PoultryHouseStatus.ACTIVE) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Flocks can only be assigned to active poultry houses"
            );
        }

        return house;
    }

    private void prepareFlock(Flock flock) {
        if (flock.getFlockReference() != null) {
            flock.setFlockReference(
                    flock.getFlockReference().trim()
            );
        }

        if (flock.getBreed() != null) {
            flock.setBreed(flock.getBreed().trim());
        }

        if (flock.getSupplier() != null) {
            flock.setSupplier(flock.getSupplier().trim());
        }

        if (flock.getStatus() == null) {
            flock.setStatus(FlockStatus.ACTIVE);
        }

        if (flock.getPlacementDate() != null
                && flock.getPlacementDate().isAfter(LocalDate.now())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Placement date cannot be in the future"
            );
        }
    }
}
