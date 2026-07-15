import React, { useState, useEffect } from 'react';

export default function Header({ activeTab, onSearch, onToggleSidebar, onLogout }) {
    const [searchVal, setSearchVal] = useState('');
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const fullName = localStorage.getItem('fullName') || 'User';
    const role = localStorage.getItem('role') || 'STAFF';
    const avatarInit = fullName.charAt(0).toUpperCase();

    // Toggle theme implementation
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    // Auto close dropdowns
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (!e.target.closest('.dropdown-trigger')) {
                setShowNotifications(false);
                setShowUserMenu(false);
            }
        };
        window.addEventListener('click', handleOutsideClick);
        return () => window.removeEventListener('click', handleOutsideClick);
    }, []);

    const tabNames = {
        dashboard: 'Bảng điều khiển',
        users: 'Quản lý nhân sự',
        customers: 'Quản lý khách hàng',
        categories: 'Danh mục sản phẩm',
        products: 'Quản lý sản phẩm',
        'category-posts': 'Danh mục bài viết',
        posts: 'Quản lý bài viết',
        banners: 'Quản lý Banner',
        orders: 'Quản lý đơn hàng',
        addresses: 'Địa chỉ giao hàng'
    };

    const searchPlaceholder = {
        users: 'Tìm kiếm nhân viên...',
        customers: 'Tìm kiếm khách hàng...',
        products: 'Tìm kiếm sản phẩm...',
        posts: 'Tìm kiếm bài viết...',
        banners: 'Tìm kiếm banner...',
        orders: 'Tìm kiếm đơn hàng...',
        categories: 'Tìm kiếm danh mục...',
        'category-posts': 'Tìm kiếm danh mục...'
    }[activeTab] || 'Tìm kiếm nhanh...';

    const showSearch = ['users', 'customers', 'products', 'posts', 'banners', 'orders', 'categories', 'category-posts'].includes(activeTab);

    return (
        <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
            {/* Left Side */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={onToggleSidebar} 
                    className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden"
                >
                    <i className="fa-solid fa-bars-staggered text-lg"></i>
                </button>
                <h1 className="font-outfit text-xl font-bold text-slate-800 dark:text-white">
                    {tabNames[activeTab] || activeTab}
                </h1>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
                {/* Search Bar (conditional) */}
                {showSearch && (
                    <div className="relative hidden md:block w-64">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                            <i className="fa-solid fa-magnifying-glass text-sm"></i>
                        </span>
                        <input 
                            type="text" 
                            value={searchVal}
                            onChange={(e) => {
                                setSearchVal(e.target.value);
                                onSearch(e.target.value);
                            }}
                            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white" 
                            placeholder={searchPlaceholder}
                        />
                    </div>
                )}

                {/* Theme toggle */}
              

                {/* Notifications */}
     

                {/* User menu */}
                <div className="relative dropdown-trigger">
                    <button 
                        onClick={() => {
                            setShowUserMenu(!showUserMenu);
                            setShowNotifications(false);
                        }} 
                        className="flex items-center gap-3 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all border border-slate-200/60 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50"
                    >
                        <div className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                            {avatarInit}
                        </div>
                        <div className="hidden sm:flex flex-col text-left mr-1">
                            <span className="text-xs text-slate-400 leading-none">Tài khoản</span>
                            <span className="text-sm font-semibold text-slate-800 dark:text-white mt-0.5">{fullName}</span>
                        </div>
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                            role === 'ADMIN' 
                                ? 'bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400' 
                                : 'bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400'
                        }`}>
                            {role}
                        </span>
                        <i className="fa-solid fa-chevron-down text-slate-400 text-xs mr-1"></i>
                    </button>
                    {showUserMenu && (
                        <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 py-2">
                            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/50">
                                <p className="text-xs text-slate-400">Đang đăng nhập</p>
                                <p className="text-sm font-semibold truncate dark:text-white">{fullName}</p>
                                <span className="inline-block text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold px-2 py-0.5 rounded mt-1">{role}</span>
                            </div>
                            <button 
                                onClick={onLogout} 
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all text-left"
                            >
                                <i className="fa-solid fa-arrow-right-from-bracket text-sm"></i>
                                <span>Đăng xuất</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
