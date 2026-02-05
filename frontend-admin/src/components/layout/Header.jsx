import React from 'react';
import { Megaphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {

    return (
        <header className="site-header">
            <div className="container header-content">
                {/* Page Title (Placeholder for dynamic title if needed) */}
                <div className="topbar-title">
                    {/* Can be dynamic based on route, for now generic */}
                </div>

                {/* User Actions */}
                <div className="header-actions">
                    <button className="action-btn">
                        <div className="notification-dot"></div>
                        <Megaphone size={20} />
                    </button>
                    <div className="user-profile">
                        <div className="user-avatar">AD</div>
                        <div className="user-info">
                            <span className="user-name">Admin</span>
                            <span className="user-role">Super User</span>
                        </div>
                    </div>
                </div>


            </div>
        </header>
    );
};

export default Header;
