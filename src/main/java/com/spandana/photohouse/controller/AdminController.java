package com.spandana.photohouse.controller;

import com.spandana.photohouse.model.Booking;
import com.spandana.photohouse.model.ContactSubmission;
import com.spandana.photohouse.model.Rating;
import com.spandana.photohouse.repository.BookingRepository;
import com.spandana.photohouse.repository.ContactSubmissionRepository;
import com.spandana.photohouse.repository.RatingRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final RatingRepository ratingRepository;
    private final ContactSubmissionRepository contactRepository;
    private final BookingRepository bookingRepository;

    @Value("${app.admin.password:admin123}")
    private String adminPassword;

    public AdminController(RatingRepository ratingRepository, ContactSubmissionRepository contactRepository, BookingRepository bookingRepository) {
        this.ratingRepository = ratingRepository;
        this.contactRepository = contactRepository;
        this.bookingRepository = bookingRepository;
    }

    private boolean isAuthorized(String auth) {
        return auth != null && auth.equals(adminPassword);
    }

    @GetMapping("/ratings")
    public ResponseEntity<?> getRatings(@RequestHeader(value = "X-Admin-Password", required = false) String auth) {
        if (!isAuthorized(auth)) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        List<Rating> list = ratingRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(list.stream().map(r -> Map.of(
            "id", r.getId(),
            "stars", r.getStars(),
            "clientName", r.getClientName() != null ? r.getClientName() : "",
            "reviewText", r.getReviewText() != null ? r.getReviewText() : "",
            "createdAt", r.getCreatedAt().toString()
        )).collect(Collectors.toList()));
    }

    @GetMapping("/contacts")
    public ResponseEntity<?> getContacts(@RequestHeader(value = "X-Admin-Password", required = false) String auth) {
        if (!isAuthorized(auth)) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        List<ContactSubmission> list = contactRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(list.stream().map(c -> Map.of(
            "id", c.getId(),
            "name", c.getName(),
            "email", c.getEmail(),
            "phone", c.getPhone() != null ? c.getPhone() : "",
            "message", c.getMessage(),
            "createdAt", c.getCreatedAt().toString()
        )).collect(Collectors.toList()));
    }

    @GetMapping("/bookings")
    public ResponseEntity<?> getBookings(@RequestHeader(value = "X-Admin-Password", required = false) String auth) {
        if (!isAuthorized(auth)) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        List<Booking> list = bookingRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(list.stream().map(b -> {
            Map<String, Object> m = new java.util.LinkedHashMap<>();
            m.put("id", b.getId());
            m.put("name", b.getName());
            m.put("email", b.getEmail());
            m.put("phone", b.getPhone() != null ? b.getPhone() : "");
            m.put("eventType", b.getEventType());
            m.put("packageType", b.getPackageType() != null ? b.getPackageType() : "");
            m.put("preferredDate", b.getPreferredDate() != null ? b.getPreferredDate().toString() : "");
            m.put("notes", b.getNotes() != null ? b.getNotes() : "");
            m.put("paymentStatus", b.getPaymentStatus() != null ? b.getPaymentStatus() : "NONE");
            m.put("razorpayPaymentId", b.getRazorpayPaymentId() != null ? b.getRazorpayPaymentId() : "");
            m.put("createdAt", b.getCreatedAt().toString());
            return m;
        }).collect(Collectors.toList()));
    }
}
