package com.spandana.photohouse.controller;

import com.spandana.photohouse.model.ContactSubmission;
import com.spandana.photohouse.repository.ContactSubmissionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ContactController {

    private final ContactSubmissionRepository contactRepository;

    public ContactController(ContactSubmissionRepository contactRepository) {
        this.contactRepository = contactRepository;
    }

    @PostMapping("/contact")
    public ResponseEntity<Map<String, Object>> submitContact(@RequestBody Map<String, String> payload) {
        String name = payload.get("name");
        String email = payload.get("email");
        String phone = payload.getOrDefault("phone", "");
        String message = payload.get("message");

        if (name == null || name.isBlank() || email == null || email.isBlank() || message == null || message.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", "Name, email, and message are required"));
        }

        ContactSubmission submission = new ContactSubmission(name, email, phone, message);
        contactRepository.save(submission);

        return ResponseEntity.ok(Map.of("success", true));
    }
}
