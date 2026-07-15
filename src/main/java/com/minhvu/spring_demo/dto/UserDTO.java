package com.minhvu.spring_demo.dto;

import lombok.*;
import java.time.LocalDateTime;

import io.swagger.v3.oas.annotations.media.Schema;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    @Schema(accessMode = Schema.AccessMode.READ_ONLY)
    private Long userId;
    private String username;
    private String fullName;
    private String email;
    private String role;
    private LocalDateTime createdAt;

    // For creating/updating users (Admin)
    private String password;
}
