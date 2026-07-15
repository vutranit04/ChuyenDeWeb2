import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiCalendar } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
import { getPostById, getImageUrl } from '../api';

export default function PostDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getPostById(id)
      .then(res => setPost(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="post-detail container"><LoadingSpinner /></div>;
  if (!post) return <div className="post-detail container"><div className="empty-state"><h3>Không tìm thấy bài viết</h3></div></div>;

  const thumbUrl = getImageUrl(post.thumbnail);

  return (
    <div className="post-detail">
      <div className="container">
        <Link to="/posts" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '24px' }}>
          <FiArrowLeft /> Quay lại bài viết
        </Link>

        {post.categoryPost && (
          <span className="post-card-category" style={{ marginBottom: '12px', display: 'inline-block' }}>
            {post.categoryPost.categoryPostName}
          </span>
        )}

        <h1>{post.title}</h1>

        <div className="post-detail-meta">
          <span><FiUser style={{ marginRight: '6px', verticalAlign: 'middle' }} />{post.author?.fullName}</span>
          <span><FiCalendar style={{ marginRight: '6px', verticalAlign: 'middle' }} />{new Date(post.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>

        {thumbUrl && (
          <div className="post-detail-thumbnail">
            <img src={thumbUrl} alt={post.title} />
          </div>
        )}

        <div className="post-detail-content">
          {post.content}
        </div>
      </div>
    </div>
  );
}
