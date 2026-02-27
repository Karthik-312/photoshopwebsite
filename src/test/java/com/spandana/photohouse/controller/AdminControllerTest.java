package com.spandana.photohouse.controller;

import com.spandana.photohouse.model.Booking;
import com.spandana.photohouse.model.ContactSubmission;
import com.spandana.photohouse.model.Rating;
import com.spandana.photohouse.repository.BookingRepository;
import com.spandana.photohouse.repository.ContactSubmissionRepository;
import com.spandana.photohouse.repository.RatingRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AdminController.class)
@TestPropertySource(properties = "app.admin.password=testpass123")
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RatingRepository ratingRepository;

    @MockBean
    private ContactSubmissionRepository contactRepository;

    @MockBean
    private BookingRepository bookingRepository;

    @Test
    void getRatings_withoutAuth_returns401() throws Exception {
        mockMvc.perform(get("/api/admin/ratings"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    void getRatings_withWrongPassword_returns401() throws Exception {
        mockMvc.perform(get("/api/admin/ratings")
                        .header("X-Admin-Password", "wrong"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getRatings_withCorrectPassword_returnsRatings() throws Exception {
        Rating r = new Rating(5, "Alice", "Great!");
        r.setId(1L);
        r.setCreatedAt(Instant.now());
        when(ratingRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(r));

        mockMvc.perform(get("/api/admin/ratings")
                        .header("X-Admin-Password", "testpass123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].stars").value(5))
                .andExpect(jsonPath("$[0].clientName").value("Alice"));
    }

    @Test
    void getContacts_withoutAuth_returns401() throws Exception {
        mockMvc.perform(get("/api/admin/contacts"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getContacts_withCorrectPassword_returnsContacts() throws Exception {
        ContactSubmission c = new ContactSubmission("Bob", "bob@test.com", "123", "Hi");
        c.setId(1L);
        c.setCreatedAt(Instant.now());
        when(contactRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(c));

        mockMvc.perform(get("/api/admin/contacts")
                        .header("X-Admin-Password", "testpass123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Bob"))
                .andExpect(jsonPath("$[0].email").value("bob@test.com"));
    }

    @Test
    void getBookings_withoutAuth_returns401() throws Exception {
        mockMvc.perform(get("/api/admin/bookings"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getBookings_withCorrectPassword_returnsBookings() throws Exception {
        Booking b = new Booking("Client", "client@test.com", "555", "wedding", "portrait", null, "Notes");
        b.setId(1L);
        b.setCreatedAt(Instant.now());
        when(bookingRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(b));

        mockMvc.perform(get("/api/admin/bookings")
                        .header("X-Admin-Password", "testpass123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Client"))
                .andExpect(jsonPath("$[0].eventType").value("wedding"));
    }
}
