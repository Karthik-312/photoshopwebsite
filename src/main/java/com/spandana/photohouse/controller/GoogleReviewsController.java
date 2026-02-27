package com.spandana.photohouse.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/google-reviews")
@CrossOrigin(origins = "*")
public class GoogleReviewsController {

    private static final Logger log = LoggerFactory.getLogger(GoogleReviewsController.class);
    private static final long CACHE_TTL_MS = 3600_000; // 1 hour

    @Value("${app.google.places.api-key:}")
    private String apiKey;

    @Value("${app.google.places.place-id:}")
    private String placeId;

    private final Map<String, Object> cache = new ConcurrentHashMap<>();
    private volatile long cacheTimestamp = 0;

    @GetMapping
    public ResponseEntity<?> getReviews() {
        if (apiKey == null || apiKey.isBlank() || placeId == null || placeId.isBlank()) {
            return ResponseEntity.ok(Map.of("reviews", List.of(), "configured", false));
        }

        if (System.currentTimeMillis() - cacheTimestamp < CACHE_TTL_MS && !cache.isEmpty()) {
            return ResponseEntity.ok(cache);
        }

        try {
            String url = "https://maps.googleapis.com/maps/api/place/details/json"
                    + "?place_id=" + URLEncoder.encode(placeId, StandardCharsets.UTF_8)
                    + "&fields=reviews,rating,user_ratings_total,name"
                    + "&key=" + URLEncoder.encode(apiKey, StandardCharsets.UTF_8);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .GET()
                    .build();

            HttpResponse<String> response = HttpClient.newHttpClient()
                    .send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.error("Google Places API error: {}", response.body());
                return ResponseEntity.ok(Map.of("reviews", List.of(), "configured", true, "error", "API error"));
            }

            Map<String, Object> parsed = parseGoogleResponse(response.body());
            parsed.put("configured", true);
            cache.clear();
            cache.putAll(parsed);
            cacheTimestamp = System.currentTimeMillis();

            return ResponseEntity.ok(parsed);
        } catch (Exception e) {
            log.error("Google Reviews fetch error: {}", e.getMessage());
            return ResponseEntity.ok(Map.of("reviews", List.of(), "configured", true, "error", e.getMessage()));
        }
    }

    private Map<String, Object> parseGoogleResponse(String json) {
        Map<String, Object> result = new LinkedHashMap<>();
        List<Map<String, Object>> reviews = new ArrayList<>();

        // Extract overall rating
        String ratingStr = extractValue(json, "\"rating\":", ",");
        double rating = 0;
        try { rating = Double.parseDouble(ratingStr.trim()); } catch (Exception ignored) {}

        String totalStr = extractValue(json, "\"user_ratings_total\":", ",");
        if (totalStr.endsWith("}")) totalStr = totalStr.replace("}", "");
        int totalRatings = 0;
        try { totalRatings = Integer.parseInt(totalStr.trim()); } catch (Exception ignored) {}

        // Extract reviews array
        int reviewsStart = json.indexOf("\"reviews\":");
        if (reviewsStart != -1) {
            int arrStart = json.indexOf("[", reviewsStart);
            if (arrStart != -1) {
                int depth = 0;
                int arrEnd = arrStart;
                for (int i = arrStart; i < json.length(); i++) {
                    if (json.charAt(i) == '[') depth++;
                    else if (json.charAt(i) == ']') {
                        depth--;
                        if (depth == 0) { arrEnd = i; break; }
                    }
                }
                String reviewsJson = json.substring(arrStart, arrEnd + 1);
                reviews = parseReviewsArray(reviewsJson);
            }
        }

        result.put("overallRating", rating);
        result.put("totalRatings", totalRatings);
        result.put("reviews", reviews);
        return result;
    }

    private List<Map<String, Object>> parseReviewsArray(String arr) {
        List<Map<String, Object>> reviews = new ArrayList<>();
        int idx = 0;
        while (true) {
            int objStart = arr.indexOf("{", idx);
            if (objStart == -1) break;
            int depth = 0;
            int objEnd = objStart;
            for (int i = objStart; i < arr.length(); i++) {
                if (arr.charAt(i) == '{') depth++;
                else if (arr.charAt(i) == '}') {
                    depth--;
                    if (depth == 0) { objEnd = i; break; }
                }
            }
            String obj = arr.substring(objStart, objEnd + 1);
            Map<String, Object> review = new LinkedHashMap<>();
            review.put("authorName", extractStringValue(obj, "author_name"));
            review.put("profilePhoto", extractStringValue(obj, "profile_photo_url"));
            String rStr = extractValue(obj, "\"rating\":", ",");
            if (rStr.endsWith("}")) rStr = rStr.replace("}", "");
            try { review.put("rating", Integer.parseInt(rStr.trim())); } catch (Exception e) { review.put("rating", 5); }
            review.put("text", extractStringValue(obj, "text"));
            review.put("relativeTime", extractStringValue(obj, "relative_time_description"));
            String timeStr = extractValue(obj, "\"time\":", ",");
            if (timeStr.endsWith("}")) timeStr = timeStr.replace("}", "");
            try { review.put("time", Long.parseLong(timeStr.trim())); } catch (Exception e) { review.put("time", 0L); }
            reviews.add(review);
            idx = objEnd + 1;
        }
        return reviews;
    }

    private String extractStringValue(String json, String key) {
        String search = "\"" + key + "\":\"";
        int start = json.indexOf(search);
        if (start == -1) return "";
        start += search.length();
        StringBuilder sb = new StringBuilder();
        for (int i = start; i < json.length(); i++) {
            char c = json.charAt(i);
            if (c == '\\' && i + 1 < json.length()) {
                sb.append(json.charAt(i + 1));
                i++;
            } else if (c == '"') {
                break;
            } else {
                sb.append(c);
            }
        }
        return sb.toString();
    }

    private String extractValue(String json, String prefix, String suffix) {
        int start = json.indexOf(prefix);
        if (start == -1) return "0";
        start += prefix.length();
        int end = json.indexOf(suffix, start);
        if (end == -1) end = json.length();
        return json.substring(start, end).trim();
    }
}
