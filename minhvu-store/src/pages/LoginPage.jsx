import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiLogIn, FiMail, FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Vui lòng nhập email và mật khẩu');
      return;
    }

    setLoading(true);
    try {
      // Search customers by email — simple approach since backend has no customer login endpoint
      const res = await axios.get('/api/customers');
      const customers = res.data;

      const found = Array.isArray(customers)
        ? customers.find(c => c.email === email)
        : null;

      if (!found) {
        toast.error('Email không tồn tại. Vui lòng đăng ký tài khoản mới.');
        setLoading(false);
        return;
      }

      // Simple client-side auth — store customer info
      // Note: In production, you'd want a proper backend auth endpoint
      login({
        customerId: found.customerId,
        fullName: found.fullName,
        email: found.email,
        phone: found.phone,
      });

      toast.success(`Chào mừng ${found.fullName}!`);
      navigate('/');
    } catch (err) {
      toast.error('Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-header">
          <h1>Đăng Nhập</h1>
          <p>Chào mừng bạn quay trở lại MinhVu Store</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label><FiMail style={{ marginRight: '6px', verticalAlign: 'middle' }} />Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              id="login-email"
            />
          </div>
          <div className="form-group">
            <label><FiLock style={{ marginRight: '6px', verticalAlign: 'middle' }} />Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              id="login-password"
            />
          </div>
          <button type="submit" className="btn-auth" disabled={loading} id="login-submit">
            {loading ? 'Đang xử lý...' : <><FiLogIn /> Đăng nhập</>}
          </button>
        </form>

        <div className="auth-link" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
          <div>
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </div>
          <div>
            <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Quên mật khẩu?</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
