
package com.khensani.poultry.controller;

import com.khensani.poultry.entity.Flock;
import com.khensani.poultry.service.FlockService;
import com.khensani.poultry.service.RolePermissionService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/flocks")
@CrossOrigin(origins = "http://localhost:5173")
public class FlockController {

    private final FlockService flockService;

    public FlockController(
            FlockService flockService,
            RolePermissionService rolePermissionService) {
        this.flockService = flockService;
    }

    @GetMapping
    @PreAuthorize("@rolePermissionService.hasPermission(authentication, 'FLOCK_MANAGEMENT', 'VIEW')")
    public List<Flock> getAllFlocks() {
        return flockService.getAllFlocks();
    }

    @GetMapping("/{id}")
    @PreAuthorize("@rolePermissionService.hasPermission(authentication, 'FLOCK_MANAGEMENT', 'VIEW')")
    public Flock getFlockById(@PathVariable Long id) {
        return flockService.getFlockById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("@rolePermissionService.hasPermission(authentication, 'FLOCK_MANAGEMENT', 'CREATE')")
    public Flock createFlock(@Valid @RequestBody Flock flock) {
        return flockService.createFlock(flock);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@rolePermissionService.hasPermission(authentication, 'FLOCK_MANAGEMENT', 'EDIT')")
    public Flock updateFlock(
            @PathVariable Long id,
            @Valid @RequestBody Flock flock) {
        return flockService.updateFlock(id, flock);
    }

    @GetMapping("/{id}/statistics")
    @PreAuthorize("@rolePermissionService.hasPermission(authentication, 'FLOCK_MANAGEMENT', 'VIEW')")
    public FlockStatistics getStatistics(@PathVariable Long id) {
        return new FlockStatistics(
                flockService.getTotalDeaths(id),
                flockService.getCurrentBirdCount(id),
                flockService.getMortalityRate(id)
        );
    }

    public record FlockStatistics(
            long totalDeaths,
            long currentBirdCount,
            double mortalityRate
    ) {
    }
}
