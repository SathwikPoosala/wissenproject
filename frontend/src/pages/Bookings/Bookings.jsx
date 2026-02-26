import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { format, parseISO } from 'date-fns';
import { FiCalendar, FiClock } from 'react-icons/fi';
import { bookingService } from '../../services/api';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Loading from '../../components/Loading/Loading';
import './Bookings.css';

const Bookings = () => {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);

  const loadBookings = async () => {
    try {
      const response = await bookingService.getMyBookings();
      setBookings(response.data || []);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleRelease = async (bookingId) => {
    if (!window.confirm('Are you sure you want to release this booking?')) return;

    try {
      await bookingService.releaseBooking(bookingId);
      toast.success('Booking released successfully');
      loadBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to release booking');
    }
  };

  if (loading) {
    return <Loading fullScreen message="Loading your bookings..." />;
  }

  return (
    <div className="bookings-page">
      <div className="bookings-container">
        <div className="bookings-header">
          <h1>My Bookings</h1>
          <p>View and manage all your seat reservations</p>
        </div>

        <Card title="All Bookings" subtitle={`${bookings.length} booking(s) found`} icon={<FiCalendar />}>
          {bookings.length === 0 ? (
            <div className="bookings-empty">
              <FiClock />
              <p>No bookings found</p>
            </div>
          ) : (
            <div className="bookings-list">
              {bookings.map((booking) => {
                const isActive = booking.status === 'active';
                return (
                  <div key={booking._id} className="bookings-item">
                    <div>
                      <h4>{format(parseISO(booking.date), 'EEEE, MMMM dd, yyyy')}</h4>
                      <p>
                        <span className={`bookings-badge ${isActive ? 'active' : 'released'}`}>
                          {booking.isBufferBooking ? 'Buffer' : 'Regular'} · {booking.status}
                        </span>
                      </p>
                    </div>
                    {isActive && (
                      <Button variant="danger" size="small" onClick={() => handleRelease(booking._id)}>
                        Release
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Bookings;
