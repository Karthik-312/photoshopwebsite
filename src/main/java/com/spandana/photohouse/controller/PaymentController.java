package com.spandana.photohouse.controller;

import com.spandana.photohouse.model.Booking;
import com.spandana.photohouse.repository.BookingRepository;
import com.spandana.photohouse.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDate;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*")
public class PaymentController {

    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);

    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;

    @Value("${app.razorpay.key-id:}")
    private String razorpayKeyId;

    @Value("${app.razorpay.key-secret:}")
    private String razorpayKeySecret;

    @Value("${app.razorpay.advance-amount:1000}")
    private int advanceAmount;

    public PaymentController(BookingRepository bookingRepository, NotificationService notificationService) {
        this.bookingRepository = bookingRepository;
        this.notificationService = notificationService;
    }

    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> getConfig() {
        boolean enabled = razorpayKeyId != null && !razorpayKeyId.isBlank()
                && razorpayKeySecret != null && !razorpayKeySecret.isBlank();
        return ResponseEntity.ok(Map.of(
                "enabled", enabled,
                "keyId", enabled ? razorpayKeyId : "",
                "advanceAmount", advanceAmount
        ));
    }

    @PostMapping("/create-order")
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody Map<String, Object> payload) {
        if (razorpayKeyId == null || razorpayKeyId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Payment gateway not configured"));
        }

        try {
            int amount = advanceAmount * 100; // Razorpay uses paisa

            String orderBody = "{\"amount\":" + amount
                    + ",\"currency\":\"INR\""
                    + ",\"receipt\":\"booking_" + System.currentTimeMillis() + "\""
                    + ",\"notes\":{\"name\":\"" + escapeJson(String.valueOf(payload.getOrDefault("name", "")))
                    + "\",\"event\":\"" + escapeJson(String.valueOf(payload.getOrDefault("eventType", ""))) + "\"}}";

            String auth = Base64.getEncoder().encodeToString((razorpayKeyId + ":" + razorpayKeySecret).getBytes());

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.razorpay.com/v1/orders"))
                    .header("Authorization", "Basic " + auth)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(orderBody))
                    .build();

            HttpResponse<String> response = HttpClient.newHttpClient()
                    .send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.error("Razorpay order creation failed: {}", response.body());
                return ResponseEntity.status(500).body(Map.of("error", "Could not create payment order"));
            }

            // Parse order_id from JSON response (simple extraction)
            String body = response.body();
            String orderId = extractJsonValue(body, "id");

            return ResponseEntity.ok(Map.of(
                    "orderId", orderId,
                    "amount", amount,
                    "currency", "INR",
                    "keyId", razorpayKeyId
            ));
        } catch (Exception e) {
            log.error("Payment order creation error: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Payment service unavailable"));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyPayment(@RequestBody Map<String, String> payload) {
        String razorpayOrderId = payload.get("razorpay_order_id");
        String razorpayPaymentId = payload.get("razorpay_payment_id");
        String razorpaySignature = payload.get("razorpay_signature");

        // Booking data
        String name = payload.get("name");
        String email = payload.get("email");
        String phone = payload.getOrDefault("phone", "");
        String eventType = payload.get("eventType");
        String packageType = payload.getOrDefault("packageType", "");
        String preferredDateStr = payload.getOrDefault("preferredDate", "");
        String notes = payload.getOrDefault("notes", "");

        if (razorpayOrderId == null || razorpayPaymentId == null || razorpaySignature == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Missing payment details"));
        }

        boolean valid = verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
        if (!valid) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Payment verification failed"));
        }

        LocalDate preferredDate = null;
        if (preferredDateStr != null && !preferredDateStr.isBlank()) {
            try { preferredDate = LocalDate.parse(preferredDateStr); } catch (Exception ignored) {}
        }

        Booking booking = new Booking(name, email, phone, eventType, packageType, preferredDate, notes);
        booking.setPaymentStatus("PAID");
        booking.setRazorpayOrderId(razorpayOrderId);
        booking.setRazorpayPaymentId(razorpayPaymentId);
        bookingRepository.save(booking);

        notificationService.sendBookingNotifications(booking);

        return ResponseEntity.ok(Map.of("success", true, "bookingId", booking.getId()));
    }

    private boolean verifySignature(String orderId, String paymentId, String signature) {
        try {
            String data = orderId + "|" + paymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(razorpayKeySecret.getBytes(), "HmacSHA256"));
            byte[] hash = mac.doFinal(data.getBytes());
            String generated = HexFormat.of().formatHex(hash);
            return generated.equals(signature);
        } catch (Exception e) {
            log.error("Signature verification error: {}", e.getMessage());
            return false;
        }
    }

    private String extractJsonValue(String json, String key) {
        String search = "\"" + key + "\":\"";
        int start = json.indexOf(search);
        if (start == -1) return "";
        start += search.length();
        int end = json.indexOf("\"", start);
        return end == -1 ? "" : json.substring(start, end);
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
