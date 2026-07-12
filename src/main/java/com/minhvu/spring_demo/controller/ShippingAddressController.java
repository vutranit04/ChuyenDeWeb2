package com.minhvu.spring_demo.controller;

import com.minhvu.spring_demo.entity.ShippingAddress;
import com.minhvu.spring_demo.service.ShippingAddressService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class ShippingAddressController {

    private final ShippingAddressService addressService;

    public ShippingAddressController(ShippingAddressService addressService) {
        this.addressService = addressService;
    }

    @GetMapping("/api/customers/{customerId}/addresses")
    public ResponseEntity<List<ShippingAddress>> getAddresses(@PathVariable Long customerId) {
        return ResponseEntity.ok(addressService.getAddressesByCustomer(customerId));
    }

    @PostMapping("/api/customers/{customerId}/addresses")
    public ResponseEntity<ShippingAddress> createAddress(
            @PathVariable Long customerId,
            @RequestBody ShippingAddress address) {
        return ResponseEntity.ok(addressService.createAddress(customerId, address));
    }

    @PutMapping("/api/addresses/{addressId}")
    public ResponseEntity<ShippingAddress> updateAddress(
            @PathVariable Long addressId,
            @RequestBody ShippingAddress address) {
        return ResponseEntity.ok(addressService.updateAddress(addressId, address));
    }

    @DeleteMapping("/api/addresses/{addressId}")
    public ResponseEntity<Map<String, String>> deleteAddress(@PathVariable Long addressId) {
        addressService.deleteAddress(addressId);
        return ResponseEntity.ok(Map.of("message", "Xóa địa chỉ thành công"));
    }
}
