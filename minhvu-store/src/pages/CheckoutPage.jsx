import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSend, FiShoppingCart } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder, getAddresses, createAddress } from '../api';

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { customer, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [isNewAddress, setIsNewAddress] = useState(true);
  const [form, setForm] = useState({ contactName: '', phone: '', specificAddress: '' });
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thanh toán');
      navigate('/login');
      return;
    }
    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }
    // Load addresses
    getAddresses(customer.customerId)
      .then(res => {
        setAddresses(res.data);
        if (res.data.length > 0) {
          setIsNewAddress(false);
          const def = res.data.find(a => a.isDefault) || res.data[0];
          setSelectedAddressId(def.addressId);
        }
      })
      .catch(() => {});
  }, [isAuthenticated, customer, cartItems.length, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let addressId = selectedAddressId;

      // Create new address if needed
      if (isNewAddress) {
        if (!form.contactName || !form.phone || !form.specificAddress) {
          toast.error('Vui lòng điền đầy đủ thông tin giao hàng');
          setSubmitting(false);
          return;
        }
        const addrRes = await createAddress(customer.customerId, form);
        addressId = addrRes.data.addressId;
      }

      if (!addressId) {
        toast.error('Vui lòng chọn hoặc nhập địa chỉ giao hàng');
        setSubmitting(false);
        return;
      }

      const orderRequest = {
        customerId: customer.customerId,
        addressId: addressId,
        note: note,
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          description: '',
        })),
      };

      await createOrder(orderRequest);
      clearCart();
      toast.success('Đặt hàng thành công!');
      navigate('/order-success');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đặt hàng thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="container">
        <h1>Thanh Toán</h1>

        <form className="checkout-layout" onSubmit={handleSubmit}>
          {/* Shipping Info */}
          <div className="checkout-form">
            <h2>Thông tin giao hàng</h2>

            {addresses.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                  <button
                    type="button"
                    className={!isNewAddress ? 'btn-primary' : 'btn-outline'}
                    style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                    onClick={() => setIsNewAddress(false)}
                  >
                    Địa chỉ đã lưu
                  </button>
                  <button
                    type="button"
                    className={isNewAddress ? 'btn-primary' : 'btn-outline'}
                    style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                    onClick={() => setIsNewAddress(true)}
                  >
                    Địa chỉ mới
                  </button>
                </div>

                {!isNewAddress && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {addresses.map(addr => (
                      <label
                        key={addr.addressId}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          padding: '14px',
                          background: selectedAddressId === addr.addressId ? 'rgba(102,126,234,0.08)' : 'var(--bg-tertiary)',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          border: selectedAddressId === addr.addressId ? '2px solid var(--primary)' : '2px solid transparent',
                          transition: 'var(--transition-base)',
                        }}
                      >
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressId === addr.addressId}
                          onChange={() => setSelectedAddressId(addr.addressId)}
                          style={{ marginTop: '3px' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600 }}>{addr.contactName} — {addr.phone}</div>
                          <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{addr.specificAddress}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {isNewAddress && (
              <>
                <div className="form-group">
                  <label>Họ tên người nhận *</label>
                  <input
                    type="text"
                    value={form.contactName}
                    onChange={e => setForm({ ...form, contactName: e.target.value })}
                    placeholder="Nhập họ tên"
                    id="checkout-contact-name"
                  />
                </div>
                <div className="form-group">
                  <label>Số điện thoại *</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="Nhập số điện thoại"
                    id="checkout-phone"
                  />
                </div>
                <div className="form-group">
                  <label>Địa chỉ cụ thể *</label>
                  <textarea
                    value={form.specificAddress}
                    onChange={e => setForm({ ...form, specificAddress: e.target.value })}
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành"
                    id="checkout-address"
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label>Ghi chú đơn hàng</label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Ghi chú thêm cho đơn hàng (không bắt buộc)"
                id="checkout-note"
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="checkout-order-summary">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>Đơn hàng của bạn</h3>
            {cartItems.map(item => (
              <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--bg-tertiary)', fontSize: '0.9rem' }}>
                <span style={{ flex: 1 }}>
                  {item.productName} <span style={{ color: 'var(--text-muted)' }}>x{item.quantity}</span>
                </span>
                <span style={{ fontWeight: 600 }}>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="cart-summary-row" style={{ marginTop: '16px' }}>
              <span>Tạm tính</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <div className="cart-summary-row">
              <span>Vận chuyển</span>
              <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>Miễn phí</span>
            </div>
            <div className="cart-summary-total">
              <span>Tổng cộng</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <button
              type="submit"
              className="btn-checkout"
              disabled={submitting}
              id="place-order-btn"
            >
              {submitting ? 'Đang xử lý...' : <><FiSend /> Đặt hàng</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
