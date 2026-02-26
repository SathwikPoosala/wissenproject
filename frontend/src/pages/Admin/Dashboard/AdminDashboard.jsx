import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { adminService } from '../../../services/api';
import { 
  FiUsers, FiCalendar, FiTrendingUp, FiGrid,
  FiCheckCircle, FiAlertCircle, FiBarChart2
} from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Card from '../../../components/Card/Card';
import Loading from '../../../components/Loading/Loading';
import './AdminDashboard.css';

const COLORS = ['#4F46E5', '#8B5CF6', '#0EA5E9', '#10B981', '#F59E0B'];

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [squadData, setSquadData] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [overviewData, weeklyAnalytics, squads] = await Promise.all([
        adminService.getSystemOverview(),
        adminService.getWeeklyAnalytics(),
        adminService.getSquadAnalytics(),
      ]);

      setOverview(overviewData.data);
      setWeeklyData(weeklyAnalytics.data);
      setSquadData(squads.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen message="Loading admin dashboard..." />;
  }

  const batchData = [
    { name: 'Batch 1', value: overview?.batches?.batch1?.squads || 0 },
    { name: 'Batch 2', value: overview?.batches?.batch2?.squads || 0 },
  ];

  return (
    <div className="admin-dashboard">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>System overview and analytics</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="stats-grid">
          <Card className="stat-card">
            <div className="stat-content">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <FiUsers />
              </div>
              <div className="stat-details">
                <p className="stat-label">Total Employees</p>
                <h3 className="stat-value">{overview?.system?.totalEmployees || 0}</h3>
                <span className="stat-period">
                  {overview?.system?.assignedEmployees || 0} assigned
                </span>
              </div>
            </div>
          </Card>

          <Card className="stat-card">
            <div className="stat-content">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                <FiGrid />
              </div>
              <div className="stat-details">
                <p className="stat-label">Total Squads</p>
                <h3 className="stat-value">{overview?.system?.totalSquads || 0}</h3>
                <span className="stat-period">Active squads</span>
              </div>
            </div>
          </Card>

          <Card className="stat-card">
            <div className="stat-content">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                <FiCalendar />
              </div>
              <div className="stat-details">
                <p className="stat-label">Total Seats</p>
                <h3 className="stat-value">{overview?.system?.totalSeats || 0}</h3>
                <span className="stat-period">Available seats</span>
              </div>
            </div>
          </Card>

          <Card className="stat-card">
            <div className="stat-content">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                <FiTrendingUp />
              </div>
              <div className="stat-details">
                <p className="stat-label">Today's Utilization</p>
                <h3 className="stat-value">{overview?.today?.utilization || 0}%</h3>
                <span className="stat-period">
                  {overview?.today?.totalBookings || 0} / {overview?.system?.totalSeats || 0} seats
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Today's Status */}
        <div className="dashboard-grid">
          <Card
            title="Today's Status"
            subtitle={`${overview?.today?.scheduledBatch || 'N/A'} is scheduled`}
            icon={<FiCalendar />}
          >
            <div className="today-stats">
              <div className="today-stat">
                <div className="today-stat-icon success">
                  <FiCheckCircle />
                </div>
                <div>
                  <h4>{overview?.today?.totalBookings || 0}</h4>
                  <p>Total Bookings</p>
                </div>
              </div>
              <div className="today-stat">
                <div className="today-stat-icon warning">
                  <FiAlertCircle />
                </div>
                <div>
                  <h4>{overview?.today?.bufferBookings || 0}</h4>
                  <p>Buffer Bookings</p>
                </div>
              </div>
              <div className="today-stat">
                <div className="today-stat-icon info">
                  <FiGrid />
                </div>
                <div>
                  <h4>{overview?.today?.availableSeats || 0}</h4>
                  <p>Available Seats</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Batch Distribution */}
          <Card title="Batch Distribution" subtitle="Squad allocation across batches" icon={<FiGrid />}>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={batchData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {batchData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Weekly Analytics */}
        <Card
          title="Weekly Seat Utilization"
          subtitle="Booking trends for the next 7 days"
          icon={<FiBarChart2 />}
        >
          <div className="chart-container-large">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dayName" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalBookings" fill="#4F46E5" name="Total Bookings" />
                <Bar dataKey="bufferBookings" fill="#F59E0B" name="Buffer Bookings" />
                <Bar dataKey="availableSeats" fill="#10B981" name="Available Seats" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Squad Analytics */}
        <Card title="Squad Analytics" subtitle="Performance overview" icon={<FiUsers />}>
          <div className="squad-analytics-grid">
            {squadData.slice(0, 6).map((squad) => (
              <div key={squad.squadId} className="squad-card">
                <div className="squad-header">
                  <h4>{squad.squadName}</h4>
                  <span className={`squad-badge ${squad.batch === 'BATCH_1' ? 'batch-1' : 'batch-2'}`}>
                    {squad.batch}
                  </span>
                </div>
                <div className="squad-stats">
                  <div className="squad-stat">
                    <span className="stat-label">Members</span>
                    <span className="stat-value">{squad.memberCount}/{squad.maxMembers}</span>
                  </div>
                  <div className="squad-stat">
                    <span className="stat-label">Bookings (7d)</span>
                    <span className="stat-value">{squad.bookingsLast7Days}</span>
                  </div>
                  <div className="squad-stat">
                    <span className="stat-label">Avg per Member</span>
                    <span className="stat-value">{squad.averageBookingsPerMember}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
