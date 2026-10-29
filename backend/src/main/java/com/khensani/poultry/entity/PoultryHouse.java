package com.khensani.poultry.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "poultry_houses", uniqueConstraints = {
        @UniqueConstraint(name = "uk_poultry_house_number", columnNames = "house_number")
})

public class PoultryHouse {

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "House number is required")
    @Size(max = 50)
    @Column(name = "house_number", nullable = false, length = 50)
    private String houseNumber;

    @NotBlank(message = "House name is required")
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String name;

    @Size
    @Column(name = "farm_site", length = 100)
    private String farmSite;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    @Column(nullable = false)
    private Integer capacity;

    @NotBlank(message = "House type is required")
    @Size(max = 50)
    @Column(name = "house_type", nullable = false, length = 50)
    private String houseType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PoultryHouseStatus status = PoultryHouseStatus.ACTIVE;

    @Size(max = 500)
    @Column(length = 500)
    private String description;

    public PoultryHouse() {
    }

    public Long getId(){
        return id;
    }

    public String getHouseNumber() {
        return houseNumber;
    }

    public void setHouseNumber(String houseNumber) {
        this.houseNumber = houseNumber;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getFarmSite() {
        return farmSite;
    }

    public void setFarmSite(String farmSite) {
        this.farmSite = farmSite;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getHouseType() {
        return houseType;
    }

    public void setHouseType(String houseType) {
        this.houseType = houseType;
    }

    public PoultryHouseStatus getStatus() {
        return status;
    }

    public void setStatus(PoultryHouseStatus status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

}
