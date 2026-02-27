package com.spandana.photohouse.model;

import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

class RatingTest {

    @Test
    void defaultConstructor_createsEmptyRating() {
        Rating rating = new Rating();
        assertNull(rating.getId());
        assertNull(rating.getStars());
        assertNull(rating.getClientName());
        assertNull(rating.getReviewText());
        assertNotNull(rating.getCreatedAt());
    }

    @Test
    void parameterizedConstructor_setsAllFields() {
        Rating rating = new Rating(5, "John Doe", "Excellent service!");
        assertNull(rating.getId());
        assertEquals(5, rating.getStars());
        assertEquals("John Doe", rating.getClientName());
        assertEquals("Excellent service!", rating.getReviewText());
        assertNotNull(rating.getCreatedAt());
    }

    @Test
    void parameterizedConstructor_acceptsNullOptionalFields() {
        Rating rating = new Rating(4, null, null);
        assertEquals(4, rating.getStars());
        assertNull(rating.getClientName());
        assertNull(rating.getReviewText());
    }

    @Test
    void settersAndGetters_workCorrectly() {
        Rating rating = new Rating();
        Instant now = Instant.now();

        rating.setId(1L);
        rating.setStars(3);
        rating.setClientName("Jane");
        rating.setReviewText("Good");
        rating.setCreatedAt(now);

        assertEquals(1L, rating.getId());
        assertEquals(3, rating.getStars());
        assertEquals("Jane", rating.getClientName());
        assertEquals("Good", rating.getReviewText());
        assertEquals(now, rating.getCreatedAt());
    }
}
