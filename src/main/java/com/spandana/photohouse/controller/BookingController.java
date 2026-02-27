package com.spandana.photohouse.controller;

import com.spandana.photohouse.model.Booking;
import com.spandana.photohouse.repository.BookingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingRepository bookingRepository;

    public BookingController(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    @PostMapping("/booking")
    public ResponseEntity<Map<String, Object>> submitBooking(@RequestBody Map<String, String> payload) {
        String name = payload.get("name");
        String email = payload.get("email");
        String phone = payload.getOrDefault("phone", "");
        String eventType = payload.get("eventType");
        String packageType = payload.getOrDefault("package", "");
        String preferredDateStr = payload.get("preferredDate");
        String notes = payload.getOrDefault("notes", "");

        if (name == null || name.isBlank() || email == null || email.isBlank() || eventType == null || eventType.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", "Name, email, and event type are required"));
        }

        LocalDate preferredDate = null;
        if (preferredDateStr != null && !preferredDateStr.isBlank()) {
            try {
                preferredDate = LocalDate.parse(preferredDateStr);
            } catch (Exception ignored) {}
        }

        Booking booking = new Booking(name, email, phone, eventType, packageType, preferredDate, notes);
        bookingRepository.save(booking);

        return ResponseEntity.ok(Map.of("success", true));
    }
}
