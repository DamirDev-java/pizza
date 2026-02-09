package com.example.pizza.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "order")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(name = "pizza_name", nullable = false)
    private String pizzaName;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "price")
    private Integer price;

    @Column(name = "amount")
    private Integer amount;
}