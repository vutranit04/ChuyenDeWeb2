import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUnlock, FiMail } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { forgotPassword } from '../api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!email) {
      toast.error('Vui lòng nhập địa chỉ email');
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword({ email });
      toast.success(res.data?.message || 'Mật khẩu mới đã được gửi về email của bạn. Vui lòng kiểm tra hộp thư!');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || 'Gửi yêu cầu thất bại. Email có thể không tồn tại.';
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
          <h1>Quên Mật Khẩu</h1>
          <p>Nhập email đăng ký để nhận mật khẩu tạm thời mới</p>
        </div>

        <div onKeyDown={handleKeyDown}>
          <div className="form-group">
            <label><FiMail style={{ marginRight: '6px', verticalAlign: 'middle' }} />Email đăng ký</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Nhập email tài khoản"
              id="forgot-email"
            />
          </div>
          
          <button
            type="button"
            className="btn-auth"
            onClick={handleSubmit}
            disabled={loading}
            id="forgot-submit"
          >
            {loading ? 'Đang gửi email...' : <><FiUnlock /> Nhận mật khẩu mới</>}
          </button>
        </div>

        <div className="auth-link">
          Nhớ mật khẩu? <Link to="/login">Quay lại đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}
