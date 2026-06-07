import { useState, useEffect, useCallback } from 'react';
import { USERS, TABS, COLORS } from '../lib/constants';
import { fetchCheckins, saveCheckins, fetchWishlist, saveWishlist, fetchMessages, saveMessages } from '../lib/api';
import CheckinView from '../components/CheckinView';
import WishlistView from '../components/WishlistView';
import MessagesView from '../components/MessagesView';
import FadeIn from '../components/FadeIn';
import Toast from '../components/Toast';

const VIEW_TITLES = {
  checkin: '靠墙蹲打卡',
  wishlist: '我们的愿望清单',
  messages: '留言板',
};

const VIEW_SUBTITLES = {
  checkin: '记录每日靠墙蹲，看见积累的力量',
  wishlist: '写下想去的地方，一起实现',
  messages: 'Diane & 懒人的留言板',
};

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(USERS[0]);
  const [currentView, setCurrentView] = useState('checkin');
  const [checkins, setCheckins] = useState({});
  const [wishlist, setWishlist] = useState([]);
  const [messages, setMessages] = useState([]);
  const [toastMsg, setToastMsg] = useState('');
  const [toastKey, setToastKey] = useState(0);

  const showToast = (msg) => {
    setToastMsg(msg);
    setToastKey((k) => k + 1);
  };

  // Load data
  useEffect(() => {
    async function load() {
      try {
        const [c, w, m] = await Promise.all([
          fetchCheckins(),
          fetchWishlist(),
          fetchMessages(),
        ]);
        setCheckins(c);
        setWishlist(w);
        setMessages(m);
      } catch (err) {
        console.warn('Load error:', err);
      }
      setLoading(false);
    }
    load();
  }, []);

  // Write handlers with debounce-like save
  const saveCheckinsDebounced = useCallback(async (records) => {
    setCheckins(records);
    try {
      await saveCheckins(records);
    } catch (err) {
      console.warn('Save checkins error:', err);
    }
  }, []);

  const saveWishlistDebounced = useCallback(async (items) => {
    setWishlist(items);
    try {
      await saveWishlist(items);
    } catch (err) {
      console.warn('Save wishlist error:', err);
    }
  }, []);

  const saveMessagesDebounced = useCallback(async (msgs) => {
    setMessages(msgs);
    try {
      await saveMessages(msgs);
    } catch (err) {
      console.warn('Save messages error:', err);
    }
  }, []);

  const toggleUser = () => {
    setCurrentUser((u) => (u.id === USERS[0].id ? USERS[1] : USERS[0]));
  };

  if (loading) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: 'center',
          color: '#9a9a9a',
          fontSize: '0.9rem',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        加载中...
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '40px 16px 110px',
        minHeight: '100vh',
        maxWidth: 560,
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: COLORS.textDark,
            marginBottom: 6,
          }}
        >
          {VIEW_TITLES[currentView]}
        </h1>
        <p style={{ fontSize: '0.88rem', color: COLORS.textMuted }}>
          {VIEW_SUBTITLES[currentView]}
        </p>
      </div>

      {/* User switch */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            gap: 0,
            padding: 4,
            background: '#fff',
            borderRadius: 999,
            boxShadow:
              '0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
            border: `1px solid ${COLORS.subtleBorder}`,
          }}
        >
          {USERS.map((user) => (
            <button
              key={user.id}
              onClick={() =>
                setCurrentUser(
                  user.id === USERS[0].id ? USERS[0] : USERS[1]
                )
              }
              style={{
                width: 120,
                padding: '10px 8px',
                border: 'none',
                borderRadius: 999,
                cursor: 'pointer',
                fontSize: '0.88rem',
                fontWeight: 600,
                transition: 'all 0.25s ease',
                background:
                  currentUser.id === user.id ? COLORS.primary : 'transparent',
                color:
                  currentUser.id === user.id ? '#fff' : COLORS.textMuted,
              }}
            >
              {user.label}
            </button>
          ))}
        </div>
      </div>

      {/* View content */}
      <FadeIn key={currentView}>
        {currentView === 'checkin' && (
          <CheckinView
            checkins={checkins}
            onUpdate={saveCheckinsDebounced}
            currentUser={currentUser}
            onShowToast={showToast}
          />
        )}
        {currentView === 'wishlist' && (
          <WishlistView
            items={wishlist}
            onUpdate={saveWishlistDebounced}
            currentUser={currentUser}
            onShowToast={showToast}
          />
        )}
        {currentView === 'messages' && (
          <MessagesView
            messages={messages}
            onUpdate={saveMessagesDebounced}
            currentUser={currentUser}
            onShowToast={showToast}
          />
        )}
      </FadeIn>

      {/* Bottom Nav */}
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#fff',
          borderTop: `1px solid ${COLORS.subtleBorder}`,
          boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: 560,
            margin: '0 auto',
            display: 'flex',
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentView(tab.id)}
              style={{
                flex: 1,
                padding: '14px 0',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                transition: 'all 0.2s',
              }}
            >
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color:
                    currentView === tab.id ? COLORS.primary : COLORS.textMuted,
                  transition: 'color 0.2s',
                }}
              >
                {tab.label === '打卡' && '\uD83C\uDFE0 '}
                {tab.label === 'Wishlist' && '\u2B50 '}
                {tab.label === '留言板' && '\uD83D\uDCAC '}
                {tab.label}
              </span>
              <div
                style={{
                  width: 20,
                  height: 3,
                  borderRadius: 999,
                  background:
                    currentView === tab.id ? COLORS.primary : 'transparent',
                  marginTop: 2,
                  transition: 'all 0.2s',
                }}
              />
            </button>
          ))}
        </div>
      </nav>

      {/* Toast */}
      <Toast key={toastKey} msg={toastMsg} />
    </div>
  );
}
