package com.example.pizza.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemDTO {

    private Integer id;
    private String pizzaName;
    private Integer quantity;
    private Integer price;
    private Integer amount;
}