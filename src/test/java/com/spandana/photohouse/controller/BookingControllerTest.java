package com.spandana.photohouse.controller;

import com.spandana.photohouse.repository.BookingRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BookingController.class)
class BookingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BookingRepository bookingRepository;

    @Test
    void submitBooking_validPayload_returnsSuccess() throws Exception {
        String payload = """
                {
                    "name": "Jane Smith",
                    "email": "jane@example.com",
                    "phone": "9876543210",
                    "eventType": "wedding",
                    "package": "portrait",
                    "preferredDate": "2025-06-15",
                    "notes": "Outdoor venue"
                }
                """;

        mockMvc.perform(post("/api/booking")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(bookingRepository).save(any());
    }

    @Test
    void submitBooking_minimalPayload_returnsSuccess() throws Exception {
        String payload = """
                {
                    "name": "John",
                    "email": "john@test.com",
                    "eventType": "portrait"
                }
                """;

        mockMvc.perform(post("/api/booking")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void submitBooking_missingName_returnsBadRequest() throws Exception {
        String payload = """
                {
                    "email": "john@test.com",
                    "eventType": "portrait"
                }
                """;

        mockMvc.perform(post("/api/booking")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("Name, email, and event type are required"));
    }

    @Test
    void submitBooking_missingEmail_returnsBadRequest() throws Exception {
        String payload = """
                {
                    "name": "John",
                    "eventType": "portrait"
                }
                """;

        mockMvc.perform(post("/api/booking")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest());
    }

    @Test
    void submitBooking_missingEventType_returnsBadRequest() throws Exception {
        String payload = """
                {
                    "name": "John",
                    "email": "john@test.com"
                }
                """;

        mockMvc.perform(post("/api/booking")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest());
    }

    @Test
    void submitBooking_invalidDate_ignoresDateAndSucceeds() throws Exception {
        String payload = """
                {
                    "name": "John",
                    "email": "john@test.com",
                    "eventType": "portrait",
                    "preferredDate": "invalid-date"
                }
                """;

        mockMvc.perform(post("/api/booking")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
