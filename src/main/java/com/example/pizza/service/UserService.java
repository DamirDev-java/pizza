package com.example.pizza.service;

import com.example.pizza.dto.UserDto;
import com.example.pizza.entity.User;
import com.example.pizza.mapper.UserMapper;
import com.example.pizza.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public UserService(UserRepository userRepository, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
    }

    public User save(UserDto userDto) {
        return userRepository.save(userMapper.toEntity(userDto));
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
