package com.example.pizza.dto;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class UserDto {

    private Integer id;

    private String email;

    private String password;

    private String name;

    private String surname;
}

