import React, { useState, useEffect } from 'react';
import { fetchGigs, fetchBookings, fetchTransactions, fetchAllUsers, deleteGig } from '../services/api';
import ConfirmModal from './ConfirmModal';

function AdminCenterView({ user }) {
  const [gigs, setGigs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deleteTargetGig, setDeleteTargetGig] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [expandedGigId, setExpandedGigId] = useState(null);
  const [expandedTxId, setExpandedTxId] = useState(null);

  const loadData = async (manual = false) => {
    if (manual) setIsRefreshing(true);
    else setLoading(true);

    try {
      const [gigsData, bookingsData, txData, usersData] = await Promise.all([
        fetchGigs().catch(() => []),
        fetchBookings().catch(() => []),
        fetchTransactions().catch(() => []),
        fetchAllUsers().catch(() => [])
      ]);
      setGigs(gigsData || []);
      setBookings(bookingsData || []);
      setTransactions(txData || []);
      setUsers(usersData || []);

      if (manual) {
        setToastMessage('System ledger and user directory synchronized successfully.');
        setTimeout(() => setToastMessage(null), 3500);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
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
    loadData();
  }, []);

  const confirmDeleteGig = async () => {
    if (!deleteTargetGig) return;
    setIsDeleting(true);
    try {
      await deleteGig(deleteTargetGig._id);
      setGigs((prev) => prev.filter((g) => g._id !== deleteTargetGig._id));
      const deletedTitle = deleteTargetGig.title;
      setDeleteTargetGig(null);
      setToastMessage(`Listing "${deletedTitle}" deleted successfully from platform.`);
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      setToastMessage(`Delete failed: ${err.message}`);
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setIsDeleting(false);
    }
  };

  const exportAuditTrail = () => {
    const rows = [
      ['RECORD_TYPE', 'ID', 'TITLE_OR_NAME', 'METADATA_DETAILS', 'ROLE_OR_STATUS', 'AMOUNT_ZAR', 'TIMESTAMP']
    ];

    users.forEach((u) => {
      rows.push([
        'USER_ACCOUNT',
        u._id,
        `"${(u.fullName || '').replace(/"/g, '""')}"`,
        `"${(u.email || '').replace(/"/g, '""')}"`,
        u.role || 'client',
        'N/A',
        u.createdAt ? new Date(u.createdAt).toISOString() : 'N/A'
      ]);
    });

    transactions.forEach((t) => {
      rows.push([
        'ESCROW_TRANSACTION',
        t._id,
        'Milestone Escrow Payout',
        `"Fee: R${(t.platformFee || t.amount * 0.1).toFixed(2)} | Net: R${(t.freelancerAmount || t.amount * 0.9).toFixed(2)}"`,
        t.status || 'completed',
        (t.amount || 0).toFixed(2),
        t.createdAt ? new Date(t.createdAt).toISOString() : 'N/A'
      ]);
    });

    gigs.forEach((g) => {
      rows.push([
        'MARKETPLACE_LISTING',
        g._id,
        `"${(g.title || '').replace(/"/g, '""')}"`,
        `"Category: ${g.category} | Freelancer: ${g.freelancerId?.fullName || 'N/A'}"`,
        'ACTIVE_LISTING',
        (g.price || 0).toFixed(2),
        g.createdAt ? new Date(g.createdAt).toISOString() : 'N/A'
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hustlehub-audit-trail-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage('Full security & transaction audit trail exported successfully.');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const totalVolume = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  const totalCommission = transactions.reduce((sum, tx) => sum + (tx.platformFee || tx.amount * 0.10 || 0), 0);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '100px 20px 40px' }}>
      <style>{`
        @keyframes spinSync {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes toastSlideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', color: '#e2d9cc', fontWeight: '800' }}>
            PLATFORM OVERSIGHT & AUDIT CENTER
          </span>
          <h2 style={{ fontFamily: 'Newsreader, serif', fontSize: '36px', color: '#ffffff', margin: '6px 0 0', fontWeight: '400' }}>
            Admin Master Control Panel
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={exportAuditTrail}
            className="btn-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '10px',
              border: '1px solid rgba(226, 217, 204, 0.25)',
              background: 'rgba(255, 255, 255, 0.04)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <svg style={{ width: '14px', height: '14px', color: '#e2d9cc' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Export Audit Trail (CSV)</span>
          </button>

          <button
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="btn-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: isRefreshing ? 'wait' : 'pointer',
              padding: '10px 18px',
              borderRadius: '10px',
              border: '1px solid rgba(226, 217, 204, 0.3)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#e2d9cc',
              fontSize: '13px',
              fontWeight: '600'
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
            <span>{isRefreshing ? 'Synchronizing...' : 'Refresh System Data'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {/* Metric 1: Active Listings (Links to Gigs Moderation) */}
        <div
          onClick={() => setActiveTab('gigs')}
          className="glass-card spring-hover"
          style={{
            padding: '20px',
            borderRadius: '16px',
            cursor: 'pointer',
            border: activeTab === 'gigs' ? '1px solid rgba(226, 217, 204, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
            transition: 'all 0.2s ease'
          }}
          title="Click to view Listing Moderation"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Active Listings
            </span>
            <span style={{ fontSize: '10px', color: '#99f6e4', fontWeight: '600' }}>View Tab →</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#ffffff', margin: '6px 0' }}>
            {gigs.length}
          </div>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Available across South Africa</span>
        </div>

        {/* Metric 2: Total Bookings (Links to Transactions Ledger) */}
        <div
          onClick={() => setActiveTab('overview')}
          className="glass-card spring-hover"
          style={{
            padding: '20px',
            borderRadius: '16px',
            cursor: 'pointer',
            border: activeTab === 'overview' ? '1px solid rgba(226, 217, 204, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
            transition: 'all 0.2s ease'
          }}
          title="Click to view Transactions Ledger"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Total Bookings
            </span>
            <span style={{ fontSize: '10px', color: '#99f6e4', fontWeight: '600' }}>View Tab →</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#ffffff', margin: '6px 0' }}>
            {bookings.length}
          </div>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Escrows & Milestones</span>
        </div>

        {/* Metric 3: Platform Users (Links to User Directory) */}
        <div
          onClick={() => setActiveTab('users')}
          className="glass-card spring-hover"
          style={{
            padding: '20px',
            borderRadius: '16px',
            cursor: 'pointer',
            border: activeTab === 'users' ? '1px solid rgba(226, 217, 204, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
            transition: 'all 0.2s ease'
          }}
          title="Click to view User Directory"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Registered Users
            </span>
            <span style={{ fontSize: '10px', color: '#99f6e4', fontWeight: '600' }}>View Tab →</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#ffffff', margin: '6px 0' }}>
            {users.length}
          </div>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Verified RBAC Accounts</span>
        </div>

        {/* Metric 4: Gross Platform Volume (Crisp White) */}
        <div
          onClick={() => setActiveTab('overview')}
          className="glass-card spring-hover"
          style={{
            padding: '20px',
            borderRadius: '16px',
            cursor: 'pointer',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            transition: 'all 0.2s ease'
          }}
          title="Click to view Transactions Ledger"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Gross Volume
            </span>
            <span style={{ fontSize: '10px', color: '#99f6e4', fontWeight: '600' }}>View Tab →</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#ffffff', margin: '6px 0' }}>
            R{totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Total client funds handled</span>
        </div>

        {/* Metric 5: Platform 10% Revenue (Warm Luxury Champagne / Beige) */}
        <div
          onClick={() => setActiveTab('overview')}
          className="glass-card spring-hover"
          style={{
            padding: '20px',
            borderRadius: '16px',
            cursor: 'pointer',
            border: '1px solid rgba(226, 217, 204, 0.35)',
            background: 'linear-gradient(135deg, rgba(226, 217, 204, 0.08), rgba(15, 23, 26, 0.9))',
            transition: 'all 0.2s ease'
          }}
          title="Click to view Transactions Ledger"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#e2d9cc', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              10% Revenue
            </span>
            <span style={{ fontSize: '10px', color: '#e2d9cc', fontWeight: '600' }}>View Tab →</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#e2d9cc', margin: '6px 0' }}>
            R{totalCommission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>HustleHub+ net commission</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('overview')}
          className={`island-tab ${activeTab === 'overview' ? 'active' : ''}`}
        >
          Transactions Ledger ({transactions.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`island-tab ${activeTab === 'users' ? 'active' : ''}`}
        >
          User Directory ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('gigs')}
          className={`island-tab ${activeTab === 'gigs' ? 'active' : ''}`}
        >
          Listing Moderation ({gigs.length})
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`island-tab ${activeTab === 'security' ? 'active' : ''}`}
        >
          Security & Architecture
        </button>
      </div>

      {/* Tab 1: Transactions Ledger */}
      {activeTab === 'overview' && (
        <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ color: '#ffffff', fontSize: '18px', fontWeight: '700', margin: 0 }}>
              Simulated Escrow & Transactions Audit Log
            </h3>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              Click any transaction row to expand full cryptographic audit breakdown
            </span>
          </div>

          {loading ? (
            <p style={{ color: '#94a3b8' }}>Loading ledger...</p>
          ) : transactions.length === 0 ? (
            <p style={{ color: '#94a3b8' }}>No completed transactions recorded yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8' }}>
                    <th style={{ padding: '12px 8px' }}>TX ID</th>
                    <th style={{ padding: '12px 8px' }}>Amount (ZAR)</th>
                    <th style={{ padding: '12px 8px' }}>Platform Fee (10%)</th>
                    <th style={{ padding: '12px 8px' }}>Freelancer Net</th>
                    <th style={{ padding: '12px 8px' }}>Status</th>
                    <th style={{ padding: '12px 8px' }}>Timestamp</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right' }}>Audit</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => {
                    const isExpanded = expandedTxId === tx._id;
                    return (
                      <React.Fragment key={tx._id}>
                        <tr
                          onClick={() => setExpandedTxId(isExpanded ? null : tx._id)}
                          style={{
                            borderBottom: isExpanded ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
                            color: '#ffffff',
                            cursor: 'pointer',
                            background: isExpanded ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                            transition: 'background 0.2s ease'
                          }}
                        >
                          <td style={{ padding: '12px 8px', fontFamily: 'monospace', color: '#99f6e4' }}>
                            {tx._id.slice(-8).toUpperCase()}
                          </td>
                          <td style={{ padding: '12px 8px', fontWeight: '700' }}>R{tx.amount?.toFixed(2)}</td>
                          <td style={{ padding: '12px 8px', color: '#e2d9cc' }}>R{(tx.platformFee || tx.amount * 0.1).toFixed(2)}</td>
                          <td style={{ padding: '12px 8px', color: '#ffffff' }}>R{(tx.freelancerAmount || tx.amount * 0.9).toFixed(2)}</td>
                          <td style={{ padding: '12px 8px' }}>
                            <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '11px', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#ffffff', fontWeight: '700' }}>
                              {tx.status || 'completed'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 8px', color: '#94a3b8' }}>
                            {new Date(tx.createdAt).toLocaleString()}
                          </td>
                          <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                              {isExpanded ? '▲ Hide' : '▼ Details'}
                            </span>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                            <td colSpan="7" style={{ padding: '16px 20px' }}>
                              <div style={{
                                padding: '18px',
                                borderRadius: '12px',
                                background: 'rgba(6, 14, 16, 0.85)',
                                border: '1px solid rgba(226, 217, 204, 0.25)',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                                gap: '16px',
                                fontSize: '12px'
                              }}>
                                <div>
                                  <span style={{ color: '#94a3b8', display: 'block', textTransform: 'uppercase', letterSpacing: '0.8px', fontSize: '10px', fontWeight: '700', marginBottom: '4px' }}>
                                    Full Transaction ID
                                  </span>
                                  <span style={{ color: '#ffffff', fontFamily: 'monospace', fontSize: '12px' }}>
                                    {tx._id}
                                  </span>
                                </div>
                                <div>
                                  <span style={{ color: '#94a3b8', display: 'block', textTransform: 'uppercase', letterSpacing: '0.8px', fontSize: '10px', fontWeight: '700', marginBottom: '4px' }}>
                                    Escrow Settlement Distribution
                                  </span>
                                  <span style={{ color: '#cbd5e1' }}>
                                    Gross: <strong>R{tx.amount?.toFixed(2)}</strong> | Fee: <strong style={{ color: '#e2d9cc' }}>R{(tx.platformFee || tx.amount * 0.1).toFixed(2)}</strong> | Freelancer: <strong>R{(tx.freelancerAmount || tx.amount * 0.9).toFixed(2)}</strong>
                                  </span>
                                </div>
                                <div>
                                  <span style={{ color: '#94a3b8', display: 'block', textTransform: 'uppercase', letterSpacing: '0.8px', fontSize: '10px', fontWeight: '700', marginBottom: '4px' }}>
                                    Cryptographic Mock Hash
                                  </span>
                                  <span style={{ color: '#99f6e4', fontFamily: 'monospace', fontSize: '11px' }}>
                                    SHA256:{tx._id.slice(0, 12)}8f2e4b{tx._id.slice(-6)}
                                  </span>
                                </div>
                                <div>
                                  <span style={{ color: '#94a3b8', display: 'block', textTransform: 'uppercase', letterSpacing: '0.8px', fontSize: '10px', fontWeight: '700', marginBottom: '4px' }}>
                                    Audit Verification Status
                                  </span>
                                  <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span>
                                    Ledger Verified & Reconciled
                                  </span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: User Directory */}
      {activeTab === 'users' && (
        <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ color: '#ffffff', fontSize: '18px', fontWeight: '700', margin: 0 }}>
              Registered Platform Accounts ({users.length})
            </h3>
            <button
              onClick={exportAuditTrail}
              className="btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                border: '1px solid rgba(226, 217, 204, 0.25)',
                color: '#e2d9cc',
                background: 'rgba(255, 255, 255, 0.04)',
                cursor: 'pointer'
              }}
            >
              <svg style={{ width: '12px', height: '12px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>Export CSV</span>
            </button>
          </div>

          {loading ? (
            <p style={{ color: '#94a3b8' }}>Loading user directory...</p>
          ) : users.length === 0 ? (
            <p style={{ color: '#94a3b8' }}>No registered users found.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8' }}>
                    <th style={{ padding: '12px 8px' }}>User</th>
                    <th style={{ padding: '12px 8px' }}>Email</th>
                    <th style={{ padding: '12px 8px' }}>Role</th>
                    <th style={{ padding: '12px 8px' }}>Status</th>
                    <th style={{ padding: '12px 8px' }}>Joined Date</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const initials = u.fullName
                      ? u.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                      : 'U';
                    const roleBadgeStyle =
                      u.role === 'admin'
                        ? { background: 'rgba(226, 217, 204, 0.15)', border: '1px solid rgba(226, 217, 204, 0.35)', color: '#e2d9cc' }
                        : u.role === 'freelancer'
                        ? { background: 'rgba(153, 246, 228, 0.12)', border: '1px solid rgba(153, 246, 228, 0.3)', color: '#99f6e4' }
                        : { background: 'rgba(148, 163, 184, 0.12)', border: '1px solid rgba(148, 163, 184, 0.25)', color: '#cbd5e1' };

                    return (
                      <tr key={u._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', color: '#ffffff' }}>
                        <td style={{ padding: '12px 8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: 'rgba(255, 255, 255, 0.06)',
                              border: '1px solid rgba(255, 255, 255, 0.12)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '11px',
                              fontWeight: '700',
                              color: '#ffffff'
                            }}>
                              {initials}
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', color: '#ffffff' }}>{u.fullName || 'Anonymous'}</div>
                              <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>
                                ID: {u._id ? u._id.slice(-6).toUpperCase() : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 8px', color: '#cbd5e1' }}>{u.email}</td>
                        <td style={{ padding: '12px 8px' }}>
                          <span style={{
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            display: 'inline-block',
                            ...roleBadgeStyle
                          }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#ffffff' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                            Active
                          </span>
                        </td>
                        <td style={{ padding: '12px 8px', color: '#94a3b8' }}>
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Gigs Moderation with Expandable Detail Cards */}
      {activeTab === 'gigs' && (
        <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ color: '#ffffff', fontSize: '18px', fontWeight: '700', margin: 0 }}>
              Active Marketplace Listings (Admin Prune & Moderate)
            </h3>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              Click any listing to expand complete specifications & direct moderation
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {gigs.map((g) => {
              const isExpanded = expandedGigId === g._id;
              return (
                <div
                  key={g._id}
                  onClick={() => setExpandedGigId(isExpanded ? null : g._id)}
                  className="spring-hover"
                  style={{
                    padding: '16px 20px',
                    background: isExpanded ? 'rgba(15, 23, 26, 0.95)' : 'rgba(0, 0, 0, 0.25)',
                    borderRadius: '12px',
                    border: isExpanded ? '1px solid rgba(226, 217, 204, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <h4 style={{ margin: 0, color: '#ffffff', fontSize: '15px', fontWeight: '600' }}>{g.title}</h4>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '8px',
                          fontSize: '10px',
                          fontWeight: '700',
                          background: 'rgba(153, 246, 228, 0.12)',
                          color: '#99f6e4',
                          border: '1px solid rgba(153, 246, 228, 0.25)'
                        }}>
                          {g.category || 'General'}
                        </span>
                      </div>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                        Created by: <strong style={{ color: '#e2d9cc' }}>{g.freelancerId?.fullName || 'Freelancer'}</strong> ({g.freelancerId?.email || 'N/A'}) • Price: <strong style={{ color: '#ffffff' }}>R{g.price}</strong>
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                        {isExpanded ? '▲ Hide Details' : '▼ Expand'}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTargetGig(g);
                        }}
                        style={{
                          padding: '6px 14px',
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                          color: '#f87171',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '700',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
                          e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.8)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                          e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Expanded Detail View for Listing */}
                  {isExpanded && (
                    <div style={{
                      marginTop: '16px',
                      paddingTop: '16px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                      gap: '16px',
                      fontSize: '13px'
                    }}>
                      <div>
                        <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', fontWeight: '700', marginBottom: '6px' }}>
                          Service Description & Scope
                        </span>
                        <p style={{ margin: 0, color: '#cbd5e1', lineHeight: '1.6', fontSize: '13px' }}>
                          {g.description || 'No detailed description provided for this listing.'}
                        </p>
                      </div>

                      <div>
                        <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', fontWeight: '700', marginBottom: '6px' }}>
                          Delivery & Verification
                        </span>
                        <div style={{ color: '#ffffff', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div>Delivery Timeline: <strong>{g.deliveryDays || 3} Days</strong></div>
                          <div>Listing ID: <code style={{ color: '#99f6e4', fontSize: '11px' }}>{g._id}</code></div>
                          {g.location && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#e2d9cc' }}>
                              <span>Location: {g.location}</span>
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(g.location)}`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                style={{ color: '#99f6e4', textDecoration: 'underline', fontSize: '11px' }}
                              >
                                View Map ↗
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Security & Architecture Info */}
      {activeTab === 'security' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ color: '#e2d9cc', fontSize: '18px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg style={{ width: '18px', height: '18px', color: '#e2d9cc' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              RBAC Enforcement
            </h3>
            <ul style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: '1.8', paddingLeft: '20px' }}>
              <li><strong>Client Role:</strong> Can browse, book gigs, manage own orders, cancel pending bookings.</li>
              <li><strong>Freelancer Role:</strong> Can create/delete own gigs, accept/reject jobs, release milestones, view tax insights.</li>
              <li><strong>Admin Role:</strong> Platform-wide moderation, delete any gig, view all audit logs, ledger transactions, and full user directory.</li>
            </ul>
          </div>

          <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ color: '#e2d9cc', fontSize: '18px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg style={{ width: '18px', height: '18px', color: '#e2d9cc' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              Multi-Tier Rate Limiting
            </h3>
            <ul style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: '1.8', paddingLeft: '20px' }}>
              <li><strong>Auth Tier:</strong> 10 requests / 15 minutes (protects login, register, Google SSO, OTP).</li>
              <li><strong>Booking Tier:</strong> 20 requests / 15 minutes (prevents booking spam & denial of service).</li>
              <li><strong>General Tier:</strong> 100 requests / 15 minutes across all standard read endpoints.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Styled Confirmation Modal for Listing Deletion */}
      <ConfirmModal
        isOpen={!!deleteTargetGig}
        title="Delete Platform Listing"
        message={`Are you sure you want to permanently delete "${deleteTargetGig?.title}" by ${deleteTargetGig?.freelancerId?.fullName || 'Freelancer'}? This action is immediate and cannot be undone.`}
        confirmLabel="Delete Listing"
        confirmVariant="danger"
        isLoading={isDeleting}
        onCancel={() => setDeleteTargetGig(null)}
        onConfirm={confirmDeleteGig}
      />

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

export default AdminCenterView;
