package com.spandana.photohouse.service;

import com.spandana.photohouse.model.Rating;
import com.spandana.photohouse.repository.RatingRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RatingService {

    private final RatingRepository ratingRepository;

    public RatingService(RatingRepository ratingRepository) {
        this.ratingRepository = ratingRepository;
    }

    public Rating saveRating(Rating rating) {
        return ratingRepository.save(rating);
    }

    public Map<String, Object> getRatingStats() {
        List<Rating> all = ratingRepository.findAllByOrderByCreatedAtDesc();
        int total = all.size();

        Map<Integer, Integer> distribution = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            distribution.put(i, 0);
        }
        double sum = 0;
        for (Rating r : all) {
            distribution.merge(r.getStars(), 1, Integer::sum);
            sum += r.getStars();
        }

        double average = total > 0 ? Math.round((sum / total) * 10.0) / 10.0 : 0;

        List<Map<String, Object>> recentRatings = all.stream()
                .limit(10)
                .map(r -> Map.<String, Object>of(
                        "stars", r.getStars(),
                        "client_name", r.getClientName() != null ? r.getClientName() : "Anonymous",
                        "review_text", r.getReviewText() != null ? r.getReviewText() : "",
                        "created_at", r.getCreatedAt().toString()
                ))
                .collect(Collectors.toList());

        return Map.of(
                "average", average,
                "total", total,
                "distribution", distribution,
                "recentRatings", recentRatings
        );
    }
}
