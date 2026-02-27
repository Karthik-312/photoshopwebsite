package com.spandana.photohouse.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "ratings")
public class Rating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer stars;

    private String clientName;

    @Column(length = 1000)
    private String reviewText;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Rating() {}

    public Rating(Integer stars, String clientName, String reviewText) {
        this.stars = stars;
        this.clientName = clientName;
        this.reviewText = reviewText;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getStars() { return stars; }
    public void setStars(Integer stars) { this.stars = stars; }

    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }

    public String getReviewText() { return reviewText; }
    public void setReviewText(String reviewText) { this.reviewText = reviewText; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
