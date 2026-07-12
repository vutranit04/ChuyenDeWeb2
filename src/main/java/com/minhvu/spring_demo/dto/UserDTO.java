package com.minhvu.spring_demo.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private Long userId;
    private String username;
    private String fullName;
    private String email;
    private String role;
    private LocalDateTime createdAt;

    // For creating/updating users (Admin)
    private String password;
}
