package com.minhvu.spring_demo.service;

import com.minhvu.spring_demo.entity.Customer;
import com.minhvu.spring_demo.exception.ResourceNotFoundException;
import com.minhvu.spring_demo.repository.CustomerRepository;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    public CustomerService(CustomerRepository customerRepository, PasswordEncoder passwordEncoder) {
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Customer getCustomerById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng với ID: " + id));
    }

    public Customer createCustomer(Customer customer) {
        if (customer.getEmail() != null && customerRepository.existsByEmail(customer.getEmail())) {
            throw new IllegalArgumentException("Email đã được sử dụng bởi một tài khoản khác!");
        }
        if (customer.getCustomerId() != null) {
            if (customer.getCustomerId() <= 0) {
                customer.setCustomerId(null);
            } else if (customerRepository.existsById(customer.getCustomerId())) {
                throw new IllegalArgumentException("Mã khách hàng (ID: " + customer.getCustomerId() + ") đã tồn tại!");
            }
        }
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
