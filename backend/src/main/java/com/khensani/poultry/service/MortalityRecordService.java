
package com.khensani.poultry.service;

import com.khensani.poultry.entity.Flock;
import com.khensani.poultry.entity.MortalityRecord;
import com.khensani.poultry.repository.FlockRepository;
import com.khensani.poultry.repository.MortalityRecordRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class MortalityRecordService {

    private final MortalityRecordRepository mortalityRecordRepository;
    private final FlockRepository flockRepository;

    public MortalityRecordService(
            MortalityRecordRepository mortalityRecordRepository,
            FlockRepository flockRepository) {
        this.mortalityRecordRepository = mortalityRecordRepository;
        this.flockRepository = flockRepository;
    }

    @Transactional(readOnly = true)
    public List<MortalityRecord> getAllRecords() {
        return mortalityRecordRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<MortalityRecord> getRecordsByFlock(Long flockId) {
        findFlock(flockId);

        return mortalityRecordRepository
                .findByFlockIdOrderByMortalityDateDesc(flockId);
    }

    @Transactional(readOnly = true)
    public MortalityRecord getRecordById(Long id) {
        return mortalityRecordRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Mortality record not found"
                ));
    }

    public MortalityRecord createRecord(
            Long flockId,
            MortalityRecord record) {

        Flock flock = findFlock(flockId);

        validateRecord(record, flock);

        long currentBirds = calculateCurrentBirds(flock);

        if (record.getNumberOfDeaths() > currentBirds) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Recorded deaths cannot exceed the flock's remaining birds"
            );
        }

        record.setFlock(flock);

        if (record.getReason() != null) {
            record.setReason(record.getReason().trim());
        }

        if (record.getNotes() != null) {
            record.setNotes(record.getNotes().trim());
        }

        return mortalityRecordRepository.save(record);
    }

    public MortalityRecord updateRecord(
            Long id,
            MortalityRecord updatedRecord) {

        MortalityRecord existingRecord = getRecordById(id);
        Flock flock = existingRecord.getFlock();

        validateRecord(updatedRecord, flock);

        long otherDeaths = mortalityRecordRepository
                .findByFlockIdOrderByMortalityDateDesc(flock.getId())
                .stream()
                .filter(record -> !record.getId().equals(id))
                .mapToLong(record -> record.getNumberOfDeaths())
                .sum();

        long remainingBeforeThisRecord =
                flock.getInitialBirdCount() - otherDeaths;

        if (updatedRecord.getNumberOfDeaths() > remainingBeforeThisRecord) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Recorded deaths cannot exceed the flock's remaining birds"
            );
        }

        existingRecord.setMortalityDate(updatedRecord.getMortalityDate());
        existingRecord.setNumberOfDeaths(
                updatedRecord.getNumberOfDeaths()
        );
        existingRecord.setReason(updatedRecord.getReason().trim());
        existingRecord.setNotes(
                updatedRecord.getNotes() == null
                        ? null
                        : updatedRecord.getNotes().trim()
        );

        return mortalityRecordRepository.save(existingRecord);
    }

    public void deleteRecord(Long id) {
        MortalityRecord record = getRecordById(id);
        mortalityRecordRepository.delete(record);
    }

    private Flock findFlock(Long flockId) {
        return flockRepository.findById(flockId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Flock not found"
                ));
    }

    private long calculateCurrentBirds(Flock flock) {
        long totalDeaths = mortalityRecordRepository
                .findByFlockIdOrderByMortalityDateDesc(flock.getId())
                .stream()
                .mapToLong(record -> record.getNumberOfDeaths())
                .sum();

        return flock.getInitialBirdCount() - totalDeaths;
    }

    private void validateRecord(
            MortalityRecord record,
            Flock flock) {

        if (record.getMortalityDate() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Mortality date is required"
            );
        }

        if (record.getMortalityDate().isBefore(flock.getPlacementDate())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Mortality date cannot be before the flock placement date"
            );
        }

        if (record.getMortalityDate().isAfter(LocalDate.now())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Mortality date cannot be in the future"
            );
        }

        if (record.getNumberOfDeaths() == null
                || record.getNumberOfDeaths() < 1) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Number of deaths must be at least 1"
            );
        }

        if (record.getReason() == null
                || record.getReason().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Mortality reason is required"
            );
        }
    }
}
