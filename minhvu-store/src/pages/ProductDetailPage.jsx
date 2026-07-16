import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiShoppingCart, FiPlus, FiMinus, FiArrowLeft, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { getProductById, getProducts, getImageUrl } from '../api';

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addToCart, cartItems } = useCart();

  const existingCartItem = cartItems && product ? cartItems.find(item => item.productId === product.productId) : null;
  const alreadyInCart = existingCartItem ? existingCartItem.quantity : 0;
  const maxAvailableToAdd = product ? Math.max(0, product.stockQuantity - alreadyInCart) : 0;

  useEffect(() => {
    if (product) {
      if (maxAvailableToAdd === 0) {
        setQuantity(0);
      } else if (quantity > maxAvailableToAdd) {
        setQuantity(maxAvailableToAdd);
      } else if (quantity === 0 && maxAvailableToAdd > 0) {
        setQuantity(1);
      }
    }
  }, [product, maxAvailableToAdd, quantity]);

  useEffect(() => {
    setLoading(true);
    setQuantity(1);
    getProductById(id)
      .then(res => {
        setProduct(res.data);
        // Load related products from same category
        if (res.data.category) {
          getProducts().then(allRes => {
            const related = allRes.data
              .filter(p => p.category?.categoryId === res.data.category.categoryId && p.productId !== res.data.productId && p.status !== false)
              .slice(0, 4);
            setRelatedProducts(related);
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="product-detail container"><LoadingSpinner /></div>;
  if (!product || product.status === false) return (
    <div className="product-detail container" style={{ padding: '40px 0', textAlign: 'center' }}>
      <div className="empty-state">
        <h3 style={{ fontSize: '1.5rem', color: '#64748b', marginBottom: '16px' }}>Sản phẩm này không tồn tại hoặc đã ngừng kinh doanh</h3>
        <Link to="/products" className="btn" style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
          Quay lại danh sách sản phẩm
        </Link>
      </div>
    </div>
  );

  const imageUrl = getImageUrl(product.image);

  const inStock = product.stockQuantity > 0;
  const canAddMore = maxAvailableToAdd > 0;

  return (
    <div className="product-detail">
      <div className="container">
        {/* Breadcrumb */}
        <div style={{ marginBottom: '24px' }}>
          <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>
            <FiArrowLeft /> Quay lại sản phẩm
          </Link>
        </div>

        <div className="product-detail-grid">
          {/* Image */}
          <div className="product-detail-image">
            <img src={imageUrl} alt={product.productName} />
          </div>

          {/* Info */}
          <div className="product-detail-info">
            {product.category && (
              <span className="product-detail-category">{product.category.categoryName}</span>
            )}
            <h1>{product.productName}</h1>
            <div className="product-detail-price">{formatPrice(product.price)}</div>

            <div className={`product-detail-stock ${inStock ? 'in-stock' : 'out-of-stock'}`}>
              {inStock ? <><FiCheckCircle /> Còn hàng ({product.stockQuantity})</> : <><FiXCircle /> Hết hàng</>}
            </div>

            {product.description && (
              <p className="product-detail-desc">{product.description}</p>
            )}

            {product.specifications && (
              <div className="product-detail-specs">
                <h3>Thông số kỹ thuật</h3>
                <div className="product-detail-specs-content">{product.specifications}</div>
              </div>
            )}

            <div className="product-detail-actions">
              <div className="quantity-control">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={!canAddMore}
                  id="qty-decrease"
                >
                  <FiMinus />
                </button>
                <span>{quantity}</span>
                <button
                  onClick={() => setQuantity(q => {
                    if (q >= maxAvailableToAdd) {
                      toast.error(`Bạn đã có ${alreadyInCart} sản phẩm trong giỏ hàng. Chỉ có thể thêm tối đa ${maxAvailableToAdd} sản phẩm.`);
                      return q;
                    }
                    return q + 1;
                  })}
                  disabled={!canAddMore}
                  id="qty-increase"
                >
                  <FiPlus />
                </button>
              </div>
              <button
                className="btn-add-to-cart-lg"
                onClick={() => {
                  if (quantity > maxAvailableToAdd) {
                    toast.error(`Chỉ có thể thêm tối đa ${maxAvailableToAdd} sản phẩm.`);
                    return;
                  }
                  addToCart(product, quantity);
                  // Reset selection to 1 (or 0 if maxed out) after adding
                  const nextCartQty = alreadyInCart + quantity;
                  const nextMaxAvailable = Math.max(0, product.stockQuantity - nextCartQty);
                  setQuantity(nextMaxAvailable > 0 ? 1 : 0);
                }}
                disabled={!inStock || !canAddMore}
                id="add-to-cart-detail"
              >
                <FiShoppingCart />
                {!inStock 
                  ? 'Hết hàng' 
                  : !canAddMore 
                    ? 'Đã đạt tối đa trong giỏ' 
                    : 'Thêm vào giỏ hàng'}
              </button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="section">
            <div className="section-header">
              <h2>Sản Phẩm Liên Quan</h2>
              <div className="section-header-line" />
            </div>
            <div className="products-grid">
              {relatedProducts.map(p => (
                <ProductCard key={p.productId} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
