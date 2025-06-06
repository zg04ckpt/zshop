﻿using Core.DTOs.User;
using Core.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Core.DTOs.Order
{
    public class OrderHistoryDetailDTO
    {
        public string Id { get; set; }  
        public string UserId { get; set; }
        public DateTime OrderDate { get; set; }
        public DateTime UpdatedAt { get; set; }
        public decimal TotalAmount { get; set; }
        public string Currency { get; set; }

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public OrderStatus OrderStatus { get; set; }

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public PayStatus PaymentStatus { get; set; }
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public PaymentMethod PaymentMethod { get; set; }
        public OrderItemDTO[] Items { get; set; }
        public AddressItemDTO? Address { get; set; }
    }
}
