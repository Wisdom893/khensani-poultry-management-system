
package com.khensani.poultry.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

@Entity
@Table(name = "mortality_records")
public class MortalityRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Mortality date is required")
    @Column(name = "mortality_date", nullable = false)
    private LocalDate mortalityDate;

    @NotNull(message = "Number of deaths is required")
    @Min(value = 1, message = "Number of deaths must be at least 1")
    @Column(name = "number_of_deaths", nullable = false)
    private Integer numberOfDeaths;

    @NotBlank(message = "Mortality reason is required")
    @Size(max = 255)
    @Column(nullable = false, length = 255)
    private String reason;

    @Size(max = 500)
    @Column(length = 500)
    private String notes;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "flock_id", nullable = false)
    private Flock flock;

    public MortalityRecord() {
    }

    public Long getId() {
        return id;
    }

    public LocalDate getMortalityDate() {
        return mortalityDate;
    }

    public void setMortalityDate(LocalDate mortalityDate) {
        this.mortalityDate = mortalityDate;
    }

    public Integer getNumberOfDeaths() {
        return numberOfDeaths;
    }

    public void setNumberOfDeaths(Integer numberOfDeaths) {
        this.numberOfDeaths = numberOfDeaths;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Flock getFlock() {
        return flock;
    }

    public void setFlock(Flock flock) {
        this.flock = flock;
    }
}
