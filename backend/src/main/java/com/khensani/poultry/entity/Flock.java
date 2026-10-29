
package com.khensani.poultry.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

@Entity
@Table(
    name = "flocks",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_flock_reference",
            columnNames = "flock_reference"
        )
    }
)
public class Flock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Flock reference is required")
    @Size(max = 50)
    @Column(name = "flock_reference", nullable = false, length = 50)
    private String flockReference;

    @NotBlank(message = "Breed is required")
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String breed;

    @NotNull(message = "Placement date is required")
    @Column(name = "placement_date", nullable = false)
    private LocalDate placementDate;

    @NotNull(message = "Initial bird count is required")
    @Min(value = 1, message = "Initial bird count must be at least 1")
    @Column(name = "initial_bird_count", nullable = false)
    private Integer initialBirdCount;

    @Size(max = 150)
    @Column(length = 150)
    private String supplier;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private FlockStatus status = FlockStatus.ACTIVE;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "poultry_house_id", nullable = false)
    @NotNull(message = "Poultry house is required")
    private PoultryHouse poultryHouse;

    public Flock() {
    }

    public Long getId() {
        return id;
    }

    public String getFlockReference() {
        return flockReference;
    }

    public void setFlockReference(String flockReference) {
        this.flockReference = flockReference;
    }

    public String getBreed() {
        return breed;
    }

    public void setBreed(String breed) {
        this.breed = breed;
    }

    public LocalDate getPlacementDate() {
        return placementDate;
    }

    public void setPlacementDate(LocalDate placementDate) {
        this.placementDate = placementDate;
    }

    public Integer getInitialBirdCount() {
        return initialBirdCount;
    }

    public void setInitialBirdCount(Integer initialBirdCount) {
        this.initialBirdCount = initialBirdCount;
    }

    public String getSupplier() {
        return supplier;
    }

    public void setSupplier(String supplier) {
        this.supplier = supplier;
    }

    public FlockStatus getStatus() {
        return status;
    }

    public void setStatus(FlockStatus status) {
        this.status = status;
    }

    public PoultryHouse getPoultryHouse() {
        return poultryHouse;
    }

    public void setPoultryHouse(PoultryHouse poultryHouse) {
        this.poultryHouse = poultryHouse;
    }
}
