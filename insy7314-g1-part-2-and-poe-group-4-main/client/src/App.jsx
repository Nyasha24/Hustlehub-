import React, { useState, useEffect } from 'react';
import DynamicIslandNavbar from './components/DynamicIslandNavbar';
import HeroLanding from './components/HeroLanding';
import MarketplaceView from './components/MarketplaceView';
import ClientOrdersView from './components/ClientOrdersView';
import FreelancerDashboardView from './components/FreelancerDashboardView';
import AdminCenterView from './components/AdminCenterView';
import AuthModal from './components/AuthModal';
import BookingModal from './components/BookingModal';
import CelebrationModal from './components/CelebrationModal';
import HelpWidget from './components/HelpWidget';
import Footer from './components/Footer';
import CursorTrail from './components/CursorTrail';
import { getSavedUser, clearAuth, fetchGigs, deleteGig } from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [gigs, setGigs] = useState([]);
  const [gigsLoading, setGigsLoading] = useState(true);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedGigForBooking, setSelectedGigForBooking] = useState(null);
  const [celebration, setCelebration] = useState({
    isOpen: false,
    type: 'booking',
    title: '',
    message: '',
    receipt: null,
    role: null,
    buttonText: null
  });

  // Load saved user from sessionStorage
  useEffect(() => {
    const saved = getSavedUser();
    if (saved) {
      setUser(saved);
      setActiveTab('marketplace');
    }
  }, []);

  // Load all marketplace gigs
  const loadGigs = async () => {
    setGigsLoading(true);
    try {
      const data = await fetchGigs();
      setGigs(data || []);
    } catch (err) {
      console.error('Failed to load gigs:', err);
    } finally {
      setGigsLoading(false);
    }
  };

  useEffect(() => {
    loadGigs();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthModalOpen(false);
    const targetTab = userData.role === 'freelancer' ? 'freelancer-hub' : userData.role === 'admin' ? 'admin' : 'marketplace';
    setActiveTab(targetTab);
    setCelebration({
      isOpen: true,
      type: 'login',
      role: userData.role,
      title: `Welcome, ${userData.fullName || 'User'}!`,
      message: `Successfully authenticated as ${userData.role ? userData.role.toUpperCase() : 'USER'}. Your secure freelance workspace is ready.`,
      receipt: null,
      buttonText: 'Enter Workspace →'
    });
  };

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    setActiveTab('home');
    setCelebration({
      isOpen: true,
      type: 'logout',
      title: 'Signed Out Successfully',
      message: 'You have safely ended your session on HustleHub⁺. All credentials cleared.',
      receipt: null,
      role: null,
      buttonText: 'Return to Marketplace'
    });
  };

  const handleBookGig = (gig) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setSelectedGigForBooking(gig);
  };

  const handleBookingSuccess = (receipt) => {
    setCelebration({
      isOpen: true,
      type: 'booking',
      title: 'Escrow Payment Locked',
      message: 'Your service order was placed successfully. Funds are held in secure escrow until completion.',
      receipt,
      role: user?.role,
      buttonText: 'View in My Orders →'
    });
    setSelectedGigForBooking(null);
  };

  const handleBookingCompletedCelebration = (booking) => {
    setCelebration({
      isOpen: true,
      type: 'booking',
      title: 'Order Completed & Escrow Released',
      message: `The funds for order #${booking._id?.slice(-6).toUpperCase()} have been disbursed to the freelancer.`,
      receipt: {
        transactionId: `TXN-COMP-${booking._id?.slice(-8).toUpperCase()}`,
        amount: booking.amount || booking.gig?.price || booking.totalPrice || 0
      },
      role: user?.role,
      buttonText: 'Continue'
    });
  };

  const handleDeleteGig = async (gigId) => {
    if (!window.confirm('Are you sure you want to remove this gig?')) return;
    try {
      await deleteGig(gigId);
      setGigs((prev) => prev.filter((g) => g._id !== gigId));
    } catch (err) {
      alert(`Could not delete gig: ${err.message}`);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)' }}>
      {/* Interactive Trailing Cursor */}
      <CursorTrail />

      {/* Dynamic Island Floating Navbar */}
      <DynamicIslandNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main View Router */}
      <main style={{ flex: 1 }}>
        {activeTab === 'home' && (
          <div>
            <HeroLanding
              onExplore={() => setActiveTab('marketplace')}
              onJoin={() => {
                if (user) {
                  setActiveTab(user.role === 'freelancer' ? 'freelancer-hub' : 'marketplace');
                } else {
                  setIsAuthModalOpen(true);
                }
              }}
            />
          </div>
        )}

        {activeTab === 'marketplace' && (
          <MarketplaceView
            gigs={gigs}
            loading={gigsLoading}
            user={user}
            onBookGig={handleBookGig}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onDeleteGig={handleDeleteGig}
          />
        )}

        {activeTab === 'orders' && user && (
          <ClientOrdersView
            user={user}
            onSelectBookingForCelebration={handleBookingCompletedCelebration}
          />
        )}

        {activeTab === 'freelancer-hub' && user && (user.role === 'freelancer' || user.role === 'admin') && (
          <FreelancerDashboardView
            user={user}
            onGigCreated={(createdGig) => {
              loadGigs();
              setCelebration({
                isOpen: true,
                type: 'gig_created',
                title: 'Listing Published Successfully!',
                message: `"${createdGig?.title || 'Your freelance service'}" is now live on the HustleHub+ marketplace with Google Maps location verification and milestone escrow protection.`,
                receipt: null,
                role: user.role,
                buttonText: 'View My Hub'
              });
            }}
          />
        )}

        {activeTab === 'admin' && user && user.role === 'admin' && (
          <AdminCenterView user={user} />
        )}
      </main>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <BookingModal
        isOpen={!!selectedGigForBooking}
        gig={selectedGigForBooking}
        onClose={() => setSelectedGigForBooking(null)}
        onSuccess={handleBookingSuccess}
      />

      <CelebrationModal
        isOpen={celebration.isOpen}
        type={celebration.type}
        role={celebration.role}
        title={celebration.title}
        message={celebration.message}
        receipt={celebration.receipt}
        buttonText={celebration.buttonText}
        onClose={() => {
          const wasBooking = celebration.type === 'booking';
          setCelebration({ isOpen: false, type: 'booking', title: '', message: '', receipt: null, role: null, buttonText: null });
          if (wasBooking && user && user.role === 'client') setActiveTab('orders');
        }}
      />

      {/* Floating Context-Aware Help Widget */}
      <HelpWidget />

      {/* Seamless Full-Width Footer */}
      <Footer />
    </div>
  );
}

export default App;