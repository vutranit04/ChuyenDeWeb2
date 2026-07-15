import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function UsersView({ searchQuery }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ username: '', password: '', fullName: '', email: '', role: 'STAFF' });
    const [error, setError] = useState(null);

    const getHeaders = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
        }
    });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/users', getHeaders());
            setUsers(response.data);
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleOpenAddModal = () => {
        setEditingUser(null);
        setFormData({ username: '', password: '', fullName: '', email: '', role: 'STAFF' });
        setError(null);
        setModalOpen(true);
    };

    const handleOpenEditModal = (user) => {
        setEditingUser(user);
        setFormData({ username: user.username, password: '', fullName: user.fullName || '', email: user.email || '', role: user.role || 'STAFF' });
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
            if (editingUser) {
                // Edit
                await axios.put(`/api/users/${editingUser.userId}`, formData, getHeaders());
            } else {
                // Add
                await axios.post('/api/users', formData, getHeaders());
            }
            fetchUsers();
            setModalOpen(false);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin.');
        }
    };

    const handleDeleteUser = async (id) => {
        if (!confirm('Bạn có chắc chắn muốn xóa nhân sự này không?')) return;
        try {
            await axios.delete(`/api/users/${id}`, getHeaders());
            fetchUsers();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Không thể xóa nhân sự này.');
        }
    };

    // Filter by search query
    const filteredUsers = users.filter(user => {
        const query = searchQuery?.toLowerCase() || '';
        return (
            user.username?.toLowerCase().includes(query) ||
            user.fullName?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query) ||
            user.role?.toLowerCase().includes(query)
        );
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-80 gap-3">
                <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                <p className="text-sm text-slate-500 animate-pulse">Đang tải danh sách nhân sự...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold font-outfit text-slate-900 dark:text-white">Danh sách nhân sự</h3>
                    <p className="text-xs text-slate-500">Quản lý tài khoản quản trị và nhân viên</p>
                </div>
                <button 
                    onClick={handleOpenAddModal}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-emerald-500/20"
                >
                    <i className="fa-solid fa-plus"></i>
                    <span>Thêm nhân sự</span>
                </button>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/50 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-xs font-semibold uppercase">
                                <th className="py-3 px-6">ID</th>
                                <th className="py-3 px-6">Tài khoản</th>
                                <th className="py-3 px-6">Họ và tên</th>
                                <th className="py-3 px-6">Email</th>
                                <th className="py-3 px-6">Vai trò</th>
                                <th className="py-3 px-6 text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center text-slate-400">
                                        <i className="fa-solid fa-users-slash text-3xl mb-2 block opacity-40"></i>
                                        Không tìm thấy nhân sự nào
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user.userId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                                        <td className="py-4 px-6 font-semibold text-slate-500">#{user.userId}</td>
                                        <td className="py-4 px-6 font-medium dark:text-white">{user.username}</td>
                                        <td className="py-4 px-6 dark:text-slate-350">{user.fullName || '-'}</td>
                                        <td className="py-4 px-6 dark:text-slate-350">{user.email || '-'}</td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                user.role === 'ADMIN' 
                                                    ? 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400' 
                                                    : 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400'
                                            }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <div className="flex justify-center items-center gap-2">
                                                <button 
                                                    onClick={() => handleOpenEditModal(user)}
                                                    className="p-2 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                                                    title="Chỉnh sửa"
                                                >
                                                    <i className="fa-solid fa-pen-to-square"></i>
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteUser(user.userId)}
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
                    <div className="w-full max-w-md p-6 mx-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="font-outfit font-bold text-lg dark:text-white">
                                {editingUser ? 'Chỉnh sửa nhân sự' : 'Thêm nhân sự mới'}
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
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Tên tài khoản</label>
                                <input 
                                    type="text" 
                                    required 
                                    disabled={!!editingUser}
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
                                    placeholder="Ví dụ: staff_01"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                                    {editingUser ? 'Mật khẩu mới (Để trống nếu giữ nguyên)' : 'Mật khẩu'}
                                </label>
                                <input 
                                    type="password" 
                                    required={!editingUser}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
                                    placeholder="••••••••"
                                />
                            </div>

                             <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Họ và tên</label>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
                                    placeholder="Ví dụ: Nguyễn Văn A"
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
                                    placeholder="Ví dụ: staff@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Vai trò</label>
                                <select 
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
                                >
                                    <option value="STAFF">STAFF</option>
                                    <option value="ADMIN">ADMIN</option>
                                </select>
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
