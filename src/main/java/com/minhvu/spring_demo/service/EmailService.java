package com.minhvu.spring_demo.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.List;

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

    public void sendOrderConfirmation(com.minhvu.spring_demo.entity.Order order, List<com.minhvu.spring_demo.entity.OrderDetail> details) {
        try {
            jakarta.mail.internet.MimeMessage mimeMessage = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = 
                new org.springframework.mail.javamail.MimeMessageHelper(mimeMessage, true, "UTF-8");
            
            if (order.getCustomer() == null || order.getCustomer().getEmail() == null) {
                return;
            }
            
            helper.setTo(order.getCustomer().getEmail());
            helper.setSubject("Xac nhan don hang #" + order.getOrderId() + " thanh cong - MinhVu Store");
            
            StringBuilder html = new StringBuilder();
            html.append("<html><body style='font-family: Arial, sans-serif; color: #333; line-height: 1.6;'>");
            html.append("<h2 style='color: #4f46e5;'>Cảm ơn bạn đã đặt hàng tại MinhVu Store!</h2>");
            html.append("<p>Đơn hàng của bạn đã được nhận và đang chờ duyệt.</p>");
            
            html.append("<h4 style='border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 24px; color: #1e293b;'>THÔNG TIN ĐƠN HÀNG</h4>");
            html.append("<table style='width: 100%; border-collapse: collapse; margin-bottom: 20px;'>");
            html.append("<tr><td style='width: 150px; padding: 6px 0; font-weight: bold;'>Mã đơn hàng:</td><td>#").append(order.getOrderId()).append("</td></tr>");
            if (order.getOrderDate() != null) {
                html.append("<tr><td style='padding: 6px 0; font-weight: bold;'>Ngày đặt hàng:</td><td>").append(order.getOrderDate().toString()).append("</td></tr>");
            }
            if (order.getShippingAddress() != null) {
                html.append("<tr><td style='padding: 6px 0; font-weight: bold;'>Người nhận:</td><td>").append(order.getShippingAddress().getContactName()).append("</td></tr>");
                html.append("<tr><td style='padding: 6px 0; font-weight: bold;'>Số điện thoại:</td><td>").append(order.getShippingAddress().getPhone()).append("</td></tr>");
                html.append("<tr><td style='padding: 6px 0; font-weight: bold;'>Địa chỉ giao hàng:</td><td>").append(order.getShippingAddress().getSpecificAddress()).append("</td></tr>");
            }
            if (order.getNote() != null && !order.getNote().isEmpty()) {
                html.append("<tr><td style='padding: 6px 0; font-weight: bold;'>Ghi chú:</td><td>").append(order.getNote()).append("</td></tr>");
            }
            html.append("</table>");
            
            html.append("<h4 style='border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 24px; color: #1e293b;'>DANH SÁCH SẢN PHẨM</h4>");
            html.append("<table style='width: 100%; border-collapse: collapse; margin-bottom: 20px;'>");
            html.append("<thead><tr style='background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;'>");
            html.append("<th style='text-align: left; padding: 10px; font-size: 0.9rem;'>Sản phẩm</th>");
            html.append("<th style='text-align: center; padding: 10px; font-size: 0.9rem;'>Số lượng</th>");
            html.append("<th style='text-align: right; padding: 10px; font-size: 0.9rem;'>Đơn giá</th>");
            html.append("<th style='text-align: right; padding: 10px; font-size: 0.9rem;'>Thành tiền</th>");
            html.append("</tr></thead><tbody>");
            
            java.text.NumberFormat nf = java.text.NumberFormat.getCurrencyInstance(new java.util.Locale("vi", "VN"));
            
            for (com.minhvu.spring_demo.entity.OrderDetail detail : details) {
                html.append("<tr style='border-bottom: 1px solid #f1f5f9;'>");
                html.append("<td style='padding: 12px 10px;'>").append(detail.getProduct().getProductName()).append("</td>");
                html.append("<td style='padding: 12px 10px; text-align: center;'>").append(detail.getQuantity()).append("</td>");
                html.append("<td style='padding: 12px 10px; text-align: right;'>").append(nf.format(detail.getProduct().getPrice())).append("</td>");
                html.append("<td style='padding: 12px 10px; text-align: right;'>").append(nf.format(detail.getTotalPrice())).append("</td>");
                html.append("</tr>");
            }
            
            html.append("</tbody></table>");
            
            html.append("<div style='text-align: right; margin-top: 20px; font-size: 1.15rem; font-weight: bold;'>");
            html.append("<span>Tổng tiền thanh toán: </span>");
            html.append("<span style='color: #4f46e5;'>").append(nf.format(order.getTotalAmount())).append("</span>");
            html.append("</div>");
            
            html.append("<p style='margin-top: 40px; font-size: 0.85rem; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 16px;'>");
            html.append("Email này được gửi tự động từ hệ thống của MinhVu Store. Vui lòng không trả lời trực tiếp email này.");
            html.append("</p></body></html>");
            
            helper.setText(html.toString(), true);
            mailSender.send(mimeMessage);
        } catch (Exception e) {
            System.err.println("Failed to send order confirmation email: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
