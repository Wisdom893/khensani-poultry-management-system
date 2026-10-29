
package com.khensani.poultry.controller;

import com.khensani.poultry.entity.Flock;
import com.khensani.poultry.service.FlockService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/flocks")
@CrossOrigin(origins = "http://localhost:5173")
public class FlockController {

    private final FlockService flockService;

    public FlockController(FlockService flockService) {
        this.flockService = flockService;
    }

    @GetMapping
    public List<Flock> getAllFlocks() {
        return flockService.getAllFlocks();
    }

    @GetMapping("/{id}")
    public Flock getFlockById(@PathVariable Long id) {
        return flockService.getFlockById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Flock createFlock(@Valid @RequestBody Flock flock) {
        return flockService.createFlock(flock);
    }

    @PutMapping("/{id}")
    public Flock updateFlock(
            @PathVariable Long id,
            @Valid @RequestBody Flock flock) {
        return flockService.updateFlock(id, flock);
    }

    @GetMapping("/{id}/statistics")
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
