package com.example.pizza.service;

import com.example.pizza.dto.OrderDTO;
import com.example.pizza.entity.Order;
import com.example.pizza.entity.User;
import com.example.pizza.mapper.OrderMapper;
import com.example.pizza.repository.OrderRepository;
import com.example.pizza.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService  {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;


    public OrderDTO createOrder(OrderDTO orderDTO) {

        User user = userRepository.findById(orderDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = OrderMapper.toEntity(orderDTO, user);
        order.setDate(LocalDateTime.now());
        return OrderMapper.toDTO(orderRepository.save(order));
    }

    public OrderDTO getOrderById(Integer id) {
        return orderRepository.findById(id)
                .map(OrderMapper::toDTO)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    public List<OrderDTO> getOrdersByUser(Integer userId) {
        return orderRepository.findByUserId(userId)
                .stream()
                .map(OrderMapper::toDTO)
                .collect(Collectors.toList());
    }

    public void deleteOrder(Integer id) {
        orderRepository.deleteById(id);
    }
}