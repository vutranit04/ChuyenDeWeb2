import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function PostsView({ searchQuery }) {
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
    const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

    const [formData, setFormData] = useState({
        title: '',
        categoryPostId: '',
        thumbnail: '',
        summary: '',
        content: '',
        status: true
    });
    const [error, setError] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedPostDetail, setSelectedPostDetail] = useState(null);

    const getHeaders = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
        }
    });

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return '-';
        const date = new Date(dateTimeString);
        return date.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    };

    const fetchPostsAndCategories = async () => {
        setLoading(true);
        try {
            const headers = getHeaders();
            const [postRes, catRes] = await Promise.all([
                axios.get('/api/posts', headers),
                axios.get('/api/category-posts', headers)
            ]);
            setPosts(postRes.data);
            setCategories(catRes.data);
        } catch (err) {
            console.error('Error fetching posts/categories:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPostsAndCategories();
    }, []);

    const handleOpenAddModal = () => {
        setEditingPost(null);
        setFormData({
            title: '',
            categoryPostId: categories[0]?.categoryPostId || '',
            thumbnail: '',
            summary: '',
            content: '',
            status: true
        });
        setSelectedFile(null);
        setImagePreview('');
        setError(null);
        setModalOpen(true);
    };

    const handleOpenEditModal = (post) => {
        setEditingPost(post);
        setFormData({
            title: post.title,
            categoryPostId: post.categoryPost?.categoryPostId || '',
            thumbnail: post.thumbnail || '',
            summary: post.summary || '',
            content: post.content || '',
            status: post.status !== false
        });
        setSelectedFile(null);
        setImagePreview(post.thumbnail || '');
        setError(null);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const handleOpenDetailModal = (post) => {
        setSelectedPostDetail(post);
        setDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setSelectedPostDetail(null);
        setDetailModalOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        let thumbnailUrl = formData.thumbnail;
        if (selectedFile) {
            const uploadData = new FormData();
            uploadData.append('file', selectedFile);
            try {
                const uploadRes = await axios.post('/api/upload', uploadData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
                    }
                });
                thumbnailUrl = uploadRes.data.url;
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.message || 'Lỗi tải ảnh lên máy chủ.');
                return;
            }
        }

        const payload = {
            ...formData,
            thumbnail: thumbnailUrl,
            categoryPostId: formData.categoryPostId ? Number(formData.categoryPostId) : null
        };

        try {
            if (editingPost) {
                await axios.put(`/api/posts/${editingPost.postId}`, payload, getHeaders());
            } else {
                await axios.post('/api/posts', payload, getHeaders());
            }
            fetchPostsAndCategories();
            setModalOpen(false);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu bài viết.');
        }
    };

    const handleDeletePost = async (id) => {
        if (!confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) return;
        try {
            await axios.delete(`/api/posts/${id}`, getHeaders());
            fetchPostsAndCategories();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Không thể xóa bài viết này.');
        }
    };

    const handleToggleStatus = async (post) => {
        const updatedStatus = !post.status;
        const payload = {
            ...post,
            status: updatedStatus,
            categoryPostId: post.categoryPost?.categoryPostId
        };
        try {
            await axios.put(`/api/posts/${post.postId}`, payload, getHeaders());
            setPosts(posts.map(p => p.postId === post.postId ? { ...p, status: updatedStatus } : p));
        } catch (err) {
            console.error('Error toggling status:', err);
        }
    };

    // Filter
    const filteredPosts = posts.filter(post => {
        const query = searchQuery?.toLowerCase() || '';
        const matchesSearch = 
            post.title?.toLowerCase().includes(query) ||
            post.postId?.toString().includes(query) ||
            post.author?.fullName?.toLowerCase().includes(query);

        const matchesCategory = selectedCategoryFilter === 'ALL' || 
            post.categoryPost?.categoryPostId?.toString() === selectedCategoryFilter;

        const matchesStatus = selectedStatusFilter === 'ALL' ||
            (selectedStatusFilter === 'ACTIVE' && post.status !== false) ||
            (selectedStatusFilter === 'INACTIVE' && post.status === false);

        return matchesSearch && matchesCategory && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-80 gap-3">
                <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                <p className="text-sm text-slate-500 animate-pulse">Đang tải danh sách bài viết...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-lg font-bold font-outfit text-slate-900 dark:text-white">Tin tức & Bài viết</h3>
                    <p className="text-xs text-slate-500">Quản lý các bài viết tin tức, cẩm nang của hệ thống</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Category Filter */}
                    <select 
                        value={selectedCategoryFilter}
                        onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                        className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none dark:text-white"
                    >
                        <option value="ALL">Tất cả danh mục</option>
                        {categories.map(cat => (
                            <option key={cat.categoryPostId} value={cat.categoryPostId}>{cat.categoryPostName}</option>
                        ))}
                    </select>

                    {/* Status Filter */}
                    <select 
                        value={selectedStatusFilter}
                        onChange={(e) => setSelectedStatusFilter(e.target.value)}
                        className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none dark:text-white"
                    >
                        <option value="ALL">Tất cả trạng thái</option>
                        <option value="ACTIVE">Hiển thị</option>
                        <option value="INACTIVE">Ẩn</option>
                    </select>

                    <button 
                        onClick={handleOpenAddModal}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20"
                    >
                        <i className="fa-solid fa-plus"></i>
                        <span>Thêm bài viết</span>
                    </button>
                </div>
            </div>

            {/* Posts Grid / Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/50 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-xs font-semibold uppercase">
                                <th className="py-3 px-6">ID</th>
                                <th className="py-3 px-6">Bài viết</th>
                                <th className="py-3 px-6">Danh mục</th>
                                <th className="py-3 px-6">Tác giả</th>
                                <th className="py-3 px-6">Ngày viết</th>
                                <th className="py-3 px-6 text-center">Trạng thái</th>
                                <th className="py-3 px-6 text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {filteredPosts.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-12 text-center text-slate-400">
                                        <i className="fa-solid fa-newspaper text-3xl mb-2 block opacity-40"></i>
                                        Không tìm thấy bài viết nào
                                    </td>
                                </tr>
                            ) : (
                                filteredPosts.map(post => (
                                    <tr key={post.postId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                                        <td className="py-4 px-6 font-semibold text-slate-500">#{post.postId}</td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-10 rounded bg-slate-150 dark:bg-slate-800 overflow-hidden flex items-center justify-center border border-slate-200/50 dark:border-slate-700/50 flex-shrink-0">
                                                    {post.thumbnail ? (
                                                        <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <i className="fa-solid fa-file-image text-slate-400"></i>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="font-semibold text-slate-900 dark:text-white block truncate w-48 md:w-64" title={post.title}>{post.title}</span>
                                                    <span className="text-[10px] text-slate-400 block truncate max-w-xs">{post.summary || 'Không có mô tả tóm tắt'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold px-2 py-0.5 rounded">
                                                {post.categoryPost?.categoryPostName || 'Không xác định'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 font-medium dark:text-slate-350">{post.author?.fullName || 'Ẩn danh'}</td>
                                        <td className="py-4 px-6 text-slate-400">{formatDateTime(post.createdAt)}</td>
                                        <td className="py-4 px-6 text-center">
                                            <button 
                                                onClick={() => handleToggleStatus(post)}
                                                className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all ${
                                                    post.status !== false 
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30' 
                                                        : 'bg-red-55 bg-red-50 text-red-705 border-red-100 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/30'
                                                }`}
                                            >
                                                {post.status !== false ? 'Hiển thị' : 'Ẩn'}
                                            </button>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <div className="flex justify-center items-center gap-2">
                                                <button 
                                                    onClick={() => handleOpenDetailModal(post)}
                                                    className="p-2 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                                                    title="Xem chi tiết"
                                                >
                                                    <i className="fa-solid fa-eye text-sm"></i>
                                                </button>
                                                <button 
                                                    onClick={() => handleOpenEditModal(post)}
                                                    className="p-2 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                                                    title="Chỉnh sửa"
                                                >
                                                    <i className="fa-solid fa-pen-to-square"></i>
                                                </button>
                                                <button 
                                                    onClick={() => handleDeletePost(post.postId)}
                                                    className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                                                    title="Xóa"
                                                >
                                                    <i className="fa-solid fa-trash-can"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Add/Edit */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm">
                    <div className="w-full max-w-lg p-6 mx-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6 pb-2 border-b border-slate-100 dark:border-slate-800/50">
                            <h4 className="font-outfit font-bold text-lg dark:text-white">
                                {editingPost ? 'Chỉnh sửa bài viết' : 'Viết bài mới'}
                            </h4>
                            <button 
                                onClick={handleCloseModal}
                                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 text-xs text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Tiêu đề</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
                                    placeholder="Tiêu đề bài viết..."
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Danh mục</label>
                                    <select 
                                        value={formData.categoryPostId}
                                        onChange={(e) => setFormData({ ...formData, categoryPostId: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
                                    >
                                        <option value="">Chọn danh mục</option>
                                        {categories.map(cat => (
                                            <option key={cat.categoryPostId} value={cat.categoryPostId}>{cat.categoryPostName}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Hình đại diện bài viết</label>
                                    <div className="flex items-center gap-4">
                                        {imagePreview && (
                                            <div className="relative w-16 h-16 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-900 flex-shrink-0">
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                <button 
                                                    type="button" 
                                                    onClick={() => {
                                                        setFormData({ ...formData, thumbnail: '' });
                                                        setSelectedFile(null);
                                                        setImagePreview('');
                                                    }}
                                                    className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-all text-xs"
                                                >
                                                    Xóa
                                                </button>
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <input 
                                                type="file" 
                                                accept="image/*"
                                                required={!imagePreview}
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        setSelectedFile(file);
                                                        setImagePreview(URL.createObjectURL(file));
                                                    }
                                                }}
                                                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-slate-800 dark:file:text-slate-350 cursor-pointer"
                                            />
                                            <p className="text-[10px] text-slate-400 mt-1">Hỗ trợ JPG, PNG, GIF. File được tải lên thư mục tĩnh của Backend.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Mô tả tóm tắt</label>
                                <textarea 
                                    value={formData.summary}
                                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white text-sm h-16 resize-none"
                                    placeholder="Tóm tắt ngắn gọn bài viết..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Nội dung bài viết</label>
                                <textarea 
                                    required
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white text-sm h-40 resize-none font-mono"
                                    placeholder="Nội dung chính hoặc mã Markdown..."
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    id="postStatus" 
                                    checked={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                                    className="w-4.5 h-4.5 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
                                />
                                <label htmlFor="postStatus" className="text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">Xuất bản ngay lập tức</label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                                <button 
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-sm"
                                >
                                    Hủy
                                </button>
                                <button 
                                    type="submit"
                                    className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-primary-500/20"
                                >
                                    Lưu lại
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {detailModalOpen && selectedPostDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm">
                    <div className="w-full max-w-2xl p-6 mx-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6 pb-2 border-b border-slate-100 dark:border-slate-800/50">
                            <h4 className="font-outfit font-bold text-lg dark:text-white">Chi tiết bài viết</h4>
                            <button 
                                onClick={handleCloseDetailModal}
                                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Thumbnail */}
                            <div className="w-full h-48 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                                {selectedPostDetail.thumbnail ? (
                                    <img src={selectedPostDetail.thumbnail} alt={selectedPostDetail.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center text-slate-400">
                                        <i className="fa-solid fa-file-image text-5xl mb-2 block"></i>
                                        Chưa có hình đại diện
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="space-y-4">
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-slate-400">Tiêu đề bài viết</span>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight mt-0.5">{selectedPostDetail.title}</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-slate-400">Danh mục</span>
                                        <div className="mt-1">
                                            <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350 font-semibold px-2.5 py-1 rounded">
                                                {selectedPostDetail.categoryPost?.categoryPostName || 'Không xác định'}
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-slate-400">Trạng thái</span>
                                        <div className="mt-1">
                                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                selectedPostDetail.status !== false 
                                                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' 
                                                    : 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400'
                                            }`}>
                                                {selectedPostDetail.status !== false ? 'Hiển thị' : 'Ẩn'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-slate-400">Tác giả</span>
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1">{selectedPostDetail.author?.fullName || 'Ẩn danh'}</p>
                                    </div>

                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-slate-400">Ngày đăng</span>
                                        <p className="text-xs text-slate-500 mt-1">{formatDateTime(selectedPostDetail.createdAt)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Summary & Content */}
                        <div className="mt-6 space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                            <div>
                                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Mô tả tóm tắt</h5>
                                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line border border-slate-100 dark:border-slate-800">
                                    {selectedPostDetail.summary || 'Chưa có mô tả tóm tắt.'}
                                </div>
                            </div>

                            <div>
                                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Nội dung bài viết</h5>
                                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line border border-slate-100 dark:border-slate-800 max-h-60 overflow-y-auto">
                                    {selectedPostDetail.content || 'Chưa cập nhật nội dung.'}
                                </div>
                            </div>
                        </div>

                        {/* Actions Footer */}
                        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                            <button 
                                onClick={handleCloseDetailModal}
                                className="px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                            >
                                Đóng
                            </button>
                            <button 
                                onClick={async () => {
                                    if (confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) {
                                        try {
                                            await axios.delete(`/api/posts/${selectedPostDetail.postId}`, getHeaders());
                                            fetchPostsAndCategories();
                                            handleCloseDetailModal();
                                        } catch (err) {
                                            console.error(err);
                                            alert(err.response?.data?.message || 'Không thể xóa bài viết này.');
                                        }
                                    }
                                }}
                                className="px-4 py-2 text-sm font-semibold bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all"
                            >
                                Xóa bài viết
                            </button>
                            <button 
                                onClick={() => {
                                    handleOpenEditModal(selectedPostDetail);
                                    handleCloseDetailModal();
                                }}
                                className="px-4 py-2 text-sm font-semibold bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all shadow-md shadow-primary-500/20"
                            >
                                Chỉnh sửa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
