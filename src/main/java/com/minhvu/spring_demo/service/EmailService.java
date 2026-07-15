package com.minhvu.spring_demo.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendTemporaryPassword(String toEmail, String temporaryPassword) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Dat lai mat khau - MinhVu Store");
        message.setText("Chao ban,\n\n"
                + "Chung toi nhan duoc yeu cau khoi phuc mat khau cua ban.\n"
                + "Mat khau tam thoi moi cua ban la: " + temporaryPassword + "\n\n"
                + "Vui long su dung mat khau nay de dang nhap va thay doi mat khau moi trong phan trang ca nhan.\n\n"
                + "Tran trong,\n"
                + "MinhVu Store Support Team");
        mailSender.send(message);
    }
}
