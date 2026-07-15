import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiUser } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
import { getPosts, getCategoryPosts, getImageUrl } from '../api';

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [categoryPosts, setCategoryPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getPosts(), getCategoryPosts()])
      .then(([postRes, catRes]) => {
        setPosts(postRes.data.filter(p => p.status !== false));
        setCategoryPosts(catRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredPosts = selectedCategory
    ? posts.filter(p => p.categoryPost && String(p.categoryPost.categoryPostId) === selectedCategory)
    : posts;

  if (loading) return <div className="posts-page container"><LoadingSpinner /></div>;

  return (
    <div className="posts-page">
      <div className="container">
        <div className="posts-page-header">
          <h1>Bài Viết & Tin Tức</h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
            Cập nhật những tin tức, thủ thuật và kiến thức mới nhất
          </p>
        </div>

        {/* Category Filter */}
        {categoryPosts.length > 0 && (
          <div className="filter-tabs">
            <button
              className={`filter-tab ${!selectedCategory ? 'active' : ''}`}
              onClick={() => setSelectedCategory('')}
              id="posts-filter-all"
            >
              Tất cả
            </button>
            {categoryPosts.map(cat => (
              <button
                key={cat.categoryPostId}
                className={`filter-tab ${selectedCategory === String(cat.categoryPostId) ? 'active' : ''}`}
                onClick={() => setSelectedCategory(String(cat.categoryPostId))}
                id={`posts-filter-${cat.categoryPostId}`}
              >
                {cat.categoryPostName}
              </button>
            ))}
          </div>
        )}

        {filteredPosts.length === 0 ? (
          <div className="empty-state">
            <h3>Chưa có bài viết nào</h3>
            <p>Hãy quay lại sau để xem bài viết mới nhất</p>
          </div>
        ) : (
          <div className="posts-grid">
            {filteredPosts.map(post => {
              const thumbUrl = getImageUrl(post.thumbnail);
              return (
                <Link to={`/posts/${post.postId}`} key={post.postId}>
                  <div className="post-card fade-in-up" id={`post-card-${post.postId}`}>
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
                        <span><FiUser style={{ marginRight: '4px', verticalAlign: 'middle' }} />{post.author?.fullName}</span>
                        <span>•</span>
                        <span><FiCalendar style={{ marginRight: '4px', verticalAlign: 'middle' }} />{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
