import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiUser, FiMenu, FiX, FiHome, FiGrid, FiFileText, FiLogOut, FiLogIn, FiPackage } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const { cartCount, setIsCartOpen } = useCart();
  const { isAuthenticated, customer, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchValue.trim())}`);
      setSearchValue('');
    }
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <>
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container header-inner">
          <Link to="/" className="header-logo">
            <span className="header-logo-icon">
              <FiShoppingCart />
            </span>
            MinhVu Store
          </Link>

          <form className="header-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              id="header-search-input"
            />
            <button type="submit" className="header-search-btn" id="header-search-btn">
              <FiSearch />
            </button>
          </form>

          <nav className="header-nav">
            <Link to="/" className={isActive('/')}>
              <FiHome /> Trang chủ
            </Link>
            <Link to="/products" className={isActive('/products')}>
              <FiGrid /> Sản phẩm
            </Link>
            <Link to="/posts" className={isActive('/posts')}>
              <FiFileText /> Bài viết
            </Link>
            <button className="header-cart-btn" onClick={() => setIsCartOpen(true)} id="cart-toggle-btn">
              <FiShoppingCart />
              {cartCount > 0 && <span className="header-cart-badge">{cartCount}</span>}
            </button>
            {isAuthenticated ? (
              <>
                <Link to="/profile" className={isActive('/profile')}>
                  <FiUser /> {customer?.fullName?.split(' ').pop()}
                </Link>
              </>
            ) : (
              <Link to="/login" className={isActive('/login')}>
                <FiLogIn /> Đăng nhập
              </Link>
            )}
          </nav>

          <button className="header-mobile-toggle" onClick={() => setMobileOpen(true)} id="mobile-menu-btn">
            <FiMenu />
          </button>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className={`mobile-nav-overlay ${mobileOpen ? 'show' : ''}`} onClick={() => setMobileOpen(false)} />
      <div className={`mobile-nav ${mobileOpen ? 'open' : ''}`}>
        <button className="mobile-nav-close" onClick={() => setMobileOpen(false)}>
          <FiX />
        </button>
        <Link to="/"><FiHome /> Trang chủ</Link>
        <Link to="/products"><FiGrid /> Sản phẩm</Link>
        <Link to="/posts"><FiFileText /> Bài viết</Link>
        <button onClick={() => { setMobileOpen(false); setIsCartOpen(true); }}>
          <FiShoppingCart /> Giỏ hàng ({cartCount})
        </button>
        {isAuthenticated ? (
          <>
            <Link to="/profile"><FiUser /> Tài khoản</Link>
            <Link to="/orders"><FiPackage /> Đơn hàng</Link>
            <button onClick={() => { logout(); setMobileOpen(false); }}>
              <FiLogOut /> Đăng xuất
            </button>
          </>
        ) : (
          <Link to="/login"><FiLogIn /> Đăng nhập</Link>
        )}
      </div>
    </>
  );
}
