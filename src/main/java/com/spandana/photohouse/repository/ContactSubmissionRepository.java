package com.spandana.photohouse.repository;

import com.spandana.photohouse.model.ContactSubmission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContactSubmissionRepository extends JpaRepository<ContactSubmission, Long> {
    List<ContactSubmission> findAllByOrderByCreatedAtDesc();
}
