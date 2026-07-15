import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function CustomersView({ searchQuery }) {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [formData, setFormData] = useState({ fullName: '', phone: '', email: '', password: '' });
    const [error, setError] = useState(null);
    
    // Pagination state
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const getHeaders = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
        }
    });

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/customers', getHeaders());
            const data = response.data || [];
            
            // Client-side filtering if search is active
            let filtered = [...data];
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                filtered = filtered.filter(c => 
                    (c.fullName && c.fullName.toLowerCase().includes(query)) ||
                    (c.phone && c.phone.includes(query)) ||
                    (c.email && c.email.toLowerCase().includes(query))
                );
            }
            
            // Sort by createdAt descending (newest first)
            filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

            setCustomers(filtered);
            setTotalElements(filtered.length);
            setTotalPages(1);
            setPage(0);
        } catch (err) {
            console.error('Error fetching customers:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, [searchQuery]);

    const handleOpenAddModal = () => {
        setEditingCustomer(null);
        setFormData({ fullName: '', phone: '', email: '', password: '' });
        setError(null);
        setModalOpen(true);
    };

    const handleOpenEditModal = (customer) => {
        setEditingCustomer(customer);
        setFormData({ 
            fullName: customer.fullName || '', 
            phone: customer.phone || '', 
            email: customer.email || '', 
            password: '' // Keep empty to not change unless typed
        });
        setError(null);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        // Prepare data to send
        const dataToSend = { ...formData };
        if (editingCustomer && !dataToSend.password) {
            // Remove password from payload if not changing
            delete dataToSend.password;
        }

        try {
            if (editingCustomer) {
                await axios.put(`/api/customers/${editingCustomer.customerId}`, dataToSend, getHeaders());
            } else {
                await axios.post('/api/customers', dataToSend, getHeaders());
            }
            fetchCustomers();
            setModalOpen(false);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin khách hàng.');
        }
    };

    const handleDeleteCustomer = async (id) => {
        if (!confirm('Bạn có chắc chắn muốn xóa khách hàng này không?')) return;
        try {
            await axios.delete(`/api/customers/${id}`, getHeaders());
            fetchCustomers();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Không thể xóa khách hàng này.');
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateStr;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold font-outfit text-slate-900 dark:text-white">Danh sách khách hàng</h3>
                    <p className="text-xs text-slate-500">Quản lý tài khoản khách hàng mua sắm tại cửa hàng ({totalElements} khách hàng)</p>
                </div>
                <button 
                    onClick={handleOpenAddModal}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-emerald-500/20"
                >
                    <i className="fa-solid fa-plus"></i>
                    <span>Thêm khách hàng</span>
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-80 gap-3">
                    <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                    <p className="text-sm text-slate-500 animate-pulse">Đang tải danh sách khách hàng...</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/50 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between min-h-[400px]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-xs font-semibold uppercase">
                                    <th className="py-3 px-6">ID</th>
                                    <th className="py-3 px-6">Họ và tên</th>
                                    <th className="py-3 px-6">Số điện thoại</th>
                                    <th className="py-3 px-6">Email</th>
                                    <th className="py-3 px-6">Ngày tham gia</th>
                                    <th className="py-3 px-6 text-center">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                {customers.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-slate-400">
                                            <i className="fa-solid fa-user-slash text-3xl mb-2 block opacity-40"></i>
                                            Không tìm thấy khách hàng nào
                                        </td>
                                    </tr>
                                ) : (
                                    customers.map(cust => (
                                        <tr key={cust.customerId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                                            <td className="py-4 px-6 font-semibold text-slate-500">#{cust.customerId}</td>
                                            <td className="py-4 px-6 font-semibold text-slate-800 dark:text-white">{cust.fullName}</td>
                                            <td className="py-4 px-6 dark:text-slate-350">{cust.phone || '-'}</td>
                                            <td className="py-4 px-6 dark:text-slate-350">{cust.email || '-'}</td>
                                            <td className="py-4 px-6 text-xs text-slate-400">{formatDate(cust.createdAt)}</td>
                                            <td className="py-4 px-6 text-center">
                                                <div className="flex justify-center items-center gap-2">
                                                    <button 
                                                        onClick={() => handleOpenEditModal(cust)}
                                                        className="p-2 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <i className="fa-solid fa-pen-to-square"></i>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteCustomer(cust.customerId)}
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

                    {/* Pagination Footer */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800/50">
                            <span className="text-xs text-slate-500">
                                Trang {page + 1} / {totalPages}
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => fetchCustomers(page - 1)}
                                    disabled={page === 0}
                                    className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg disabled:opacity-50 disabled:hover:bg-transparent"
                                >
                                    <i className="fa-solid fa-chevron-left text-sm"></i>
                                </button>
                                {[...Array(totalPages)].map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => fetchCustomers(idx)}
                                        className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                                            page === idx
                                                ? 'bg-primary-600 text-white shadow-sm'
                                                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => fetchCustomers(page + 1)}
                                    disabled={page === totalPages - 1}
                                    className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg disabled:opacity-50 disabled:hover:bg-transparent"
                                >
                                    <i className="fa-solid fa-chevron-right text-sm"></i>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Modal Add/Edit Customer */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm">
                    <div className="w-full max-w-md p-6 mx-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl">
                        <div className="flex justify-between items-center mb-6 pb-2 border-b border-slate-100 dark:border-slate-800/50">
                            <h4 className="font-outfit font-bold text-lg dark:text-white">
                                {editingCustomer ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}
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
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Họ và tên</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white text-sm" 
                                    placeholder="Nguyễn Văn A"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Số điện thoại</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white text-sm" 
                                    placeholder="09xxxxxxxx"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Email</label>
                                <input 
                                    type="email" 
                                    required 
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white text-sm" 
                                    placeholder="email@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                                    Mật khẩu {editingCustomer && <span className="text-slate-400 font-normal">(để trống nếu không đổi)</span>}
                                </label>
                                <input 
                                    type="password" 
                                    required={!editingCustomer}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white text-sm" 
                                    placeholder={editingCustomer ? "••••••••" : "Nhập mật khẩu..."}
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
