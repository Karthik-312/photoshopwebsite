package com.spandana.photohouse.model;

import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

class ContactSubmissionTest {

    @Test
    void defaultConstructor_createsEmptySubmission() {
        ContactSubmission submission = new ContactSubmission();
        assertNull(submission.getId());
        assertNull(submission.getName());
        assertNull(submission.getEmail());
        assertNull(submission.getPhone());
        assertNull(submission.getMessage());
        assertNotNull(submission.getCreatedAt());
    }

    @Test
    void parameterizedConstructor_setsAllFields() {
        ContactSubmission submission = new ContactSubmission("Alice", "alice@test.com", "1234567890", "Hello!");
        assertNull(submission.getId());
        assertEquals("Alice", submission.getName());
        assertEquals("alice@test.com", submission.getEmail());
        assertEquals("1234567890", submission.getPhone());
        assertEquals("Hello!", submission.getMessage());
        assertNotNull(submission.getCreatedAt());
    }

    @Test
    void parameterizedConstructor_acceptsEmptyPhone() {
        ContactSubmission submission = new ContactSubmission("Bob", "bob@test.com", "", "Message");
        assertEquals("", submission.getPhone());
    }

    @Test
    void settersAndGetters_workCorrectly() {
        ContactSubmission submission = new ContactSubmission();
        Instant now = Instant.now();

        submission.setId(10L);
        submission.setName("Test");
        submission.setEmail("test@example.com");
        submission.setPhone("555-1234");
        submission.setMessage("Test message");
        submission.setCreatedAt(now);

        assertEquals(10L, submission.getId());
        assertEquals("Test", submission.getName());
        assertEquals("test@example.com", submission.getEmail());
        assertEquals("555-1234", submission.getPhone());
        assertEquals("Test message", submission.getMessage());
        assertEquals(now, submission.getCreatedAt());
    }
}
