import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardView() {
    const [summary, setSummary] = useState(null);
    const [revenue, setRevenue] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const getHeaders = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
        }
    });

    const formatVND = (value) => {
        if (value === undefined || value === null) return '0đ';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return '-';
        const date = new Date(dateTimeString);
        return date.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const headers = getHeaders();
                const [sumRes, revRes, topRes, recentRes] = await Promise.all([
                    axios.get('/api/dashboard/summary', headers),
                    axios.get('/api/dashboard/revenue-by-month', headers),
                    axios.get('/api/dashboard/top-products', headers),
                    axios.get('/api/dashboard/recent-orders', headers)
                ]);

                setSummary(sumRes.data);
                
                // Format revenue month data: convert month number to T1, T2...
                const formattedRev = Array(12).fill(0).map((_, i) => ({
                    month: `T${i + 1}`,
                    revenue: 0
                }));
                revRes.data.forEach(item => {
                    const idx = item.month - 1;
                    if (idx >= 0 && idx < 12) {
                        formattedRev[idx].revenue = item.revenue;
                    }
                });
                setRevenue(formattedRev);
                
                setTopProducts(topRes.data);
                setRecentOrders(recentRes.data);
            } catch (err) {
                console.error("Dashboard load error", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-80 gap-3">
                <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                <p className="text-sm text-slate-500 animate-pulse">Đang tải dữ liệu dashboard...</p>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-800 text-xs shadow-lg font-semibold">
                    <p className="text-slate-400 mb-1">Doanh thu tháng</p>
                    <p className="text-sm text-primary-300 font-bold">{formatVND(payload[0].value)}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Revenue Card */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/50 shadow-sm flex items-center justify-between">
                    <div className="space-y-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Tổng doanh thu</span>
                        <h3 className="text-3xl font-bold font-outfit text-slate-900 dark:text-white">
                            {formatVND(summary?.totalRevenue)}
                        </h3>
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full font-bold">
                            <i className="fa-solid fa-arrow-trend-up"></i> +12%
                        </span>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 flex items-center justify-center text-xl shadow-inner">
                        <i className="fa-solid fa-money-bill-wave"></i>
                    </div>
                </div>
                {/* Orders Card */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/50 shadow-sm flex items-center justify-between">
                    <div className="space-y-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Tổng đơn hàng</span>
                        <h3 class="text-3xl font-bold font-outfit text-slate-900 dark:text-white">
                            {summary?.totalOrders || 0}
                        </h3>
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-full font-bold">
                            {summary?.pendingOrders || 0} chờ duyệt
                        </span>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-amber-500 flex items-center justify-center text-xl shadow-inner">
                        <i className="fa-solid fa-cart-shopping"></i>
                    </div>
                </div>
                {/* Users Card */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/50 shadow-sm flex items-center justify-between">
                    <div className="space-y-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Tổng khách hàng</span>
                        <h3 class="text-3xl font-bold font-outfit text-slate-900 dark:text-white">
                            {summary?.totalCustomers || 0}
                        </h3>
                        <span className="inline-flex items-center gap-1 text-[10px] text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/20 px-2 py-0.5 rounded-full font-bold">
                            Active Users
                        </span>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-950/30 text-primary-500 flex items-center justify-center text-xl shadow-inner">
                        <i className="fa-solid fa-users"></i>
                    </div>
                </div>
            </div>

            {/* Chart and Products breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Container */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/50 shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="font-outfit font-bold text-slate-800 dark:text-white">Biểu đồ doanh thu theo tháng</h4>
                        <span className="text-xs text-slate-400">Năm 2026</span>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenue}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150, 150, 150, 0.08)"/>
                                <XAxis dataKey="month" tickLine={false} axisLine={false} style={{ fontSize: '12px', fill: '#94a3b8' }}/>
                                <YAxis tickLine={false} axisLine={false} style={{ fontSize: '12px', fill: '#94a3b8' }} tickFormatter={(val) => val >= 1e6 ? `${val / 1e6}M` : val}/>
                                <Tooltip content={<CustomTooltip />}/>
                                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Selling Products */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/50 shadow-sm flex flex-col justify-between">
                    <div>
                        <h4 className="font-outfit font-bold text-slate-800 dark:text-white mb-4">Sản phẩm bán chạy nhất</h4>
                        <div className="space-y-4 max-h-[290px] overflow-y-auto pr-1">
                            {topProducts.length === 0 ? (
                                <div className="text-center py-10 text-sm text-slate-400">
                                    <i className="fa-solid fa-folder-open text-2xl mb-2 block opacity-40"></i>
                                    Chưa có dữ liệu
                                </div>
                            ) : (
                                topProducts.map((prod, index) => (
                                    <div key={prod.productId} className="flex items-center gap-3.5 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-800/30">
                                        <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-primary-100 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 font-bold text-xs">
                                            {index + 1}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-sm font-semibold truncate block dark:text-white" title={prod.productName}>{prod.productName}</span>
                                            <span className="text-xs text-slate-400 dark:text-slate-500">ID: {prod.productId}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold px-2 py-0.5 rounded-full">{prod.totalQuantity} đã bán</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Orders table */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/50 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                    <h4 className="font-outfit font-bold text-slate-800 dark:text-white">Đơn hàng mới nhất</h4>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-xs font-semibold uppercase">
                                <th className="py-3 px-4">Mã đơn</th>
                                <th class="py-3 px-4">Khách hàng</th>
                                <th class="py-3 px-4">Ngày đặt</th>
                                <th class="py-3 px-4 text-right">Tổng cộng</th>
                                <th class="py-3 px-4">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {recentOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-10 text-center text-slate-400">
                                        <i className="fa-solid fa-inbox text-3xl mb-2 block opacity-40"></i>
                                        Không có đơn hàng nào
                                    </td>
                                </tr>
                            ) : (
                                recentOrders.map(order => {
                                    let statusColor = '';
                                    if (order.status === 'Chờ duyệt') statusColor = 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-100 dark:border-amber-900/30';
                                    else if (order.status === 'Đang giao') statusColor = 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-100 dark:border-blue-900/30';
                                    else if (order.status === 'Đã giao') statusColor = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30';
                                    else statusColor = 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-100 dark:border-red-900/30';

                                    return (
                                        <tr key={order.orderId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                                            <td className="py-3.5 px-4 font-semibold text-primary-600 dark:text-primary-400">#{order.orderId}</td>
                                            <td className="py-3.5 px-4 font-medium dark:text-white">{order.customerName}</td>
                                            <td className="py-3.5 px-4 text-slate-400">{formatDateTime(order.orderDate)}</td>
                                            <td className="py-3.5 px-4 text-right font-semibold text-slate-800 dark:text-slate-200">{formatVND(order.totalAmount)}</td>
                                            <td className="py-3.5 px-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border ${statusColor}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
