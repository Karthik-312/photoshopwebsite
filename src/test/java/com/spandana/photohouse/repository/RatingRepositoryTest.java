package com.spandana.photohouse.repository;

import com.spandana.photohouse.model.Rating;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class RatingRepositoryTest {

    @Autowired
    private RatingRepository ratingRepository;

    @Test
    void save_rating_persistsCorrectly() {
        Rating rating = new Rating(5, "Test User", "Great service!");
        Rating saved = ratingRepository.save(rating);

        assertNotNull(saved.getId());
        assertEquals(5, saved.getStars());
        assertEquals("Test User", saved.getClientName());
        assertEquals("Great service!", saved.getReviewText());
        assertNotNull(saved.getCreatedAt());
    }

    @Test
    void findAllByOrderByCreatedAtDesc_returnsInCorrectOrder() {
        Rating r1 = ratingRepository.save(new Rating(5, "First", ""));
        Rating r2 = ratingRepository.save(new Rating(4, "Second", ""));
        Rating r3 = ratingRepository.save(new Rating(3, "Third", ""));

        List<Rating> all = ratingRepository.findAllByOrderByCreatedAtDesc();

        assertEquals(3, all.size());
        assertEquals("Third", all.get(0).getClientName());
        assertEquals("Second", all.get(1).getClientName());
        assertEquals("First", all.get(2).getClientName());
    }

    @Test
    void findAllByOrderByCreatedAtDesc_emptyRepository_returnsEmptyList() {
        List<Rating> all = ratingRepository.findAllByOrderByCreatedAtDesc();
        assertTrue(all.isEmpty());
    }
}
