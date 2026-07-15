import React from 'react';

export default function Sidebar({ activeTab, onTabChange, isSidebarOpen, onCloseSidebar }) {
    const fullName = localStorage.getItem('fullName') || 'User';
    const role = localStorage.getItem('role') || 'STAFF';
    const avatarInit = fullName.charAt(0).toUpperCase();

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
        { id: 'users', label: 'Quản lý nhân sự', icon: 'fa-user-group' },
        { id: 'customers', label: 'Quản lý khách hàng', icon: 'fa-users' },
        { id: 'categories', label: 'Danh mục sản phẩm', icon: 'fa-tags' },
        { id: 'products', label: 'Quản lý sản phẩm', icon: 'fa-box' },
        { id: 'category-posts', label: 'Danh mục bài viết', icon: 'fa-folder-open' },
        { id: 'posts', label: 'Quản lý bài viết', icon: 'fa-newspaper' },
        { id: 'banners', label: 'Quản lý Banner', icon: 'fa-images' },
        { id: 'orders', label: 'Quản lý đơn hàng', icon: 'fa-cart-shopping' },
        { id: 'addresses', label: 'Địa chỉ giao hàng', icon: 'fa-location-dot' }
    ];

    return (
        <>
            {/* Backdrop for mobile */}
            {isSidebarOpen && (
                <div 
                    onClick={onCloseSidebar} 
                    className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden"
                />
            )}

            <aside 
                className={`fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 transform lg:translate-x-0 lg:static lg:inset-auto ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* <!-- Sidebar Header --> */}
                <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 dark:border-slate-800/50">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-700 text-white text-lg font-outfit font-bold shadow-md shadow-primary-500/25">
                        MV
                    </div>
                    <div>
                        <span class="font-outfit font-bold text-lg leading-none block dark:text-white">Minh Vũ Store</span>
                        <span class="text-xs text-primary-600 dark:text-primary-400 font-semibold tracking-wider uppercase">Quản trị</span>
                    </div>
                </div>

                {/* <!-- Navigation links --> */}
                <nav class="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                            <a
                                key={item.id}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    onTabChange(item.id);
                                    onCloseSidebar();
                                }}
                                className={`flex items-center gap-3.5 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                                    isActive
                                        ? 'bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400'
                                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-primary-600 dark:hover:text-primary-400'
                                }`}
                            >
                                <i className={`fa-solid ${item.icon} text-lg w-5 text-center`}></i>
                                <span>{item.label}</span>
                            </a>
                        );
                    })}
                </nav>
{/* <!-- Profile summary footer --> */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800/50">
                    <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                        <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold">
                            {avatarInit}
                        </div>
                        <div className="flex-1 min-w-0">
                            <span className="text-sm font-semibold block truncate dark:text-white">{fullName}</span>
                            <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded mt-1 ${
                                role === 'ADMIN' 
                                    ? 'bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400' 
                                    : 'bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400'
                            }`}>
                                {role}
                            </span>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
