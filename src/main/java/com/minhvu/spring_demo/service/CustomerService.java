package com.minhvu.spring_demo.service;

import com.minhvu.spring_demo.entity.Customer;
import com.minhvu.spring_demo.exception.ResourceNotFoundException;
import com.minhvu.spring_demo.repository.CustomerRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    public CustomerService(CustomerRepository customerRepository, PasswordEncoder passwordEncoder) {
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Page<Customer> getAllCustomers(String search, Pageable pageable) {
        if (search != null && !search.isEmpty()) {
            // Try searching by name first, then by phone
            Page<Customer> result = customerRepository.findByFullNameContainingIgnoreCase(search, pageable);
            if (result.isEmpty()) {
                result = customerRepository.findByPhoneContaining(search, pageable);
            }
            return result;
        }
        return customerRepository.findAll(pageable);
    }

    public Customer getCustomerById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng với ID: " + id));
    }

    public Customer createCustomer(Customer customer) {
        if (customer.getPassword() != null) {
            customer.setPassword(passwordEncoder.encode(customer.getPassword()));
        } else {
            customer.setPassword(passwordEncoder.encode("123456")); // Default password
        }
        return customerRepository.save(customer);
    }

    public Customer updateCustomer(Long id, Customer customerDetails) {
        Customer customer = getCustomerById(id);
        if (customerDetails.getFullName() != null) customer.setFullName(customerDetails.getFullName());
        if (customerDetails.getPhone() != null) customer.setPhone(customerDetails.getPhone());
        if (customerDetails.getEmail() != null) customer.setEmail(customerDetails.getEmail());
        if (customerDetails.getPassword() != null && !customerDetails.getPassword().isEmpty()) {
            customer.setPassword(passwordEncoder.encode(customerDetails.getPassword()));
        }
        return customerRepository.save(customer);
    }

    public void deleteCustomer(Long id) {
        if (!customerRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy khách hàng với ID: " + id);
        }
        customerRepository.deleteById(id);
    }
}
