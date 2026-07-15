import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiGrid, FiTrendingUp, FiStar } from 'react-icons/fi';
import BannerSlider from '../components/BannerSlider';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import CategoryIcon from '../components/CategoryIcon';
import { getProducts, getCategories, getPosts, getImageUrl, getLatestProducts, getBestSellers } from '../api';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getLatestProducts(),
      getBestSellers(),
      getProducts(),
      getCategories(),
      getPosts()
    ])
      .then(([latestRes, bestRes, featRes, catRes, postRes]) => {
        setLatestProducts(latestRes.data || []);
        setBestSellers(bestRes.data || []);
        setFeaturedProducts(featRes.data.filter(p => p.status !== false).slice(0, 8));
        setCategories(catRes.data);
        setPosts(postRes.data.filter(p => p.status !== false).slice(0, 3));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ marginTop: 'var(--header-height)' }}><LoadingSpinner /></div>;

  return (
    <>
      {/* Banner */}
      <BannerSlider />

      {/* Featured Categories */}
      {categories.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2>Danh Mục Sản Phẩm</h2>
              <p>Khám phá các danh mục đa dạng của chúng tôi</p>
              <div className="section-header-line" />
            </div>
            <div className="categories-grid">
              {categories.map((cat) => (
                <Link to={`/products?category=${cat.categoryId}`} key={cat.categoryId}>
                  <div className="category-card" id={`home-category-${cat.categoryId}`}>
                    <div className="category-card-icon">
                      <CategoryIcon name={cat.categoryName} />
                    </div>
                    <h3>{cat.categoryName}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Products */}
      {latestProducts.length > 0 && (
        <section className="section" style={{ background: '#fff' }}>
          <div className="container">
            <div className="section-header">
              <h2>Sản Phẩm Mới Nhất</h2>
              <p>Cập nhật những thiết bị công nghệ mới nhất</p>
              <div className="section-header-line" />
            </div>
            <div className="products-grid">
              {latestProducts.map(product => (
                <ProductCard key={product.productId} product={product} />
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <Link to="/products" className="btn-primary">
                Xem tất cả sản phẩm mới <FiArrowRight />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="section" style={{ background: '#f8fafc' }}>
          <div className="container">
            <div className="section-header">
              <h2>Sản Phẩm Bán Chạy</h2>
              <p>Top sản phẩm được săn đón nhiều nhất</p>
              <div className="section-header-line" />
            </div>
            <div className="products-grid">
              {bestSellers.map(product => (
                <ProductCard key={product.productId} product={product} />
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <Link to="/products" className="btn-primary">
                Mua ngay sản phẩm hot <FiArrowRight />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="section" style={{ background: '#fff' }}>
          <div className="container">
            <div className="section-header">
              <h2>Sản Phẩm Nổi Bật</h2>
              <p>Những sản phẩm được yêu thích nhất tại cửa hàng</p>
              <div className="section-header-line" />
            </div>
            <div className="products-grid">
              {featuredProducts.map(product => (
                <ProductCard key={product.productId} product={product} />
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <Link to="/products" className="btn-primary">
                Xem tất cả sản phẩm <FiArrowRight />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="section" style={{ background: 'var(--gradient-primary)', color: '#fff' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', textAlign: 'center' }}>
            {[
              { icon: <FiGrid />, num: (latestProducts.length + bestSellers.length + featuredProducts.length) + '+', label: 'Sản phẩm' },
              { icon: <FiStar />, num: '100%', label: 'Hàng chính hãng' },
              { icon: <FiTrendingUp />, num: '24/7', label: 'Hỗ trợ khách hàng' },
              { icon: <FiArrowRight />, num: 'Miễn phí', label: 'Vận chuyển' },
            ].map((stat, i) => (
              <div key={i} style={{ padding: '20px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '12px', opacity: 0.9 }}>{stat.icon}</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '4px' }}>{stat.num}</div>
                <div style={{ opacity: 0.85, fontSize: '0.95rem' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Posts */}
      {posts.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2>Bài Viết Mới Nhất</h2>
              <p>Cập nhật tin tức và kiến thức hữu ích</p>
              <div className="section-header-line" />
            </div>
            <div className="posts-grid">
              {posts.map(post => {
                const thumbUrl = getImageUrl(post.thumbnail);
                return (
                  <Link to={`/posts/${post.postId}`} key={post.postId}>
                    <div className="post-card" id={`home-post-${post.postId}`}>
                      <div className="post-card-image">
                        <img src={thumbUrl} alt={post.title} loading="lazy" />
                      </div>
                      <div className="post-card-info">
                        {post.categoryPost && (
                          <span className="post-card-category">{post.categoryPost.categoryPostName}</span>
                        )}
                        <h3 className="post-card-title">{post.title}</h3>
                        <p className="post-card-summary">{post.summary}</p>
                        <div className="post-card-meta">
                          <span>{post.author?.fullName}</span>
                          <span>•</span>
                          <span>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <Link to="/posts" className="btn-outline">
                Xem tất cả bài viết <FiArrowRight />
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
