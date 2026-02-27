package com.spandana.photohouse.repository;

import com.spandana.photohouse.model.ContactSubmission;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class ContactSubmissionRepositoryTest {

    @Autowired
    private ContactSubmissionRepository contactRepository;

    @Test
    void save_submission_persistsCorrectly() {
        ContactSubmission submission = new ContactSubmission("Alice", "alice@test.com", "1234567890", "Hello!");
        ContactSubmission saved = contactRepository.save(submission);

        assertNotNull(saved.getId());
        assertEquals("Alice", saved.getName());
        assertEquals("alice@test.com", saved.getEmail());
        assertEquals("1234567890", saved.getPhone());
        assertEquals("Hello!", saved.getMessage());
        assertNotNull(saved.getCreatedAt());
    }

    @Test
    void findAllByOrderByCreatedAtDesc_returnsInCorrectOrder() {
        contactRepository.save(new ContactSubmission("First", "first@test.com", "", "Msg1"));
        contactRepository.save(new ContactSubmission("Second", "second@test.com", "", "Msg2"));

        List<ContactSubmission> all = contactRepository.findAllByOrderByCreatedAtDesc();

        assertEquals(2, all.size());
        assertEquals("Second", all.get(0).getName());
        assertEquals("First", all.get(1).getName());
    }

    @Test
    void findAllByOrderByCreatedAtDesc_emptyRepository_returnsEmptyList() {
        List<ContactSubmission> all = contactRepository.findAllByOrderByCreatedAtDesc();
        assertTrue(all.isEmpty());
    }
}
