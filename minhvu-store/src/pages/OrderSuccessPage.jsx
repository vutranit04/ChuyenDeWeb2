import React from 'react';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiPackage, FiHome } from 'react-icons/fi';

export default function OrderSuccessPage() {
  return (
    <div className="order-success">
      <div className="container">
        <div className="order-success-icon">
          <FiCheckCircle />
        </div>
        <h1>Đặt Hàng Thành Công! 🎉</h1>
        <p>
          Cảm ơn bạn đã đặt hàng tại MinhVu Store. Đơn hàng của bạn đang được xử lý
          và sẽ được giao trong thời gian sớm nhất.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/orders" className="btn-primary">
            <FiPackage /> Xem đơn hàng
          </Link>
          <Link to="/" className="btn-outline">
            <FiHome /> Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
