package com.spandana.photohouse.repository;

import com.spandana.photohouse.model.Booking;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class BookingRepositoryTest {

    @Autowired
    private BookingRepository bookingRepository;

    @Test
    void save_booking_persistsCorrectly() {
        LocalDate date = LocalDate.of(2025, 6, 15);
        Booking booking = new Booking("Client", "client@test.com", "9876543210", "wedding", "portrait", date, "Notes");
        Booking saved = bookingRepository.save(booking);

        assertNotNull(saved.getId());
        assertEquals("Client", saved.getName());
        assertEquals("client@test.com", saved.getEmail());
        assertEquals("wedding", saved.getEventType());
        assertEquals("portrait", saved.getPackageType());
        assertEquals(date, saved.getPreferredDate());
        assertEquals("Notes", saved.getNotes());
        assertNotNull(saved.getCreatedAt());
    }

    @Test
    void findAllByOrderByCreatedAtDesc_returnsInCorrectOrder() {
        bookingRepository.save(new Booking("First", "first@test.com", "", "portrait", "", null, ""));
        bookingRepository.save(new Booking("Second", "second@test.com", "", "wedding", "", null, ""));

        List<Booking> all = bookingRepository.findAllByOrderByCreatedAtDesc();

        assertEquals(2, all.size());
        assertEquals("Second", all.get(0).getName());
        assertEquals("First", all.get(1).getName());
    }

    @Test
    void findAllByOrderByCreatedAtDesc_emptyRepository_returnsEmptyList() {
        List<Booking> all = bookingRepository.findAllByOrderByCreatedAtDesc();
        assertTrue(all.isEmpty());
    }

    @Test
    void save_booking_withNullOptionalFields_succeeds() {
        Booking booking = new Booking("Name", "email@test.com", null, "event", null, null, null);
        Booking saved = bookingRepository.save(booking);

        assertNotNull(saved.getId());
        assertNull(saved.getPhone());
        assertNull(saved.getPackageType());
        assertNull(saved.getPreferredDate());
        assertNull(saved.getNotes());
    }
}
