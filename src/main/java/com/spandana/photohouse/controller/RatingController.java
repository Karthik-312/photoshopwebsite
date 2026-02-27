package com.spandana.photohouse.controller;

import com.spandana.photohouse.model.Rating;
import com.spandana.photohouse.service.RatingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class RatingController {

    private final RatingService ratingService;

    public RatingController(RatingService ratingService) {
        this.ratingService = ratingService;
    }

    @GetMapping("/ratings")
    public ResponseEntity<Map<String, Object>> getRatings() {
        return ResponseEntity.ok(ratingService.getRatingStats());
    }

    @PostMapping("/ratings")
    public ResponseEntity<Map<String, Object>> submitRating(@RequestBody Map<String, Object> payload) {
        Integer stars = (Integer) payload.get("stars");
        if (stars == null || stars < 1 || stars > 5) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", "Stars must be between 1 and 5"));
        }

        String clientName = (String) payload.get("clientName");
        String reviewText = (String) payload.get("reviewText");

        Rating rating = new Rating(stars, clientName != null ? clientName : "", reviewText != null ? reviewText : "");
        ratingService.saveRating(rating);

        return ResponseEntity.ok(Map.of("success", true));
    }
}
