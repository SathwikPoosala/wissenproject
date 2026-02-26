import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { FiLogOut, FiUser, FiCalendar, FiGrid, FiUsers, FiBarChart2, FiMapPin } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <FiCalendar className="navbar-brand-icon" />
          <span>Smart Seat Booking</span>
        </Link>

        <div className="navbar-menu">
          {isAdmin() ? (
            <>
              <Link to="/admin/dashboard" className="navbar-link">
                <FiGrid />
                <span>Dashboard</span>
              </Link>
              <Link to="/admin/squads" className="navbar-link">
                <FiUsers />
                <span>Squads</span>
              </Link>
              <Link to="/admin/analytics" className="navbar-link">
                <FiBarChart2 />
                <span>Analytics</span>
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="navbar-link">
                <FiGrid />
                <span>Dashboard</span>
              </Link>
              <Link to="/book-seat" className="navbar-link">
                <FiMapPin />
                <span>Book Seat</span>
              </Link>
              <Link to="/bookings" className="navbar-link">
                <FiCalendar />
                <span>My Bookings</span>
              </Link>
            </>
          )}
        </div>

        <div className="navbar-actions">
          <div className="navbar-user">
            <FiUser />
            <span>{user?.name}</span>
          </div>
          <button onClick={handleLogout} className="navbar-logout">
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
