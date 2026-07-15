import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function CategoriesView({ searchQuery }) {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ categoryName: '', description: '' });
    const [error, setError] = useState(null);

    const getHeaders = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
        }
    });

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/categories', getHeaders());
            setCategories(response.data);
        } catch (err) {
            console.error('Error fetching categories:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleOpenAddModal = () => {
        setEditingCategory(null);
        setFormData({ categoryName: '', description: '' });
        setError(null);
        setModalOpen(true);
    };

    const handleOpenEditModal = (cat) => {
        setEditingCategory(cat);
        setFormData({ categoryName: cat.categoryName, description: cat.description || '' });
        setError(null);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            if (editingCategory) {
                await axios.put(`/api/categories/${editingCategory.categoryId}`, formData, getHeaders());
            } else {
                await axios.post('/api/categories', formData, getHeaders());
            }
            fetchCategories();
            setModalOpen(false);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu danh mục.');
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!confirm('Bạn có chắc chắn muốn xóa danh mục này? Tất cả sản phẩm thuộc danh mục sẽ có thể bị ảnh hưởng.')) return;
        try {
            await axios.delete(`/api/categories/${id}`, getHeaders());
            fetchCategories();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Không thể xóa danh mục này.');
        }
    };

    const filteredCategories = categories.filter(cat => {
        const query = searchQuery?.toLowerCase() || '';
        return (
            cat.categoryName?.toLowerCase().includes(query) ||
            cat.categoryId?.toString().includes(query) ||
            cat.description?.toLowerCase().includes(query)
        );
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-80 gap-3">
                <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                <p className="text-sm text-slate-500 animate-pulse">Đang tải danh mục sản phẩm...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold font-outfit text-slate-900 dark:text-white">Danh mục sản phẩm</h3>
                    <p className="text-xs text-slate-500">Phân loại các sản phẩm tại hệ thống cửa hàng</p>
                </div>
                <button 
                    onClick={handleOpenAddModal}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-emerald-500/20"
                >
                    <i className="fa-solid fa-plus"></i>
                    <span>Thêm danh mục</span>
                </button>
            </div>

            {/* Categories Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/50 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-xs font-semibold uppercase">
                                <th className="py-3 px-6">ID</th>
                                <th className="py-3 px-6">Tên danh mục</th>
                                <th className="py-3 px-6">Mô tả</th>
                                <th className="py-3 px-6 text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {filteredCategories.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-12 text-center text-slate-400">
                                        <i className="fa-solid fa-tags text-3xl mb-2 block opacity-40"></i>
                                        Không tìm thấy danh mục nào
                                    </td>
                                </tr>
                            ) : (
                                filteredCategories.map(cat => (
                                    <tr key={cat.categoryId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                                        <td className="py-4 px-6 font-semibold text-slate-500">#{cat.categoryId}</td>
                                        <td className="py-4 px-6 font-semibold dark:text-white">{cat.categoryName}</td>
                                        <td className="py-4 px-6 dark:text-slate-350">{cat.description || '-'}</td>
                                        <td className="py-4 px-6 text-center">
                                            <div className="flex justify-center items-center gap-2">
                                                <button 
                                                    onClick={() => handleOpenEditModal(cat)}
                                                    className="p-2 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                                                    title="Chỉnh sửa"
                                                >
                                                    <i className="fa-solid fa-pen-to-square"></i>
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteCategory(cat.categoryId)}
                                                    className="p-2 text-slate-400 hover:text-red-650 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
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
                    <div className="w-full max-w-md p-6 mx-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl">
                        <div className="flex justify-between items-center mb-6 pb-2 border-b border-slate-100 dark:border-slate-800/50">
                            <h4 className="font-outfit font-bold text-lg dark:text-white">
                                {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục sản phẩm'}
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
                                <div className="p-3 text-xs text-red-605 bg-red-50 dark:bg-red-950/20 dark:text-red-400 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Tên danh mục</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={formData.categoryName}
                                    onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
                                    placeholder="Ví dụ: Điện thoại, Laptop..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Mô tả chi tiết</label>
                                <textarea 
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white text-sm h-24 resize-none"
                                    placeholder="Thông tin giới thiệu danh mục..."
                                />
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
        </div>
    );
}
