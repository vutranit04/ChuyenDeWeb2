package com.minhvu.spring_demo.service;

import com.minhvu.spring_demo.entity.Customer;
import com.minhvu.spring_demo.exception.ResourceNotFoundException;
import com.minhvu.spring_demo.repository.CustomerRepository;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public CustomerService(CustomerRepository customerRepository, PasswordEncoder passwordEncoder, EmailService emailService) {
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
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

    private String generateRandomPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        java.security.SecureRandom random = new java.security.SecureRandom();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 8; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    public void resetPassword(String email) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Email không tồn tại trong hệ thống!"));
        
        String tempPassword = generateRandomPassword();
        customer.setPassword(passwordEncoder.encode(tempPassword));
        customerRepository.save(customer);
        
        emailService.sendTemporaryPassword(email, tempPassword);
    }

    public void deleteCustomer(Long id) {
        if (!customerRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy khách hàng với ID: " + id);
        }
        customerRepository.deleteById(id);
    }
}
