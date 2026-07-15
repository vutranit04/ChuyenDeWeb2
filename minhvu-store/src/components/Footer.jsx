import React from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <h3>MinhVu Store</h3>
            <p>
              Cửa hàng trực tuyến hàng đầu với các sản phẩm chất lượng cao,
              giá cả hợp lý. Cam kết mang đến trải nghiệm mua sắm tuyệt vời nhất cho khách hàng.
            </p>
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                <FiMapPin /> TP. Hồ Chí Minh, Việt Nam
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                <FiPhone /> 0386 245 250
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                <FiMail /> contact@minhvustore.com
              </span>
            </div>
          </div>

          <div className="footer-col">
            <h4>Mua sắm</h4>
            <Link to="/products">Tất cả sản phẩm</Link>
            <Link to="/products">Khuyến mãi</Link>
            <Link to="/products">Sản phẩm mới</Link>
            <Link to="/products">Bán chạy</Link>
          </div>

          <div className="footer-col">
            <h4>Hỗ trợ</h4>
            <Link to="/posts">Hướng dẫn mua hàng</Link>
            <Link to="/posts">Chính sách đổi trả</Link>
            <Link to="/posts">Chính sách bảo hành</Link>
            <Link to="/posts">Câu hỏi thường gặp</Link>
          </div>

          <div className="footer-col">
            <h4>Tài khoản</h4>
            <Link to="/login">Đăng nhập</Link>
            <Link to="/register">Đăng ký</Link>
            <Link to="/profile">Tài khoản của tôi</Link>
            <Link to="/orders">Đơn hàng của tôi</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} MinhVu Store. Thiết kế bởi Trần Minh Vũ.</p>
        </div>
      </div>
    </footer>
  );
}
