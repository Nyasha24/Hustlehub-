import React, { useState, useEffect, useMemo } from 'react';
import { fetchBookings, updateBookingStatus } from '../services/api';

function ClientOrdersView({ user, onSelectBookingForCelebration }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const loadBookings = async (manual = false) => {
    if (manual) setIsRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const data = await fetchBookings();
      setBookings(data || []);
      if (data && data.length > 0 && !expandedId) {
        setExpandedId(data[0]._id);
      }
      if (manual) {
        setToastMessage('Orders and escrow milestones synchronized successfully.');
        setTimeout(() => setToastMessage(null), 3500);
      }
    } catch (err) {
      setError(err.message || 'Failed to load bookings');
      if (manual) {
        setToastMessage(`Sync failed: ${err.message}`);
        setTimeout(() => setToastMessage(null), 4000);
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleStatusChange = async (e, booking, newStatus) => {
    e.stopPropagation();
    setUpdatingId(booking._id);
    try {
      const updated = await updateBookingStatus(booking._id, newStatus);
      setBookings((prev) =>
        prev.map((b) => (b._id === booking._id ? { ...b, status: newStatus } : b))
      );
      if (newStatus === 'completed' && onSelectBookingForCelebration) {
        const completedBooking = updated.data || updated.booking || updated;
        onSelectBookingForCelebration({
          ...completedBooking,
          amount: completedBooking.amount || booking.amount || booking.gig?.price || 0
        });
      }
    } catch (err) {
      alert(`Could not update order status: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return { bg: 'rgba(245, 158, 11, 0.12)', border: '#f59e0b', color: '#fbbf24', text: 'Pending Approval' };
      case 'confirmed':
        return { bg: 'rgba(226, 217, 204, 0.12)', border: '#e2d9cc', color: '#e2d9cc', text: 'Escrow Locked' };
      case 'accepted':
      case 'in_progress':
        return { bg: 'rgba(226, 217, 204, 0.12)', border: '#e2d9cc', color: '#e2d9cc', text: 'In Progress' };
      case 'completed':
        return { bg: 'rgba(255, 255, 255, 0.1)', border: 'rgba(255, 255, 255, 0.4)', color: '#ffffff', text: 'Completed & Settled' };
      case 'rejected':
        return { bg: 'rgba(239, 68, 68, 0.12)', border: '#ef4444', color: '#f87171', text: 'Declined' };
      case 'cancelled':
        return { bg: 'rgba(148, 163, 184, 0.12)', border: '#64748b', color: '#94a3b8', text: 'Cancelled' };
      default:
        return { bg: 'rgba(255, 255, 255, 0.08)', border: '#94a3b8', color: '#ffffff', text: status };
    }
  };

  // Metrics Calculations
  const metrics = useMemo(() => {
    let totalVolume = 0;
    let activeVolume = 0;
    let completedVolume = 0;
    let activeCount = 0;
    let completedCount = 0;

    bookings.forEach((b) => {
      const amt = Number(b.amount ?? b.gig?.price ?? b.totalPrice ?? 0);
      totalVolume += amt;
      if (['pending', 'confirmed', 'accepted', 'in_progress'].includes(b.status)) {
        activeVolume += amt;
        activeCount += 1;
      } else if (b.status === 'completed') {
        completedVolume += amt;
        completedCount += 1;
      }
    });

    return { totalVolume, activeVolume, completedVolume, activeCount, completedCount };
  }, [bookings]);

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    if (filter === 'active') {
      return bookings.filter((b) => ['pending', 'confirmed', 'accepted', 'in_progress'].includes(b.status));
    }
    if (filter === 'completed') {
      return bookings.filter((b) => b.status === 'completed');
    }
    if (filter === 'cancelled') {
      return bookings.filter((b) => ['cancelled', 'rejected'].includes(b.status));
    }
    return bookings;
  }, [bookings, filter]);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '100px 20px 40px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', color: '#e2d9cc', fontWeight: '800' }}>
            {user?.role === 'freelancer' ? 'FREELANCER WORK QUEUE' : 'CLIENT ORDER HISTORY & ESCROWS'}
          </span>
          <h2 className="font-serif" style={{ fontSize: '34px', color: '#ffffff', margin: '6px 0 0', fontWeight: '400' }}>
            {user?.role === 'freelancer' ? 'Manage Incoming Bookings & Escrows' : 'Your Booked Services & Escrow Ledger'}
          </h2>
        </div>
        <button
          onClick={() => loadBookings(true)}
          disabled={isRefreshing}
          className="btn-secondary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            fontSize: '13px',
            cursor: isRefreshing ? 'wait' : 'pointer',
            border: '1px solid rgba(226, 217, 204, 0.3)',
            color: '#e2d9cc'
          }}
        >
          <svg
            style={{
              width: '14px',
              height: '14px',
              animation: isRefreshing ? 'spinSync 0.8s linear infinite' : 'none',
              transformOrigin: 'center center'
            }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
          <span>{isRefreshing ? 'Synchronizing...' : 'Refresh Orders'}</span>
        </button>
      </div>

      {/* Aggregate Escrow Metric Summary Cards (Warm Beige & Crisp White Palette) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {/* Total Escrow Volume */}
        <div className="glass-card spring-hover" style={{ padding: '20px', borderRadius: '14px' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', display: 'block', marginBottom: '6px', fontWeight: '700' }}>
            Total Escrow Volume
          </span>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.5px' }}>
            R{metrics.totalVolume.toLocaleString()}
          </div>
          <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginTop: '4px' }}>
            Across {bookings.length} registered service order{bookings.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Active In-Flight Escrows - Warm Beige Accent */}
        <div className="glass-card spring-hover" style={{ padding: '20px', borderRadius: '14px', borderLeft: '3px solid #e2d9cc' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#e2d9cc', display: 'block', marginBottom: '6px', fontWeight: '700' }}>
            Active In-Flight Escrows
          </span>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.5px' }}>
            R{metrics.activeVolume.toLocaleString()}
          </div>
          <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginTop: '4px' }}>
            {metrics.activeCount} order{metrics.activeCount === 1 ? '' : 's'} secured in smart contract vault
          </span>
        </div>

        {/* Completed & Disbursed - Crisp White Accent */}
        <div className="glass-card spring-hover" style={{ padding: '20px', borderRadius: '14px', borderLeft: '3px solid #ffffff' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#ffffff', display: 'block', marginBottom: '6px', fontWeight: '700' }}>
            Completed & Disbursed
          </span>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.5px' }}>
            R{metrics.completedVolume.toLocaleString()}
          </div>
          <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginTop: '4px' }}>
            {metrics.completedCount} successfully fulfilled service{metrics.completedCount === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: `All Orders (${bookings.length})` },
          { key: 'active', label: `Active / Escrow Locked (${metrics.activeCount})` },
          { key: 'completed', label: `Completed (${metrics.completedCount})` },
          { key: 'cancelled', label: 'Declined / Cancelled' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`category-pill ${filter === tab.key ? 'active' : ''}`}
            style={{ fontSize: '12px', padding: '6px 14px' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ padding: '14px 18px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: '10px', color: '#fca5a5', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#e2d9cc' }}>
          <div className="spinner" style={{ marginBottom: '16px' }}></div>
          <p style={{ color: '#94a3b8' }}>Fetching your verified booking records...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '50px 20px', borderRadius: '16px' }}>
          <svg style={{ width: '48px', height: '48px', color: '#94a3b8', margin: '0 auto 12px auto', display: 'block' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
          <h3 style={{ color: '#ffffff', fontSize: '20px', marginBottom: '8px' }}>No Orders Found</h3>
          <p style={{ color: '#94a3b8', fontSize: '14px', maxWidth: '420px', margin: '0 auto' }}>
            {filter !== 'all'
              ? 'There are no orders matching this filter.'
              : user?.role === 'freelancer'
              ? 'You do not have any incoming client service orders yet. Create and publish gigs in your Freelancer Hub to receive bookings.'
              : 'You have not booked any freelance gigs yet. Browse the marketplace to book verified services with escrow security.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredBookings.map((booking) => {
            const badge = getStatusBadge(booking.status);
            const isClient = user?.role === 'client' || (booking.client && (booking.client._id === user?._id || booking.client === user?._id));
            const isFreelancer = user?.role === 'freelancer' || (booking.freelancer && (booking.freelancer._id === user?._id || booking.freelancer === user?._id));
            const isAdmin = user?.role === 'admin';
            
            const price = Number(booking.amount ?? booking.gig?.price ?? booking.totalPrice ?? 0);
            const platformFee = Math.round(price * 0.10 * 100) / 100;
            const netPayout = Math.round((price - platformFee) * 100) / 100;

            const counterpartyName = isClient
              ? (booking.freelancer?.fullName || 'Verified Freelancer')
              : (booking.client?.fullName || 'Client');
            const counterpartyEmail = isClient
              ? (booking.freelancer?.email || 'H²⁺ Partner')
              : (booking.client?.email || 'H²⁺ Client');

            const isExpanded = expandedId === booking._id;

            return (
              <div
                key={booking._id}
                className="glass-card clickable-card"
                onClick={() => setExpandedId(isExpanded ? null : booking._id)}
                style={{
                  padding: '22px 24px',
                  borderRadius: '16px',
                  borderLeft: `4px solid ${badge.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: isExpanded ? 'rgba(16, 26, 29, 0.92)' : 'rgba(12, 19, 21, 0.78)',
                  borderColor: isExpanded ? 'rgba(226, 217, 204, 0.4)' : 'rgba(255, 255, 255, 0.1)'
                }}
              >
                {/* Collapsed Top Header: Order ID, Title, Counterparty, Escrow Amount, Status Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                  <div style={{ flex: '1 1 280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '1px', fontWeight: '700' }}>
                        ORDER #{booking._id?.slice(-8).toUpperCase()}
                      </span>
                      <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>•</span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recent'}
                      </span>
                    </div>
                    <h3 style={{ color: '#ffffff', fontSize: '18px', margin: 0, fontWeight: '700', lineHeight: 1.3 }}>
                      {booking.gig?.title || 'Custom Service Order'}
                    </h3>
                  </div>

                  {/* Counterparty summary */}
                  <div style={{ textAlign: 'left', minWidth: '150px' }}>
                    <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', display: 'block', letterSpacing: '0.5px' }}>
                      {isClient ? 'Freelancer' : 'Client'}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#f1f5f9' }}>
                      {counterpartyName}
                    </span>
                  </div>

                  {/* Escrow Amount */}
                  <div style={{ textAlign: 'right', minWidth: '130px' }}>
                    <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', display: 'block', letterSpacing: '0.5px' }}>
                      Total Escrow
                    </span>
                    <span style={{ fontSize: '18px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.3px' }}>
                      R{price.toLocaleString()}
                    </span>
                  </div>

                  {/* Status Badge & Expand Toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '5px 12px',
                        borderRadius: '20px',
                        background: badge.bg,
                        border: `1px solid ${badge.border}`,
                        color: badge.color,
                        letterSpacing: '0.4px'
                      }}
                    >
                      {badge.text}
                    </span>

                    <button
                      type="button"
                      aria-label="Toggle details"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        padding: '6px 10px',
                        color: isExpanded ? '#ffffff' : '#94a3b8',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {isExpanded ? 'Collapse ▲' : 'Details ▼'}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div
                    style={{
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                      paddingTop: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Project Specifications */}
                    <div style={{ background: 'rgba(0, 0, 0, 0.35)', padding: '14px 16px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#e2d9cc', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <svg style={{ width: '13px', height: '13px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                        Project Scope & Deliverable Requirements:
                      </span>
                      <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                        {booking.requirements || 'No custom requirements specified.'}
                      </p>
                    </div>

                    {/* Escrow Financial Ledger Breakdown */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '12px',
                        background: 'rgba(0, 0, 0, 0.25)',
                        padding: '14px 16px',
                        borderRadius: '10px',
                        border: '1px solid rgba(255, 255, 255, 0.06)'
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Base Price</span>
                        <span style={{ fontSize: '15px', fontWeight: '800', color: '#ffffff' }}>
                          R{price.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Protocol Platform Fee (10%)</span>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: '#cbd5e1' }}>
                          R{platformFee.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Net Freelancer Disbursal</span>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff' }}>
                          R{netPayout.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Escrow Security Vault</span>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: booking.status === 'completed' ? '#ffffff' : '#e2d9cc', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <svg style={{ width: '13px', height: '13px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                          </svg>
                          {booking.status === 'completed' ? 'Funds Disbursed & Settled' : 'Smart Escrow Locked'}
                        </span>
                      </div>
                    </div>

                    {/* Counterparty Contact & Verification */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', background: 'rgba(255, 255, 255, 0.02)', padding: '10px 14px', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: '12px', fontWeight: '700' }}>
                          {counterpartyName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span style={{ fontSize: '12px', color: '#ffffff', fontWeight: '700', marginRight: '6px' }}>{counterpartyName}</span>
                          <span style={{ fontSize: '10px', color: '#e2d9cc', background: 'rgba(226, 217, 204, 0.1)', padding: '1px 5px', borderRadius: '4px', border: '1px solid rgba(226, 217, 204, 0.25)' }}>Verified Partner</span>
                          <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>{counterpartyEmail}</span>
                        </div>
                      </div>

                      {/* Action Buttons for Lifecycle Management */}
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {/* Client Cancel Pending */}
                        {isClient && ['pending', 'confirmed'].includes(booking.status) && (
                          <button
                            onClick={(e) => handleStatusChange(e, booking, 'cancelled')}
                            disabled={updatingId === booking._id}
                            style={{
                              padding: '8px 14px',
                              borderRadius: '8px',
                              border: '1px solid rgba(239, 68, 68, 0.5)',
                              background: 'rgba(239, 68, 68, 0.1)',
                              color: '#f87171',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            {updatingId === booking._id ? 'Cancelling...' : 'Cancel & Refund Escrow'}
                          </button>
                        )}

                        {/* Freelancer / Admin Actions */}
                        {(isFreelancer || isAdmin) && ['pending', 'confirmed'].includes(booking.status) && (
                          <>
                            <button
                              onClick={(e) => handleStatusChange(e, booking, 'rejected')}
                              disabled={updatingId === booking._id}
                              style={{
                                padding: '8px 14px',
                                borderRadius: '8px',
                                border: '1px solid rgba(239, 68, 68, 0.5)',
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: '#f87171',
                                fontSize: '12px',
                                fontWeight: '700',
                                cursor: 'pointer'
                              }}
                            >
                              Decline
                            </button>
                            <button
                              onClick={(e) => handleStatusChange(e, booking, 'accepted')}
                              disabled={updatingId === booking._id}
                              className="btn-primary"
                              style={{ padding: '8px 16px', fontSize: '12px' }}
                            >
                              {updatingId === booking._id ? 'Updating...' : 'Accept Job'}
                            </button>
                          </>
                        )}

                        {(isFreelancer || isAdmin) && ['accepted', 'in_progress'].includes(booking.status) && (
                          <button
                            onClick={(e) => handleStatusChange(e, booking, 'completed')}
                            disabled={updatingId === booking._id}
                            style={{
                              padding: '8px 16px',
                              borderRadius: '8px',
                              border: '1px solid rgba(255, 255, 255, 0.3)',
                              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
                              color: '#ffffff',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
                            }}
                          >
                            {updatingId === booking._id ? 'Releasing Escrow...' : 'Complete & Release Escrow Funds'}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setExpandedId(null)}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            background: 'transparent',
                            color: '#94a3b8',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Close Details ▲
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Synchronized Feedback Toast */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            background: 'rgba(15, 23, 26, 0.95)',
            border: '1px solid rgba(226, 217, 204, 0.3)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
            borderRadius: '12px',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: '500',
            zIndex: 99999,
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            animation: 'toastSlideUp 0.3s ease-out'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e2d9cc" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default ClientOrdersView;
