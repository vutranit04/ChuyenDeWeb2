import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUserPlus, FiUser, FiMail, FiLock, FiPhone } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { createCustomer } from '../api';

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!form.fullName || !form.email || !form.phone || !form.password) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (form.password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    try {
      const res = await createCustomer({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });

      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || 'Đăng ký thất bại. Email có thể đã được sử dụng.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-header">
          <h1>Đăng Ký</h1>
          <p>Tạo tài khoản để mua sắm tại MinhVu Store</p>
        </div>

        <div onKeyDown={handleKeyDown}>
          <div className="form-group">
            <label><FiUser style={{ marginRight: '6px', verticalAlign: 'middle' }} />Họ và tên</label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Nhập họ và tên"
              id="register-fullname"
            />
          </div>
          <div className="form-group">
            <label><FiMail style={{ marginRight: '6px', verticalAlign: 'middle' }} />Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Nhập email"
              id="register-email"
            />
          </div>
          <div className="form-group">
            <label><FiPhone style={{ marginRight: '6px', verticalAlign: 'middle' }} />Số điện thoại</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Nhập số điện thoại"
              id="register-phone"
            />
          </div>
          <div className="form-group">
            <label><FiLock style={{ marginRight: '6px', verticalAlign: 'middle' }} />Mật khẩu</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Ít nhất 6 ký tự"
              id="register-password"
            />
          </div>
          <div className="form-group">
            <label><FiLock style={{ marginRight: '6px', verticalAlign: 'middle' }} />Xác nhận mật khẩu</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Nhập lại mật khẩu"
              id="register-confirm-password"
            />
          </div>
          <button
            type="button"
            className="btn-auth"
            onClick={handleSubmit}
            disabled={loading}
            id="register-submit"
          >
            {loading ? 'Đang xử lý...' : <><FiUserPlus /> Đăng ký</>}
          </button>
        </div>

        <div className="auth-link">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}
