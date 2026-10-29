
package com.khensani.poultry.controller;

import com.khensani.poultry.entity.MortalityRecord;
import com.khensani.poultry.service.MortalityRecordService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mortality-records")
@CrossOrigin(origins = "http://localhost:5173")
public class MortalityRecordController {

    private final MortalityRecordService mortalityRecordService;

    public MortalityRecordController(
            MortalityRecordService mortalityRecordService) {
        this.mortalityRecordService = mortalityRecordService;
    }

    @GetMapping
    public List<MortalityRecord> getAllRecords() {
        return mortalityRecordService.getAllRecords();
    }

    @GetMapping("/flock/{flockId}")
    public List<MortalityRecord> getRecordsByFlock(
            @PathVariable Long flockId) {
        return mortalityRecordService.getRecordsByFlock(flockId);
    }

    @GetMapping("/{id}")
    public MortalityRecord getRecordById(@PathVariable Long id) {
        return mortalityRecordService.getRecordById(id);
    }

    @PostMapping("/flock/{flockId}")
    @ResponseStatus(HttpStatus.CREATED)
    public MortalityRecord createRecord(
            @PathVariable Long flockId,
            @Valid @RequestBody MortalityRecord record) {
        return mortalityRecordService.createRecord(flockId, record);
    }

    @PutMapping("/{id}")
    public MortalityRecord updateRecord(
            @PathVariable Long id,
            @Valid @RequestBody MortalityRecord record) {
        return mortalityRecordService.updateRecord(id, record);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRecord(@PathVariable Long id) {
        mortalityRecordService.deleteRecord(id);
    }
}
