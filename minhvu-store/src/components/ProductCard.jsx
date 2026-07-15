import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiEye } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../api';

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

export default function ProductCard({ product }) {
  const { addToCart, cartItems } = useCart();
  const navigate = useNavigate();
  const imageUrl = getImageUrl(product.image);

  const existingCartItem = cartItems ? cartItems.find(item => item.productId === product.productId) : null;
  const alreadyInCart = existingCartItem ? existingCartItem.quantity : 0;
  const isMaxedOut = product.stockQuantity !== undefined && alreadyInCart >= product.stockQuantity;

  const handleBuyNow = (e) => {
    e.stopPropagation();
    if (product.stockQuantity > 0 && !isMaxedOut) {
      addToCart(product);
      navigate('/cart');
    }
  };

  return (
    <div className="product-card fade-in-up" id={`product-card-${product.productId}`}>
      {product.stockQuantity <= 0 && (
        <span className="product-card-badge">Hết hàng</span>
      )}
      <div className="product-card-image">
        <img src={imageUrl} alt={product.productName} loading="lazy" />
        <div className="product-card-overlay">
          <Link to={`/products/${product.productId}`}>
            <button title="Xem chi tiết" id={`view-product-${product.productId}`}>
              <FiEye />
            </button>
          </Link>
          <button
            title="Thêm vào giỏ"
            onClick={() => addToCart(product)}
            disabled={product.stockQuantity <= 0 || isMaxedOut}
            id={`add-cart-${product.productId}`}
          >
            <FiShoppingCart />
          </button>
        </div>
      </div>
      <div className="product-card-info">
        {product.category && (
          <div className="product-card-category">{product.category.categoryName}</div>
        )}
        <Link to={`/products/${product.productId}`}>
          <h3 className="product-card-name">{product.productName}</h3>
        </Link>
        <div className="product-card-price">{formatPrice(product.price)}</div>
        
        <div className="product-card-actions">
          <button
            className="product-card-buy-btn"
            onClick={handleBuyNow}
            disabled={product.stockQuantity <= 0 || isMaxedOut}
            id={`buy-now-btn-${product.productId}`}
          >
            {product.stockQuantity <= 0 
              ? 'Hết hàng' 
              : isMaxedOut 
                ? 'Đạt tối đa' 
                : 'Mua ngay'}
          </button>
          <button
            className="product-card-add-btn"
            onClick={(e) => { e.stopPropagation(); addToCart(product); }}
            disabled={product.stockQuantity <= 0 || isMaxedOut}
            id={`add-to-cart-btn-${product.productId}`}
            title="Thêm vào giỏ hàng"
          >
            <FiShoppingCart />
          </button>
        </div>
      </div>
    </div>
  );
}
