package com.example.pizza.mapper;

import com.example.pizza.dto.UserDto;
import com.example.pizza.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public User toEntity(UserDto dto) {
        return User.builder()
                .name(dto.getName())
                .surname(dto.getSurname())
                .email(dto.getEmail())
                .password(dto.getPassword())
                .build();
    }

    UserDto toDto(User entity) {
        return UserDto.builder()
                .name(entity.getName())
                .surname(entity.getSurname())
                .id(entity.getId())
                .password(entity.getPassword())
                .email(entity.getEmail())
                .build();
    }

}
