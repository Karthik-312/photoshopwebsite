package com.spandana.photohouse.model;

import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

class BookingTest {

    @Test
    void defaultConstructor_createsEmptyBooking() {
        Booking booking = new Booking();
        assertNull(booking.getId());
        assertNull(booking.getName());
        assertNull(booking.getEmail());
        assertNull(booking.getPhone());
        assertNull(booking.getEventType());
        assertNull(booking.getPackageType());
        assertNull(booking.getPreferredDate());
        assertNull(booking.getNotes());
        assertNotNull(booking.getCreatedAt());
    }

    @Test
    void parameterizedConstructor_setsAllFields() {
        LocalDate date = LocalDate.of(2025, 6, 15);
        Booking booking = new Booking("Client", "client@test.com", "9876543210", "wedding", "portrait", date, "Outdoor venue");

        assertNull(booking.getId());
        assertEquals("Client", booking.getName());
        assertEquals("client@test.com", booking.getEmail());
        assertEquals("9876543210", booking.getPhone());
        assertEquals("wedding", booking.getEventType());
        assertEquals("portrait", booking.getPackageType());
        assertEquals(date, booking.getPreferredDate());
        assertEquals("Outdoor venue", booking.getNotes());
        assertNotNull(booking.getCreatedAt());
    }

    @Test
    void parameterizedConstructor_acceptsNullOptionalFields() {
        Booking booking = new Booking("Name", "email@test.com", null, "event", null, null, null);
        assertNull(booking.getPhone());
        assertNull(booking.getPackageType());
        assertNull(booking.getPreferredDate());
        assertNull(booking.getNotes());
    }

    @Test
    void settersAndGetters_workCorrectly() {
        Booking booking = new Booking();
        LocalDate date = LocalDate.of(2025, 3, 1);
        Instant now = Instant.now();

        booking.setId(5L);
        booking.setName("Test Client");
        booking.setEmail("test@test.com");
        booking.setPhone("111-222-3333");
        booking.setEventType("portrait");
        booking.setPackageType("essential");
        booking.setPreferredDate(date);
        booking.setNotes("Notes here");
        booking.setCreatedAt(now);

        assertEquals(5L, booking.getId());
        assertEquals("Test Client", booking.getName());
        assertEquals("test@test.com", booking.getEmail());
        assertEquals("111-222-3333", booking.getPhone());
        assertEquals("portrait", booking.getEventType());
        assertEquals("essential", booking.getPackageType());
        assertEquals(date, booking.getPreferredDate());
        assertEquals("Notes here", booking.getNotes());
        assertEquals(now, booking.getCreatedAt());
    }
}
