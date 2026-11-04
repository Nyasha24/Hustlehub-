import React, { useState, useEffect } from 'react';
import { fetchFreelancerIncome, createGig, deleteGig, fetchGigs } from '../services/api';
import CustomDropdown from './CustomDropdown';
import ConfirmModal from './ConfirmModal';

const CATEGORIES = [
  'Web Development',
  'Design & Creative',
  'Digital Marketing',
  'Writing & Translation',
  'Video & Animation',
  'AI & Tech Consulting'
];

function FreelancerDashboardView({ user, onGigCreated }) {
  const [financials, setFinancials] = useState({
    grossRevenue: 0,
    platformFees: 0,
    netEarnings: 0,
    estimatedTax: 0,
    completedJobsCount: 0
  });
  const [loadingFinancials, setLoadingFinancials] = useState(true);

  // Gig Creation Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [price, setPrice] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('3');
  const [location, setLocation] = useState('Cape Town, Western Cape');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // My Gigs List
  const [myGigs, setMyGigs] = useState([]);
  const [loadingGigs, setLoadingGigs] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [deleteTargetGig, setDeleteTargetGig] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadFinancials = async () => {
    setLoadingFinancials(true);
    try {
      const data = await fetchFreelancerIncome();
      const gross = data.grossRevenue || 0;
      const fees = data.platformFees || (gross * 0.10);
      const net = data.netEarnings || (gross - fees);
      const tax = (net * 0.15); // 15% Estimated Provisional Tax Reserve

      setFinancials({
        grossRevenue: gross,
        platformFees: fees,
        netEarnings: net,
        estimatedTax: tax,
        completedJobsCount: data.completedJobsCount || 0
      });
    } catch (err) {
      console.error('Failed to load financials:', err);
    } finally {
      setLoadingFinancials(false);
    }
  };

  const loadMyGigs = async () => {
    setLoadingGigs(true);
    try {
      const allGigs = await fetchGigs();
      const uid = user?._id || user?.id;
      const filtered = allGigs.filter((g) => {
        const fid = g.freelancer?._id || g.freelancer || g.freelancerId?._id || g.freelancerId;
        return fid && uid && String(fid) === String(uid);
      });
      setMyGigs(filtered);
    } catch (err) {
      console.error('Failed to load my gigs:', err);
    } finally {
      setLoadingGigs(false);
    }
  };

  const loadAllData = async (manual = false) => {
    if (manual) setIsRefreshing(true);
    try {
      await Promise.all([loadFinancials(), loadMyGigs()]);
      if (manual) {
        setToastMessage('Freelancer earnings and active listings synchronized successfully.');
        setTimeout(() => setToastMessage(null), 3500);
      }
    } catch (err) {
      if (manual) {
        setToastMessage(`Sync failed: ${err.message}`);
        setTimeout(() => setToastMessage(null), 4000);
      }
    } finally {
      if (manual) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData(false);
  }, []);

  const handleCreateGig = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!title.trim() || !price || !description.trim() || !location.trim()) {
      setFormError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createGig({
        title: title.trim(),
        category,
        price: Number(price),
        deliveryDays: Number(deliveryDays),
        location: location.trim(),
        description: description.trim()
      });

      setFormSuccess('Gig published successfully!');
      setTitle('');
      setPrice('');
      setDescription('');
      setLocation('Cape Town, Western Cape');
      setCategory(CATEGORIES[0]);
      await loadMyGigs();

      if (onGigCreated) {
        onGigCreated(res.data || res.gig || { title: title.trim(), price: Number(price) });
      }
    } catch (err) {
      setFormError(err.message || 'Failed to publish gig listing');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDeleteGig = async () => {
    if (!deleteTargetGig) return;
    setIsDeleting(true);
    try {
      await deleteGig(deleteTargetGig._id);
      setMyGigs((prev) => prev.filter((g) => g._id !== deleteTargetGig._id));
      const deletedTitle = deleteTargetGig.title;
      setDeleteTargetGig(null);
      setToastMessage(`Listing "${deletedTitle}" deleted successfully.`);
      setTimeout(() => setToastMessage(null), 3500);
      if (onGigCreated) onGigCreated();
    } catch (err) {
      setToastMessage(`Delete failed: ${err.message}`);
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '100px 20px 40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', color: '#e2d9cc', fontWeight: '800' }}>
            FREELANCER REVENUE & LISTINGS HUB
          </span>
          <h2 className="font-serif" style={{ fontSize: '36px', color: '#ffffff', margin: '6px 0 0', fontWeight: '400' }}>
            Welcome, {user?.fullName || 'Freelancer'}
          </h2>
        </div>

        <button
          onClick={() => loadAllData(true)}
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
          <span>{isRefreshing ? 'Synchronizing...' : 'Refresh Hub Data'}</span>
        </button>
      </div>

      {/* Financial & Tax Dashboard Grid (High-Contrast White & Warm Beige Palette) */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg style={{ width: '18px', height: '18px', color: '#e2d9cc' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          Financial Summary & Tax Insights
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px'
        }}>
          {/* Card 1: Gross Platform Revenue */}
          <div className="glass-card spring-hover" style={{ padding: '22px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700' }}>Gross Completed Volume</span>
              <svg style={{ width: '20px', height: '20px', color: '#ffffff' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '800', color: '#ffffff', marginBottom: '4px' }}>
              R{financials.grossRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
              {financials.completedJobsCount} order{financials.completedJobsCount === 1 ? '' : 's'} delivered & released
            </span>
          </div>

          {/* Card 2: Platform Commission (10%) */}
          <div className="glass-card spring-hover" style={{ padding: '22px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700' }}>Platform Escrow Fee (10%)</span>
              <svg style={{ width: '20px', height: '20px', color: '#94a3b8' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
                <polyline points="17 18 23 18 23 12"></polyline>
              </svg>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '800', color: '#94a3b8', marginBottom: '4px' }}>
              R{financials.platformFees.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
              Transparent flat 10% marketplace fee
            </span>
          </div>

          {/* Card 3: Net Take-Home (90%) */}
          <div className="glass-card spring-hover" style={{ padding: '22px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: '#ffffff', fontWeight: '700' }}>Net Payout Received</span>
              <svg style={{ width: '20px', height: '20px', color: '#ffffff' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
              </svg>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '800', color: '#ffffff', marginBottom: '4px' }}>
              R{financials.netEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
              Direct bank payout total
            </span>
          </div>

          {/* Card 4: Estimated Tax - Warm Beige Theme */}
          <div className="glass-card spring-hover" style={{ padding: '22px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(226, 217, 204, 0.08), rgba(15, 23, 26, 0.9))', border: '1px solid rgba(226, 217, 204, 0.35)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: '#e2d9cc', fontWeight: '700' }}>15% SARS Tax Reserve</span>
              <svg style={{ width: '20px', height: '20px', color: '#e2d9cc' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 21h18M3 10h18M5 10v11M19 10v11M9 10v11M15 10v11M12 2l9 8H3l9-8z"></path>
              </svg>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '800', color: '#e2d9cc', marginBottom: '4px' }}>
              R{financials.estimatedTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
              Recommended provisional tax set-aside
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Post Gig Form + Active Listings */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: '32px'
      }}>
        {/* Post New Gig Card */}
        <div className="glass-card spring-hover" style={{ padding: '28px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(226, 217, 204, 0.1)', border: '1px solid rgba(226, 217, 204, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ width: '18px', height: '18px', color: '#e2d9cc' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', margin: 0 }}>Create New Gig</h3>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>Post a verified freelance service on the marketplace</span>
            </div>
          </div>

          {formError && (
            <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', color: '#f87171', fontSize: '13px', marginBottom: '16px' }}>
              {formError}
            </div>
          )}

          {formSuccess && (
            <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '8px', color: '#34d399', fontSize: '13px', marginBottom: '16px' }}>
              {formSuccess}
            </div>
          )}

          <form onSubmit={handleCreateGig}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>
                Gig Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Modern Full-Stack MERN Web App Development"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>
                  Category *
                </label>
                <CustomDropdown
                  options={CATEGORIES}
                  value={category}
                  onChange={setCategory}
                  placeholder="Select Category"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>
                  Fixed Price (ZAR R) *
                </label>
                <input
                  type="number"
                  placeholder="e.g. 4500"
                  min="5"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginTop: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>
                  Delivery (Days) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={deliveryDays}
                  onChange={(e) => setDeliveryDays(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>
                  Service Location (Google Maps Verification) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sandton, Johannesburg"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div style={{ marginTop: '16px', marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>
                Service Description & Milestones *
              </label>
              <textarea
                rows="4"
                placeholder="Describe your freelance scope, milestones, and deliverables in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '14px' }}
            >
              {submitting ? 'Publishing Service...' : 'Publish Verified Gig →'}
            </button>
          </form>
        </div>

        {/* Active Listings Column */}
        <div className="glass-card spring-hover" style={{ padding: '28px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg style={{ width: '18px', height: '18px', color: '#ffffff' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', margin: 0 }}>
                Your Active Listings ({myGigs.length})
              </h3>
            </div>
          </div>

          {loadingGigs ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading listings...</div>
          ) : myGigs.length === 0 ? (
            <div style={{
              padding: '60px 20px',
              textAlign: 'center',
              border: '1px dashed rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              color: '#94a3b8'
            }}>
              <p style={{ margin: 0, fontSize: '14px' }}>You have not published any gigs yet. Create one on the left!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '520px', overflowY: 'auto' }}>
              {myGigs.map((gig) => (
                <div
                  key={gig._id}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontWeight: '700',
                        background: 'rgba(153, 246, 228, 0.12)',
                        color: '#99f6e4',
                        border: '1px solid rgba(153, 246, 228, 0.25)'
                      }}>
                        {gig.category}
                      </span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {gig.deliveryDays} Days Delivery
                      </span>
                    </div>

                    <h4 style={{ margin: '0 0 6px', fontSize: '14px', color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {gig.title}
                    </h4>

                    <span style={{ fontSize: '12px', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg style={{ width: '12px', height: '12px', color: '#99f6e4' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      {gig.location || 'Remote'} • <strong style={{ color: '#ffffff' }}>R{gig.price ? gig.price.toLocaleString() : '0'}</strong>
                    </span>
                  </div>

                  <button
                    onClick={() => setDeleteTargetGig(gig)}
                    title="Delete Gig"
                    style={{
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                      color: '#f87171',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '700',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Styled Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTargetGig}
        title="Delete Freelance Listing"
        message={`Are you sure you want to delete "${deleteTargetGig?.title}"? It will be permanently removed from the marketplace.`}
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

export default FreelancerDashboardView;
