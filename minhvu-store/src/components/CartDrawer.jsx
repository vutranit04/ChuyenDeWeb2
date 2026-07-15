import React from 'react';
import { FiShoppingCart, FiX, FiPlus, FiMinus, FiTrash2, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../api';

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

export default function CartDrawer() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount, isCartOpen, setIsCartOpen } = useCart();

  return (
    <>
      <div
        className={`cart-drawer-overlay ${isCartOpen ? 'open' : ''}`}
        onClick={() => setIsCartOpen(false)}
      />
      <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-drawer-header">
          <h3><FiShoppingCart /> Giỏ hàng ({cartCount})</h3>
          {cartItems.length > 0 && (
            <button onClick={clearCart} style={{ fontSize: '0.8rem', color: 'var(--accent-red)', fontWeight: 600 }} id="drawer-clear-all-btn">
              Xóa tất cả
            </button>
          )}
          <button className="cart-drawer-close" onClick={() => setIsCartOpen(false)} id="close-cart-drawer">
            <FiX />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon"><FiShoppingCart /></div>
            <h3>Giỏ hàng trống</h3>
            <p>Bạn chưa có sản phẩm nào trong giỏ</p>
            <Link to="/products" className="btn-primary" onClick={() => setIsCartOpen(false)}>
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-drawer-items">
              {cartItems.map(item => {
                const imgUrl = getImageUrl(item.image);
                return (
                  <div className="cart-item" key={item.productId}>
                    <div className="cart-item-image">
                      <img src={imgUrl} alt={item.productName} />
                    </div>
                    <div className="cart-item-info">
                      <span className="cart-item-name">{item.productName}</span>
                      <span className="cart-item-price">{formatPrice(item.price)}</span>
                      <div className="cart-item-controls">
                        <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}>
                          <FiMinus />
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}>
                          <FiPlus />
                        </button>
                        <button className="cart-item-remove" onClick={() => removeFromCart(item.productId)}>
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="cart-drawer-footer">
              <div className="cart-total">
                <span>Tổng cộng:</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <Link
                to="/cart"
                className="cart-checkout-btn"
                onClick={() => setIsCartOpen(false)}
                id="go-to-cart-page"
              >
                Xem giỏ hàng <FiArrowRight />
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
