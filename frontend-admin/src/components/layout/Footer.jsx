import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="admin-footer">
            <div className="container footer-content">
                <div className="copyright">
                    &copy; 2026 <strong>Tafa Business Admin</strong>. v1.0.0
                </div>
                <div className="admin-links">
                    <span className="system-status online">● Système Opérationnel</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
