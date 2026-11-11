
package com.khensani.poultry.controller;

import com.khensani.poultry.entity.MortalityRecord;
import com.khensani.poultry.service.MortalityRecordService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
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
    @PreAuthorize("@rolePermissionService.hasPermission(authentication, 'FLOCK_MANAGEMENT', 'VIEW')")
    public List<MortalityRecord> getAllRecords() {
        return mortalityRecordService.getAllRecords();
    }

    @GetMapping("/flock/{flockId}")
    @PreAuthorize("@rolePermissionService.hasPermission(authentication, 'FLOCK_MANAGEMENT', 'VIEW')")
    public List<MortalityRecord> getRecordsByFlock(
            @PathVariable Long flockId) {
        return mortalityRecordService.getRecordsByFlock(flockId);
    }

    @GetMapping("/{id}")
    @PreAuthorize("@rolePermissionService.hasPermission(authentication, 'FLOCK_MANAGEMENT', 'VIEW')")
    public MortalityRecord getRecordById(@PathVariable Long id) {
        return mortalityRecordService.getRecordById(id);
    }

    @PostMapping("/flock/{flockId}")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("@rolePermissionService.hasPermission(authentication, 'FLOCK_MANAGEMENT', 'CREATE')")
    public MortalityRecord createRecord(
            @PathVariable Long flockId,
            @Valid @RequestBody MortalityRecord record) {
        return mortalityRecordService.createRecord(flockId, record);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@rolePermissionService.hasPermission(authentication, 'FLOCK_MANAGEMENT', 'EDIT')")
    public MortalityRecord updateRecord(
            @PathVariable Long id,
            @Valid @RequestBody MortalityRecord record) {
        return mortalityRecordService.updateRecord(id, record);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("@rolePermissionService.hasPermission(authentication, 'FLOCK_MANAGEMENT', 'FULL')")
    public void deleteRecord(@PathVariable Long id) {
        mortalityRecordService.deleteRecord(id);
    }
}
