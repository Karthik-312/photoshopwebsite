package com.spandana.photohouse.controller;

import com.spandana.photohouse.repository.ContactSubmissionRepository;
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

@WebMvcTest(ContactController.class)
class ContactControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ContactSubmissionRepository contactRepository;

    @Test
    void submitContact_validPayload_returnsSuccess() throws Exception {
        String payload = """
                {
                    "name": "John Doe",
                    "email": "john@example.com",
                    "phone": "1234567890",
                    "message": "I would like to book a session."
                }
                """;

        mockMvc.perform(post("/api/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(contactRepository).save(any());
    }

    @Test
    void submitContact_missingName_returnsBadRequest() throws Exception {
        String payload = """
                {
                    "email": "john@example.com",
                    "message": "Hello"
                }
                """;

        mockMvc.perform(post("/api/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("Name, email, and message are required"));
    }

    @Test
    void submitContact_missingEmail_returnsBadRequest() throws Exception {
        String payload = """
                {
                    "name": "John",
                    "message": "Hello"
                }
                """;

        mockMvc.perform(post("/api/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest());
    }

    @Test
    void submitContact_missingMessage_returnsBadRequest() throws Exception {
        String payload = """
                {
                    "name": "John",
                    "email": "john@example.com"
                }
                """;

        mockMvc.perform(post("/api/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest());
    }

    @Test
    void submitContact_blankName_returnsBadRequest() throws Exception {
        String payload = """
                {
                    "name": "   ",
                    "email": "john@example.com",
                    "message": "Hello"
                }
                """;

        mockMvc.perform(post("/api/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest());
    }

    @Test
    void submitContact_emptyPhone_usesDefault() throws Exception {
        String payload = """
                {
                    "name": "John",
                    "email": "john@example.com",
                    "message": "Hello"
                }
                """;

        mockMvc.perform(post("/api/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
