
package com.khensani.poultry.controller;

import com.khensani.poultry.entity.PoultryHouse;
import com.khensani.poultry.service.PoultryHouseService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/poultry-houses")
@CrossOrigin(origins = "http://localhost:5173")
public class PoultryHouseController {

    private final PoultryHouseService poultryHouseService;

    public PoultryHouseController(
            PoultryHouseService poultryHouseService) {
        this.poultryHouseService = poultryHouseService;
    }

    @GetMapping
    @PreAuthorize("@rolePermissionService.hasPermission(authentication, 'POULTRY_HOUSES', 'VIEW')")
    public List<PoultryHouse> getAllHouses() {
        return poultryHouseService.getAllHouses();
    }

    @GetMapping("/{id}")
    @PreAuthorize("@rolePermissionService.hasPermission(authentication, 'POULTRY_HOUSES', 'VIEW')")
    public PoultryHouse getHouseById(@PathVariable Long id) {
        return poultryHouseService.getHouseById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("@rolePermissionService.hasPermission(authentication, 'POULTRY_HOUSES', 'CREATE')")
    public PoultryHouse createHouse(
            @Valid @RequestBody PoultryHouse house) {
        return poultryHouseService.createHouse(house);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@rolePermissionService.hasPermission(authentication, 'POULTRY_HOUSES', 'EDIT')")
    public PoultryHouse updateHouse(
            @PathVariable Long id,
            @Valid @RequestBody PoultryHouse house) {
        return poultryHouseService.updateHouse(id, house);
    }
}
