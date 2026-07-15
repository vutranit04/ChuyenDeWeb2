import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiPlus, FiMinus, FiArrowRight, FiShoppingCart } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../api';

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-state" style={{ marginTop: '40px' }}>
            <div className="empty-state-icon"><FiShoppingCart /></div>
            <h3>Giỏ hàng trống</h3>
            <p>Bạn chưa có sản phẩm nào trong giỏ hàng</p>
            <Link to="/products" className="btn-primary">Tiếp tục mua sắm <FiArrowRight /></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h1 style={{ margin: 0 }}>Giỏ Hàng</h1>
          <button
            className="btn-outline"
            style={{ color: 'var(--accent-red)', borderColor: 'var(--accent-red)', padding: '10px 20px', fontSize: '0.9rem' }}
            onClick={clearCart}
            id="clear-all-cart-btn"
          >
            <FiTrash2 /> Xóa toàn bộ giỏ hàng
          </button>
        </div>

        <div className="cart-page-layout">
          {/* Cart Items */}
          <div className="cart-table">
            <div className="cart-table-header">
              <span>Sản phẩm</span>
              <span>Đơn giá</span>
              <span>Số lượng</span>
              <span>Thành tiền</span>
              <span></span>
            </div>
            {cartItems.map(item => {
              const imgUrl = getImageUrl(item.image);
              return (
                <div className="cart-table-row" key={item.productId}>
                  <div className="cart-table-product">
                    <img src={imgUrl} alt={item.productName} />
                    <span>{item.productName}</span>
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {formatPrice(item.price)}
                  </div>
                  <div>
                    <div className="quantity-control" style={{ display: 'inline-flex' }}>
                      <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}>
                        <FiMinus />
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}>
                        <FiPlus />
                      </button>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    {formatPrice(item.price * item.quantity)}
                  </div>
                  <div>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      style={{ color: 'var(--accent-red)', fontSize: '1.1rem', padding: '8px' }}
                      id={`remove-cart-item-${item.productId}`}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <h3>Tóm tắt đơn hàng</h3>
            <div className="cart-summary-row">
              <span>Tạm tính</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <div className="cart-summary-row">
              <span>Phí vận chuyển</span>
              <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>Miễn phí</span>
            </div>
            <div className="cart-summary-total">
              <span>Tổng cộng</span>
              <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {formatPrice(cartTotal)}
              </span>
            </div>
            <button
              className="btn-checkout"
              onClick={() => navigate('/checkout')}
              id="proceed-to-checkout"
            >
              Tiến hành thanh toán <FiArrowRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
