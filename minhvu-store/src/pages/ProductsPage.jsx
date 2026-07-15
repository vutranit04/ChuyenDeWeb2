import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiGrid, FiDollarSign, FiSearch } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import CategoryIcon from '../components/CategoryIcon';
import { getProducts, getCategories } from '../api';

const ITEMS_PER_PAGE = 12;

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    Promise.all([getProducts(), getCategories()])
      .then(([prodRes, catRes]) => {
        setProducts(prodRes.data.filter(p => p.status !== false));
        setCategories(catRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Sync search param from URL
  useEffect(() => {
    const s = searchParams.get('search');
    const c = searchParams.get('category');
    if (s) setSearchQuery(s);
    if (c) setSelectedCategory(c);
  }, [searchParams]);

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p =>
        p.productName.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter(p => p.category && String(p.category.categoryId) === String(selectedCategory));
    }

    // Price filter
    if (minPrice) {
      result = result.filter(p => p.price >= Number(minPrice));
    }
    if (maxPrice) {
      result = result.filter(p => p.price <= Number(maxPrice));
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a, b) => a.productName.localeCompare(b.productName));
        break;
      case 'name-desc':
        result.sort((a, b) => b.productName.localeCompare(a.productName));
        break;
      default:
        break;
    }

    return result;
  }, [products, searchQuery, selectedCategory, minPrice, maxPrice, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, minPrice, maxPrice, sortBy]);

  const handleCategorySelect = (catId) => {
    const newCat = selectedCategory === String(catId) ? '' : String(catId);
    setSelectedCategory(newCat);
    if (newCat) {
      setSearchParams({ category: newCat });
    } else {
      searchParams.delete('category');
      setSearchParams(searchParams);
    }
  };

  const handleApplyPrice = () => {
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('default');
    setSearchParams({});
  };

  if (loading) return <div className="products-page container"><LoadingSpinner /></div>;

  return (
    <div className="products-page">
      <div className="container">
        {/* Page Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>Sản Phẩm</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Khám phá các sản phẩm chất lượng tại MinhVu Store</p>
        </div>

        <div className="products-page-layout">
          {/* Sidebar Filters */}
          <aside className="products-sidebar">

            {/* Categories */}
            <div className="filter-card">
              <h3><FiFilter /> Danh mục</h3>
              <div className="filter-category-list">
                <div
                  className={`filter-category-item ${!selectedCategory ? 'active' : ''}`}
                  onClick={() => handleCategorySelect('')}
                  id="filter-all-categories"
                >
                  <FiGrid /> Tất cả
                </div>
                {categories.map(cat => (
                  <div
                    key={cat.categoryId}
                    className={`filter-category-item ${selectedCategory === String(cat.categoryId) ? 'active' : ''}`}
                    onClick={() => handleCategorySelect(cat.categoryId)}
                    id={`filter-category-${cat.categoryId}`}
                  >
                    <CategoryIcon name={cat.categoryName} /> {cat.categoryName}
                  </div>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="filter-card">
              <h3><FiDollarSign /> Khoảng giá</h3>
              <div className="filter-price-inputs">
                <input
                  type="number"
                  placeholder="Từ"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  id="filter-min-price"
                />
                <input
                  type="number"
                  placeholder="Đến"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  id="filter-max-price"
                />
              </div>
              <button className="filter-apply-btn" onClick={handleApplyPrice} id="apply-price-filter">
                Áp dụng
              </button>
            </div>

            {/* Reset */}
            <button
              className="btn-outline"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleResetFilters}
              id="reset-filters-btn"
            >
              Xóa bộ lọc
            </button>
          </aside>

          {/* Products Grid */}
          <div>
            <div className="products-toolbar">
              <div className="products-toolbar-count">
                Hiển thị <strong>{paginatedProducts.length}</strong> / <strong>{filteredProducts.length}</strong> sản phẩm
              </div>
              <div className="products-sort">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} id="products-sort-select">
                  <option value="default">Mặc định</option>
                  <option value="price-asc">Giá: Thấp → Cao</option>
                  <option value="price-desc">Giá: Cao → Thấp</option>
                  <option value="name-asc">Tên: A → Z</option>
                  <option value="name-desc">Tên: Z → A</option>
                </select>
              </div>
            </div>

            {paginatedProducts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><FiSearch /></div>
                <h3>Không tìm thấy sản phẩm</h3>
                <p>Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác</p>
                <button className="btn-primary" onClick={handleResetFilters}>Xóa bộ lọc</button>
              </div>
            ) : (
              <>
                <div className="products-grid">
                  {paginatedProducts.map(product => (
                    <ProductCard key={product.productId} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => p - 1)}
                      id="prev-page-btn"
                    >
                      ‹
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        className={currentPage === page ? 'active' : ''}
                        onClick={() => setCurrentPage(page)}
                        id={`page-${page}-btn`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => p + 1)}
                      id="next-page-btn"
                    >
                      ›
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
