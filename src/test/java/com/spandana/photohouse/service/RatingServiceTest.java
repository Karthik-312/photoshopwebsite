package com.spandana.photohouse.service;

import com.spandana.photohouse.model.Rating;
import com.spandana.photohouse.repository.RatingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RatingServiceTest {

    @Mock
    private RatingRepository ratingRepository;

    @InjectMocks
    private RatingService ratingService;

    private Rating rating1;
    private Rating rating2;

    @BeforeEach
    void setUp() {
        rating1 = new Rating(5, "Alice", "Great!");
        rating1.setId(1L);
        rating1.setCreatedAt(Instant.now());

        rating2 = new Rating(4, "Bob", null);
        rating2.setId(2L);
        rating2.setCreatedAt(Instant.now());
    }

    @Test
    void saveRating_returnsSavedRating() {
        when(ratingRepository.save(any(Rating.class))).thenReturn(rating1);

        Rating result = ratingService.saveRating(rating1);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals(5, result.getStars());
        verify(ratingRepository, times(1)).save(rating1);
    }

    @Test
    void getRatingStats_withNoRatings_returnsEmptyStats() {
        when(ratingRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of());

        Map<String, Object> stats = ratingService.getRatingStats();

        assertEquals(0.0, stats.get("average"));
        assertEquals(0, stats.get("total"));
        @SuppressWarnings("unchecked")
        Map<Integer, Integer> dist = (Map<Integer, Integer>) stats.get("distribution");
        for (int i = 1; i <= 5; i++) {
            assertEquals(0, dist.get(i));
        }
        @SuppressWarnings("unchecked")
        List<?> recent = (List<?>) stats.get("recentRatings");
        assertTrue(recent.isEmpty());
    }

    @Test
    void getRatingStats_withRatings_returnsCorrectStats() {
        when(ratingRepository.findAllByOrderByCreatedAtDesc()).thenReturn(Arrays.asList(rating1, rating2));

        Map<String, Object> stats = ratingService.getRatingStats();

        assertEquals(4.5, stats.get("average"));
        assertEquals(2, stats.get("total"));
        @SuppressWarnings("unchecked")
        Map<Integer, Integer> dist = (Map<Integer, Integer>) stats.get("distribution");
        assertEquals(1, dist.get(5));
        assertEquals(1, dist.get(4));
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> recent = (List<Map<String, Object>>) stats.get("recentRatings");
        assertEquals(2, recent.size());
        assertEquals(5, recent.get(0).get("stars"));
        assertEquals("Alice", recent.get(0).get("client_name"));
        assertEquals("Great!", recent.get(0).get("review_text"));
    }

    @Test
    void getRatingStats_withNullClientName_usesAnonymous() {
        rating1.setClientName(null);
        when(ratingRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(rating1));

        Map<String, Object> stats = ratingService.getRatingStats();

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> recent = (List<Map<String, Object>>) stats.get("recentRatings");
        assertEquals("Anonymous", recent.get(0).get("client_name"));
    }

    @Test
    void getRatingStats_limitsRecentRatingsTo10() {
        List<Rating> many = Arrays.asList(
                new Rating(5, "A", ""), new Rating(5, "B", ""), new Rating(5, "C", ""),
                new Rating(5, "D", ""), new Rating(5, "E", ""), new Rating(5, "F", ""),
                new Rating(5, "G", ""), new Rating(5, "H", ""), new Rating(5, "I", ""),
                new Rating(5, "J", ""), new Rating(5, "K", "")
        );
        when(ratingRepository.findAllByOrderByCreatedAtDesc()).thenReturn(many);

        Map<String, Object> stats = ratingService.getRatingStats();

        @SuppressWarnings("unchecked")
        List<?> recent = (List<?>) stats.get("recentRatings");
        assertEquals(10, recent.size());
    }
}
