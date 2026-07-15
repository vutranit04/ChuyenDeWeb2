import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPackage, FiCalendar, FiDollarSign } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { getOrders, updateOrderStatus } from '../api';
import toast from 'react-hot-toast';

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

function getStatusClass(status) {
  if (!status) return '';
  if (status.includes('Chờ') || status.includes('chờ')) return 'pending';
  if (status.includes('giao') && !status.includes('Đã giao')) return 'shipping';
  if (status.includes('Đã giao')) return 'delivered';
  if (status.includes('hủy') || status.includes('Hủy')) return 'cancelled';
  return 'pending';
}

export default function OrderHistoryPage() {
  const { customer, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) {
      try {
        await updateOrderStatus(orderId, 'Đã hủy');
        toast.success('Hủy đơn hàng thành công!');
        setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status: 'Đã hủy' } : o));
      } catch (err) {
        toast.error('Hủy đơn hàng thất bại. Vui lòng thử lại sau.');
      }
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    getOrders()
      .then(res => {
        const allOrders = res.data.content || res.data || [];
        // Filter orders belonging to current customer
        const myOrders = allOrders.filter(o => o.customerId === customer.customerId);
        setOrders(myOrders);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAuthenticated, customer, navigate]);

  if (loading) return <div className="orders-page container"><LoadingSpinner /></div>;

  return (
    <div className="orders-page">
      <div className="container">
        <h1>Đơn Hàng Của Tôi</h1>

        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><FiPackage /></div>
            <h3>Chưa có đơn hàng nào</h3>
            <p>Bắt đầu mua sắm để xem đơn hàng tại đây</p>
            <button className="btn-primary" onClick={() => navigate('/products')}>
              Mua sắm ngay
            </button>
          </div>
        ) : (
          orders.map(order => (
            <div className="order-card fade-in-up" key={order.orderId} id={`order-${order.orderId}`}>
              <div className="order-card-header">
                <div>
                  <span className="order-card-id">Đơn hàng #{order.orderId}</span>
                  <span className="order-card-date" style={{ marginLeft: '16px' }}>
                    <FiCalendar style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                    {new Date(order.orderDate).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <span className={`order-status ${getStatusClass(order.status)}`}>
                  {order.status}
                </span>
              </div>

              {order.orderDetails && order.orderDetails.length > 0 && (
                <div className="order-card-body">
                  {order.orderDetails.map((detail, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: idx < order.orderDetails.length - 1 ? '1px solid var(--bg-tertiary)' : 'none', fontSize: '0.9rem' }}>
                      <span>{detail.productName || `Sản phẩm #${detail.productId}`} <span style={{ color: 'var(--text-muted)' }}>x{detail.quantity}</span></span>
                      <span style={{ fontWeight: 600 }}>{formatPrice(detail.totalPrice)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="order-card-total">
                <div>
                  {order.status === 'Chờ duyệt' && (
                    <button
                      className="btn-cancel-order"
                      onClick={() => handleCancelOrder(order.orderId)}
                      id={`cancel-order-btn-${order.orderId}`}
                    >
                      Hủy đơn hàng
                    </button>
                  )}
                </div>
                <span>
                  <FiDollarSign style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  Tổng: <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {formatPrice(order.totalAmount)}
                  </span>
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
