import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMapPin, FiPlus, FiEdit2, FiTrash2, FiLogOut, FiPackage } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getAddresses, createAddress, deleteAddress as deleteAddr } from '../api';

export default function ProfilePage() {
  const { customer, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({ contactName: '', phone: '', specificAddress: '' });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadAddresses();
  }, [isAuthenticated, navigate]);

  const loadAddresses = () => {
    if (customer?.customerId) {
      getAddresses(customer.customerId)
        .then(res => setAddresses(res.data))
        .catch(() => {});
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!addressForm.contactName || !addressForm.phone || !addressForm.specificAddress) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    try {
      await createAddress(customer.customerId, addressForm);
      toast.success('Thêm địa chỉ thành công');
      setAddressForm({ contactName: '', phone: '', specificAddress: '' });
      setShowAddressForm(false);
      loadAddresses();
    } catch {
      toast.error('Thêm địa chỉ thất bại');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Bạn có chắc muốn xóa địa chỉ này?')) return;
    try {
      await deleteAddr(addressId);
      toast.success('Đã xóa địa chỉ');
      loadAddresses();
    } catch {
      toast.error('Xóa địa chỉ thất bại');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Đã đăng xuất');
    navigate('/');
  };

  if (!customer) return null;

  return (
    <div className="profile-page">
      <div className="container">
        <h1>Tài Khoản Của Tôi</h1>

        <div className="profile-grid">
          {/* Customer Info */}
          <div className="profile-card">
            <h2><FiUser /> Thông tin cá nhân</h2>
            <div className="profile-info-row">
              <span>Họ tên</span>
              <span>{customer.fullName}</span>
            </div>
            <div className="profile-info-row">
              <span>Email</span>
              <span>{customer.email}</span>
            </div>
            <div className="profile-info-row">
              <span>Điện thoại</span>
              <span>{customer.phone}</span>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
              <button className="btn-primary" onClick={() => navigate('/orders')} style={{ fontSize: '0.88rem', padding: '10px 20px' }}>
                <FiPackage /> Đơn hàng
              </button>
              <button className="btn-outline" onClick={handleLogout} style={{ fontSize: '0.88rem', padding: '10px 20px', color: 'var(--accent-red)', borderColor: 'var(--accent-red)' }}>
                <FiLogOut /> Đăng xuất
              </button>
            </div>
          </div>

          {/* Addresses */}
          <div className="profile-card">
            <h2 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiMapPin /> Địa chỉ giao hàng</span>
              <button
                className="btn-primary"
                style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                onClick={() => setShowAddressForm(!showAddressForm)}
                id="add-address-btn"
              >
                <FiPlus /> Thêm
              </button>
            </h2>

            {showAddressForm && (
              <form onSubmit={handleAddAddress} style={{ marginBottom: '20px', padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <input
                    type="text"
                    placeholder="Tên người nhận"
                    value={addressForm.contactName}
                    onChange={e => setAddressForm({ ...addressForm, contactName: e.target.value })}
                    style={{ background: '#fff' }}
                    id="address-contact-name"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <input
                    type="tel"
                    placeholder="Số điện thoại"
                    value={addressForm.phone}
                    onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })}
                    style={{ background: '#fff' }}
                    id="address-phone"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <input
                    type="text"
                    placeholder="Địa chỉ cụ thể"
                    value={addressForm.specificAddress}
                    onChange={e => setAddressForm({ ...addressForm, specificAddress: e.target.value })}
                    style={{ background: '#fff' }}
                    id="address-specific"
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.88rem' }}>
                  Lưu địa chỉ
                </button>
              </form>
            )}

            {addresses.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>Chưa có địa chỉ nào</p>
            ) : (
              addresses.map(addr => (
                <div className="address-card" key={addr.addressId}>
                  <div className="address-card-info">
                    <h4>{addr.contactName} — {addr.phone}</h4>
                    <p>{addr.specificAddress}</p>
                    {addr.isDefault && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: 600 }}>Mặc định</span>
                    )}
                  </div>
                  <div className="address-card-actions">
                    <button
                      onClick={() => handleDeleteAddress(addr.addressId)}
                      style={{ color: 'var(--accent-red)' }}
                      id={`delete-address-${addr.addressId}`}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
