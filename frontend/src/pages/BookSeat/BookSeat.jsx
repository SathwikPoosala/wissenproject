import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { format, parseISO } from 'date-fns';
import { FiAlertTriangle, FiCalendar, FiCheckCircle, FiGrid, FiX } from 'react-icons/fi';
import { bookingService } from '../../services/api';
import Button from '../../components/Button/Button';
import Card from '../../components/Card/Card';
import Loading from '../../components/Loading/Loading';
import './BookSeat.css';

const BookSeat = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState('');
  const [seatMap, setSeatMap] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [releaseLoading, setReleaseLoading] = useState(false);
  const [warningOpen, setWarningOpen] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const dateFromQuery = params.get('date');
    if (dateFromQuery) {
      setSelectedDate(dateFromQuery.slice(0, 10));
    }
  }, [location.search]);

  useEffect(() => {
    if (selectedDate) {
      loadDateData(selectedDate);
    }
  }, [selectedDate]);

  const loadDateData = async (dateValue) => {
    setLoading(true);
    setSelectedSeat(null);

    try {
      const seatMapResponse = await bookingService.getSeatMap(dateValue);

      setSeatMap(seatMapResponse.data);

      if (!seatMapResponse.data.isUserScheduled && !seatMapResponse.data.canBookBuffer) {
        setWarningMessage(
          seatMapResponse.data.bufferReason ||
            'Your batch is not scheduled on this day. You can book only as a buffer user between 3:00 PM and 12:00 AM for tomorrow.'
        );
        setWarningOpen(true);
      } else {
        setWarningOpen(false);
      }
    } catch (error) {
      setSeatMap(null);
      toast.error(error.response?.data?.message || 'Failed to load seat map for selected date');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const canSelectSeat = (seat) => {
    return seat.status === 'available' || seat.status === 'buffer';
  };

  const handleSeatClick = (seat) => {
    if (!canSelectSeat(seat)) {
      return;
    }
    setSelectedSeat(seat.seatNumber);
  };

  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedSeat) {
      return;
    }

    setBookingLoading(true);
    try {
      await bookingService.createBooking({
        date: selectedDate,
        seatNumber: selectedSeat,
      });

      toast.success(`Seat ${selectedSeat} booked successfully`);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleReleaseSeat = async () => {
    if (!selectedDate) {
      return;
    }

    setReleaseLoading(true);
    try {
      await bookingService.releaseSeatByDate(selectedDate);
      toast.success('Seat released successfully');
      await loadDateData(selectedDate);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to release seat');
    } finally {
      setReleaseLoading(false);
    }
  };

  const legend = useMemo(
    () => [
      { key: 'available', label: 'Available', className: 'seat-legend-available' },
      { key: 'your-booking', label: 'Your booking', className: 'seat-legend-yours' },
      { key: 'buffer', label: 'Buffer', className: 'seat-legend-buffer' },
      { key: 'full', label: 'Full', className: 'seat-legend-full' },
    ],
    []
  );

  return (
    <div className="book-seat-page">
      <div className="book-seat-container">
        <Card
          title="Book Seat"
          subtitle="Calendar-based booking with seat selection"
          icon={<FiCalendar />}
        >
          <div className="book-seat-controls">
            <label htmlFor="bookingDate" className="book-seat-label">
              Select Date
            </label>
            <input
              id="bookingDate"
              type="date"
              className="book-seat-date-input"
              value={selectedDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={handleDateChange}
            />
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>

          <div className="seat-legend">
            {legend.map((item) => (
              <div key={item.key} className="seat-legend-item">
                <span className={`seat-legend-dot ${item.className}`} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          {!selectedDate ? (
            <div className="seat-empty">Choose a date to load seat map</div>
          ) : loading ? (
            <Loading message="Loading seat map..." />
          ) : !seatMap ? (
            <div className="seat-empty">Seat map unavailable for selected date</div>
          ) : (
            <>
              <div className="seat-meta">
                <p>
                  <strong>Date:</strong> {format(parseISO(selectedDate), 'EEEE, MMMM dd, yyyy')}
                </p>
                <p>
                  <strong>Scheduled Batch:</strong> {seatMap.scheduledBatch}
                </p>
                <p>
                  <strong>Your Batch:</strong> {seatMap.userBatch}
                </p>
                {!seatMap.isUserScheduled && (
                  <>
                    <p>
                      <strong>Total Buffer Seats:</strong> {seatMap.bufferQuota?.total || 0}
                    </p>
                    <p>
                      <strong>Used Buffer Seats:</strong> {seatMap.bufferQuota?.used || 0}
                    </p>
                    <p>
                      <strong>Available Buffer Seats:</strong> {seatMap.bufferQuota?.available || 0}
                    </p>
                  </>
                )}
              </div>

              {!seatMap.isUserScheduled && (seatMap.bufferQuota?.available || 0) === 0 && (
                <div className="buffer-full-banner">
                  Buffer seats are full for this day. Ask a scheduled teammate to release a seat.
                </div>
              )}

              {!seatMap.isUserScheduled && (seatMap.bufferQuota?.available || 0) > 0 && !seatMap.canBookBuffer && (
                <div className="buffer-info-banner">
                  {seatMap.bufferReason || 'Buffer booking is not available for this date right now.'}
                </div>
              )}

              <div className="seat-grid" role="grid" aria-label="Seat selection grid">
                {seatMap.seats.map((seat) => {
                  const isSelectable = canSelectSeat(seat);
                  const isSelected = selectedSeat === seat.seatNumber;

                  return (
                    <button
                      key={seat.seatNumber}
                      type="button"
                      className={`seat ${seat.status} ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSeatClick(seat)}
                      disabled={!isSelectable}
                      title={`Seat ${seat.seatNumber}`}
                    >
                      <span className="seat-number">{seat.seatNumber}</span>
                    </button>
                  );
                })}
              </div>

              <div className="seat-actions">
                <div className="seat-selected-info">
                  {selectedSeat ? `Selected Seat: ${selectedSeat}` : 'Select an available seat to continue'}
                </div>
                <div className="seat-action-buttons">
                  <Button
                    variant="outline"
                    onClick={handleReleaseSeat}
                    loading={releaseLoading}
                    disabled={!selectedDate}
                  >
                    Release Seat
                  </Button>
                  <Button
                    onClick={handleConfirmBooking}
                    loading={bookingLoading}
                    disabled={!selectedSeat}
                  >
                    Confirm Booking
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>

      {warningOpen && (
        <div className="warning-modal-overlay" onClick={() => setWarningOpen(false)}>
          <div className="warning-modal" onClick={(event) => event.stopPropagation()}>
            <div className="warning-modal-header">
              <FiAlertTriangle />
              <h3>Schedule Notice</h3>
              <button type="button" onClick={() => setWarningOpen(false)} className="warning-close-btn">
                <FiX />
              </button>
            </div>
            <p>{warningMessage}</p>
            <Button onClick={() => setWarningOpen(false)}>Understood</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookSeat;
