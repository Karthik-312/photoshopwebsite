package com.spandana.photohouse.service;

import com.spandana.photohouse.model.Booking;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.format.DateTimeFormatter;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final JavaMailSender mailSender;

    @Value("${app.studio.email:}")
    private String studioEmail;

    @Value("${app.studio.phone:}")
    private String studioPhone;

    @Value("${app.studio.name:Spandana Photo House}")
    private String studioName;

    @Value("${app.sms.enabled:false}")
    private boolean smsEnabled;

    @Value("${app.sms.api-key:}")
    private String smsApiKey;

    public NotificationService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendBookingNotifications(Booking booking) {
        sendEmailToStudio(booking);
        sendEmailToCustomer(booking);
        if (smsEnabled) {
            sendSmsToStudio(booking);
            if (booking.getPhone() != null && !booking.getPhone().isBlank()) {
                sendSmsToCustomer(booking);
            }
        }
    }

    private void sendEmailToStudio(Booking booking) {
        if (studioEmail == null || studioEmail.isBlank()) return;
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setTo(studioEmail);
            helper.setSubject("New Booking: " + booking.getEventType() + " — " + booking.getName());
            helper.setText(buildStudioEmailHtml(booking), true);
            mailSender.send(msg);
            log.info("Studio email sent for booking #{}", booking.getId());
        } catch (Exception e) {
            log.error("Failed to send studio email for booking #{}: {}", booking.getId(), e.getMessage());
        }
    }

    private void sendEmailToCustomer(Booking booking) {
        if (booking.getEmail() == null || booking.getEmail().isBlank()) return;
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setTo(booking.getEmail());
            helper.setSubject("Booking Confirmation — " + studioName);
            helper.setText(buildCustomerEmailHtml(booking), true);
            mailSender.send(msg);
            log.info("Customer email sent for booking #{}", booking.getId());
        } catch (Exception e) {
            log.error("Failed to send customer email for booking #{}: {}", booking.getId(), e.getMessage());
        }
    }

    private void sendSmsToStudio(Booking booking) {
        String message = "New Booking! " + booking.getName() + " - " + booking.getEventType();
        if (booking.getPreferredDate() != null) {
            message += " on " + booking.getPreferredDate().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy"));
        }
        message += ". Phone: " + (booking.getPhone() != null ? booking.getPhone() : "N/A");
        sendSms(studioPhone, message);
    }

    private void sendSmsToCustomer(Booking booking) {
        String message = "Hi " + booking.getName() + "! Your booking at " + studioName
                + " for " + booking.getEventType() + " is confirmed.";
        if (booking.getPreferredDate() != null) {
            message += " Date: " + booking.getPreferredDate().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy"));
        }
        message += " We'll contact you shortly. Call: " + studioPhone;
        sendSms(booking.getPhone(), message);
    }

    private void sendSms(String phone, String message) {
        if (smsApiKey == null || smsApiKey.isBlank() || "YOUR_FAST2SMS_API_KEY".equals(smsApiKey)) {
            log.warn("SMS API key not configured, skipping SMS to {}", phone);
            return;
        }
        try {
            String body = "{\"route\":\"q\",\"message\":\"" + escapeJson(message)
                    + "\",\"language\":\"english\",\"flash\":0,\"numbers\":\"" + phone + "\"}";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://www.fast2sms.com/dev/bulkV2"))
                    .header("authorization", smsApiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = HttpClient.newHttpClient()
                    .send(request, HttpResponse.BodyHandlers.ofString());

            log.info("SMS sent to {}: status={}", phone, response.statusCode());
        } catch (Exception e) {
            log.error("Failed to send SMS to {}: {}", phone, e.getMessage());
        }
    }

    private String escapeJson(String s) {
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n");
    }

    private String buildStudioEmailHtml(Booking booking) {
        StringBuilder sb = new StringBuilder();
        sb.append("<div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;'>");
        sb.append("<div style='background:#c9a227;padding:16px 24px;border-radius:4px 4px 0 0;'>");
        sb.append("<h2 style='color:#0a0a0b;margin:0;'>New Booking Request</h2></div>");
        sb.append("<div style='border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 4px 4px;'>");
        sb.append("<table style='width:100%;border-collapse:collapse;'>");
        addRow(sb, "Name", booking.getName());
        addRow(sb, "Email", booking.getEmail());
        addRow(sb, "Phone", booking.getPhone() != null ? booking.getPhone() : "—");
        addRow(sb, "Event Type", booking.getEventType());
        addRow(sb, "Package", booking.getPackageType() != null && !booking.getPackageType().isBlank() ? booking.getPackageType() : "—");
        addRow(sb, "Preferred Date", booking.getPreferredDate() != null ? booking.getPreferredDate().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy")) : "—");
        addRow(sb, "Notes", booking.getNotes() != null && !booking.getNotes().isBlank() ? booking.getNotes() : "—");
        addRow(sb, "Payment", booking.getPaymentStatus() != null ? booking.getPaymentStatus() : "No payment");
        sb.append("</table></div></div>");
        return sb.toString();
    }

    private String buildCustomerEmailHtml(Booking booking) {
        StringBuilder sb = new StringBuilder();
        sb.append("<div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;'>");
        sb.append("<div style='background:#c9a227;padding:16px 24px;border-radius:4px 4px 0 0;'>");
        sb.append("<h2 style='color:#0a0a0b;margin:0;'>Booking Confirmed!</h2></div>");
        sb.append("<div style='border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 4px 4px;'>");
        sb.append("<p>Dear <strong>").append(booking.getName()).append("</strong>,</p>");
        sb.append("<p>Thank you for choosing <strong>").append(studioName).append("</strong>! ");
        sb.append("Your booking request has been received and we will get back to you within 24 hours.</p>");
        sb.append("<h3 style='color:#c9a227;'>Booking Details</h3>");
        sb.append("<table style='width:100%;border-collapse:collapse;'>");
        addRow(sb, "Event Type", booking.getEventType());
        if (booking.getPackageType() != null && !booking.getPackageType().isBlank()) {
            addRow(sb, "Package", booking.getPackageType());
        }
        if (booking.getPreferredDate() != null) {
            addRow(sb, "Preferred Date", booking.getPreferredDate().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy")));
        }
        if (booking.getPaymentStatus() != null && !"NONE".equals(booking.getPaymentStatus())) {
            addRow(sb, "Payment Status", booking.getPaymentStatus());
        }
        sb.append("</table>");
        sb.append("<hr style='border:none;border-top:1px solid #e5e7eb;margin:20px 0;'/>");
        sb.append("<p style='color:#6b7280;font-size:14px;'>For questions, call us at <strong>")
          .append(studioPhone).append("</strong> or reply to this email.</p>");
        sb.append("<p style='color:#c9a227;font-weight:600;'>— ").append(studioName).append("</p>");
        sb.append("</div></div>");
        return sb.toString();
    }

    private void addRow(StringBuilder sb, String label, String value) {
        sb.append("<tr>");
        sb.append("<td style='padding:8px 12px;font-weight:600;color:#374151;border-bottom:1px solid #f3f4f6;width:140px;'>").append(label).append("</td>");
        sb.append("<td style='padding:8px 12px;border-bottom:1px solid #f3f4f6;'>").append(value).append("</td>");
        sb.append("</tr>");
    }
}
