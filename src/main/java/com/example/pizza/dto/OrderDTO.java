package com.example.pizza.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class OrderDTO {
    private Integer id;

    private Integer userId;

    private LocalDateTime date;

    private List<OrderItemDTO> orderItems;

}
