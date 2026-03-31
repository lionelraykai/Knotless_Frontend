import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, User, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navigation() {
  const { user, logout, openLoginModal, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const handlePostClick = () => {
    setDrawerOpen(false);
    if (user) {
      navigate('/post');
    } else {
      openLoginModal();
    }
  };

  return (
    <>
      <nav className="glass-nav">
        <div className="container nav-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          {/* Left Side: Logo + Nav Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <Link to="/" className="nav-link" style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, letterSpacing: '0.02em', color: 'var(--primary)' }}>
              Knotless
            </Link>
            <div className="nav-links hidden-mobile" style={{ display: 'flex', gap: '2rem' }}>
              <Link to="/" className="nav-link active" style={{ fontWeight: 600 }}>Home</Link>
              <Link to="/" className="nav-link" style={{ color: 'var(--on-surface-variant)', fontWeight: 500 }}>Categories</Link>
              <Link to="/" className="nav-link" style={{ color: 'var(--on-surface-variant)', fontWeight: 500 }}>Archive</Link>
            </div>
          </div>
          
          {/* Right Side: Actions */}
          <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            
            <button 
              type="button" 
              className="btn-primary hidden-mobile" 
              style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem', fontWeight: 500 }}
              onClick={handlePostClick}
            >
              Post a Knot
            </button>
            
            <button type="button" className="hidden-mobile" style={{ background: 'none', padding: '0.5rem', color: 'var(--primary)', border: 'none', cursor: 'pointer' }}>
              <Bell size={20} className="icon-stroke" />
            </button>
            
            <div className="hidden-mobile">
              {isAuthenticated ? (
                <div style={{ cursor: 'pointer', position: 'relative' }} onClick={() => navigate('/profile')} title="View Profile">
                  <img 
                    src={user?.avatar || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=48&h=48'}
                    alt={user?.name || 'User'} 
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} 
                  />
                </div>
              ) : (
                <Link to="/login" className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                  <User size={18} />
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile-Only Toggle */}
            <button 
              className="hidden-desktop" 
              style={{ background: 'none', padding: '0.5rem', color: 'var(--primary)', cursor: 'pointer', border: 'none' }}
              onClick={() => setDrawerOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>

        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {isDrawerOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setDrawerOpen(false)} />
      )}

      {/* Mobile Drawer */}
      <div className={`mobile-drawer ${isDrawerOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '3rem' }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)' }} onClick={() => setDrawerOpen(false)}>
            <X size={28} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <Link to="/" className="nav-link" style={{ fontSize: '1.25rem' }} onClick={() => setDrawerOpen(false)}>Home</Link>
          <Link to="/" className="nav-link" style={{ fontSize: '1.25rem' }} onClick={() => setDrawerOpen(false)}>Categories</Link>
          <Link to="/" className="nav-link" style={{ fontSize: '1.25rem' }} onClick={() => setDrawerOpen(false)}>Archive</Link>
          
          <hr style={{ border: 'none', borderTop: '1px solid var(--surface-container-high)', margin: '1rem 0' }} />

          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handlePostClick}>
            Post a Knot
          </button>

          {!isAuthenticated ? (
            <Link to="/login" className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setDrawerOpen(false)}>
              Sign In
            </Link>
          ) : (
            <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={logout}>
              Sign Out
            </button>
          )}
        </div>
      </div>
    </>
  );
}
