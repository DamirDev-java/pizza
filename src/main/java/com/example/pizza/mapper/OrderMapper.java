package com.example.pizza.mapper;

import com.example.pizza.dto.OrderDTO;
import com.example.pizza.dto.OrderItemDTO;
import com.example.pizza.entity.Order;
import com.example.pizza.entity.OrderItem;
import com.example.pizza.entity.User;

import java.util.List;
import java.util.stream.Collectors;

public class OrderMapper {

    public static OrderDTO toDTO(Order order) {
        return OrderDTO.builder()
                .id(order.getId())
                .userId(order.getUser().getId())
                .date(order.getDate())
                .orderItems(order.getOrderItems()
                        .stream()
                        .map(OrderMapper::toDTO)
                        .collect(Collectors.toList()))
                .build();
    }

    public static OrderItemDTO toDTO(OrderItem item) {
        return OrderItemDTO.builder()
                .id(item.getId())
                .pizzaName(item.getPizzaName())
                .quantity(item.getQuantity())
                .price(item.getPrice())
                .amount(item.getAmount())
                .build();
    }

    public static OrderItem toEntity(OrderItemDTO dto, Order order) {
        return OrderItem.builder()
                .id(dto.getId())
                .order(order)
                .pizzaName(dto.getPizzaName())
                .quantity(dto.getQuantity())
                .price(dto.getPrice())
                .amount(dto.getAmount())
                .build();
    }

    public static Order toEntity(OrderDTO dto, User user) {

        Order order = Order.builder()
                .id(dto.getId())
                .user(user)
                .date(dto.getDate())
                .build();

        List<OrderItem> items = dto.getOrderItems()
                .stream()
                .map(item -> toEntity(item, order))
                .collect(Collectors.toList());

        order.setOrderItems(items);

        return order;
    }
}