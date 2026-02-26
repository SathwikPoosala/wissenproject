import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { bookingService, scheduleService } from '../../services/api';
import { 
  FiCalendar, FiCheckCircle, FiAlertCircle, FiClock,
  FiTrendingUp, FiArrowRight
} from 'react-icons/fi';
import { addDays, format, isSameDay, parseISO } from 'date-fns';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Loading from '../../components/Loading/Loading';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [decisionBookings, setDecisionBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [actionLoadingKey, setActionLoadingKey] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const startDate = format(new Date(), 'yyyy-MM-dd');
      const endDate = format(addDays(new Date(), 14), 'yyyy-MM-dd');

      const [scheduleData, upcomingData, decisionData, statsData] = await Promise.all([
        scheduleService.getMultiWeekSchedule(2),
        bookingService.getUpcomingBookings(),
        bookingService.getMyBookings({ startDate, endDate }),
        bookingService.getMyStats(),
      ]);

      const twoWeekSchedule = (scheduleData.data.weeks || []).flatMap((week) => week.schedule || []);
      setSchedule(twoWeekSchedule);
      setUpcomingBookings(upcomingData.data || []);
      setDecisionBookings(decisionData.data || []);
      setStats(statsData.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleReleaseBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to release this booking?')) return;

    try {
      await bookingService.releaseBooking(bookingId);
      toast.success('Booking released successfully');
      loadDashboard();
    } catch (error) {
      toast.error('Failed to release booking');
    }
  };

  const getDecisionForDate = (date) => {
    return decisionBookings.find((booking) =>
      isSameDay(parseISO(booking.date), parseISO(date))
    );
  };

  const handleConfirmBookingForDate = async (date) => {
    const loadingKey = `${date}-confirm`;
    setActionLoadingKey(loadingKey);

    try {
      await bookingService.createBooking({ date });
      toast.success('Booking confirmed successfully');
      await loadDashboard();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to confirm booking');
    } finally {
      setActionLoadingKey('');
    }
  };

  const handleReleaseSeatForDate = async (date) => {
    const loadingKey = `${date}-release`;
    setActionLoadingKey(loadingKey);

    try {
      await bookingService.releaseSeatByDate(date);
      toast.success('Seat released for selected date');
      await loadDashboard();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to release seat');
    } finally {
      setActionLoadingKey('');
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextTwoScheduledDays = schedule
    .filter((day) => {
      const dayDate = parseISO(day.date);
      const isFutureOrToday = dayDate >= today;
      return day.isUserScheduled && isFutureOrToday;
    })
    .slice(0, 2);

  if (loading) {
    return <Loading fullScreen message="Loading your dashboard..." />;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1>Welcome back, {user?.name}!</h1>
            <p>Manage your seat bookings and view your schedule</p>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Stats Cards */}
          <div className="stats-grid">
            <Card className="stat-card">
              <div className="stat-content">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <FiCheckCircle />
                </div>
                <div className="stat-details">
                  <p className="stat-label">Total Bookings</p>
                  <h3 className="stat-value">{stats?.totalBookings || 0}</h3>
                  <span className="stat-period">Last 30 days</span>
                </div>
              </div>
            </Card>

            <Card className="stat-card">
              <div className="stat-content">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                  <FiClock />
                </div>
                <div className="stat-details">
                  <p className="stat-label">Upcoming</p>
                  <h3 className="stat-value">{stats?.upcomingBookings || 0}</h3>
                  <span className="stat-period">Confirmed seats</span>
                </div>
              </div>
            </Card>

            <Card className="stat-card">
              <div className="stat-content">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                  <FiTrendingUp />
                </div>
                <div className="stat-details">
                  <p className="stat-label">Buffer Bookings</p>
                  <h3 className="stat-value">{stats?.bufferBookings || 0}</h3>
                  <span className="stat-period">Non-scheduled days</span>
                </div>
              </div>
            </Card>

            <Card className="stat-card">
              <div className="stat-content">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                  <FiAlertCircle />
                </div>
                <div className="stat-details">
                  <p className="stat-label">Released</p>
                  <h3 className="stat-value">{stats?.releasedBookings || 0}</h3>
                  <span className="stat-period">Cancelled bookings</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Booking */}
          <Card
            title="Quick Book (Next 2 Scheduled Days)"
            subtitle="Keep it simple: book from your upcoming scheduled dates"
            icon={<FiCalendar />}
            action={
              <Button variant="outline" onClick={() => navigate('/book-seat')}>
                Book in Advance
              </Button>
            }
          >
            <div className="quick-book-grid">
              {nextTwoScheduledDays.length === 0 ? (
                <div className="quick-book-empty">
                  <FiCalendar />
                  <p>No upcoming scheduled days available right now.</p>
                  <span>Use Book in Advance to select a different date.</span>
                </div>
              ) : (
                nextTwoScheduledDays.map((day) => (
                  <div key={day.date} className="quick-book-card">
                    <div>
                      <p className="quick-book-day">{day.dayName}</p>
                      <h4>{format(parseISO(day.date), 'MMM dd, yyyy')}</h4>
                      {getDecisionForDate(day.date)?.status === 'active' && (
                        <span className="quick-book-status confirmed">Confirmed</span>
                      )}
                      {getDecisionForDate(day.date)?.status === 'released' && (
                        <span className="quick-book-status released">Released</span>
                      )}
                      {!getDecisionForDate(day.date) && (
                        <span className="quick-book-status pending">Pending</span>
                      )}
                    </div>
                    <div className="quick-book-actions">
                      <Button
                        size="small"
                        variant="primary"
                        loading={actionLoadingKey === `${day.date}-confirm`}
                        onClick={() => handleConfirmBookingForDate(format(parseISO(day.date), 'yyyy-MM-dd'))}
                      >
                        Confirm Booking
                      </Button>
                      <Button
                        size="small"
                        variant="outline"
                        loading={actionLoadingKey === `${day.date}-release`}
                        onClick={() => handleReleaseSeatForDate(format(parseISO(day.date), 'yyyy-MM-dd'))}
                      >
                        Release Seat
                      </Button>
                      <Button
                        size="small"
                        variant="ghost"
                        onClick={() => navigate(`/book-seat?date=${format(parseISO(day.date), 'yyyy-MM-dd')}`)}
                      >
                        Pick Seat
                        <FiArrowRight />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <p className="quick-book-note">
              For non-scheduled dates, open Book in Advance. Buffer booking is allowed only between 3:00 PM and 12:00 AM for tomorrow.
            </p>
          </Card>

          {/* Upcoming Bookings */}
          <Card
            title="Upcoming Bookings"
            subtitle={`${upcomingBookings.length} confirmed seat(s)`}
            icon={<FiCheckCircle />}
          >
            <div className="bookings-list">
              {upcomingBookings.length === 0 ? (
                <div className="empty-state">
                  <FiCalendar />
                  <p>No upcoming bookings</p>
                  <span>Book a seat using the schedule above</span>
                </div>
              ) : (
                upcomingBookings.map((booking) => (
                  <div key={booking._id} className="booking-item">
                    <div className="booking-icon">
                      <FiCalendar />
                    </div>
                    <div className="booking-details">
                      <h4>{format(parseISO(booking.date), 'EEEE, MMMM dd, yyyy')}</h4>
                      <p>
                        {booking.isBufferBooking ? (
                          <span className="badge badge-secondary">Buffer Booking</span>
                        ) : (
                          <span className="badge badge-primary">Regular Booking</span>
                        )}
                      </p>
                    </div>
                    <Button
                      size="small"
                      variant="danger"
                      onClick={() => handleReleaseBooking(booking._id)}
                    >
                      Release
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
