package com.minhvu.spring_demo.service;

import com.minhvu.spring_demo.entity.Customer;
import com.minhvu.spring_demo.entity.ShippingAddress;
import com.minhvu.spring_demo.exception.ResourceNotFoundException;
import com.minhvu.spring_demo.repository.CustomerRepository;
import com.minhvu.spring_demo.repository.ShippingAddressRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ShippingAddressService {

    private final ShippingAddressRepository addressRepository;
    private final CustomerRepository customerRepository;

    public ShippingAddressService(ShippingAddressRepository addressRepository,
                                  CustomerRepository customerRepository) {
        this.addressRepository = addressRepository;
        this.customerRepository = customerRepository;
    }

    public List<ShippingAddress> getAddressesByCustomer(Long customerId) {
        if (!customerRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Không tìm thấy khách hàng với ID: " + customerId);
        }
        return addressRepository.findByCustomerCustomerId(customerId);
    }

    @Transactional
    public ShippingAddress createAddress(Long customerId, ShippingAddress address) {
        if (address.getAddressId() != null) {
            if (address.getAddressId() <= 0) {
                address.setAddressId(null);
            } else if (addressRepository.existsById(address.getAddressId())) {
                throw new IllegalArgumentException("Mã địa chỉ giao hàng (ID: " + address.getAddressId() + ") đã tồn tại!");
            }
        }
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng với ID: " + customerId));
        address.setCustomer(customer);

        // If this is set as default, unset other defaults
        if (Boolean.TRUE.equals(address.getIsDefault())) {
            unsetDefaultAddresses(customerId);
        }

        return addressRepository.save(address);
    }

    @Transactional
    public ShippingAddress updateAddress(Long addressId, ShippingAddress addressDetails) {
        ShippingAddress address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy địa chỉ với ID: " + addressId));

        if (addressDetails.getContactName() != null) address.setContactName(addressDetails.getContactName());
        if (addressDetails.getPhone() != null) address.setPhone(addressDetails.getPhone());
        if (addressDetails.getSpecificAddress() != null) address.setSpecificAddress(addressDetails.getSpecificAddress());

        if (Boolean.TRUE.equals(addressDetails.getIsDefault())) {
            unsetDefaultAddresses(address.getCustomer().getCustomerId());
            address.setIsDefault(true);
        }

        return addressRepository.save(address);
    }

    public void deleteAddress(Long addressId) {
        if (!addressRepository.existsById(addressId)) {
            throw new ResourceNotFoundException("Không tìm thấy địa chỉ với ID: " + addressId);
        }
        addressRepository.deleteById(addressId);
    }

    private void unsetDefaultAddresses(Long customerId) {
        List<ShippingAddress> addresses = addressRepository.findByCustomerCustomerId(customerId);
        for (ShippingAddress addr : addresses) {
            if (Boolean.TRUE.equals(addr.getIsDefault())) {
                addr.setIsDefault(false);
                addressRepository.save(addr);
            }
        }
    }
}
