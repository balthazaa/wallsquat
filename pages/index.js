import { useState } from 'react';
import dayjs from 'dayjs';
import CheckinView from '../components/CheckinView';
import WishlistView from '../components/WishlistView';
import MessagesView from '../components/MessagesView';
import { USERS, VIEWS } from '../lib/constants';

const TABS = [
  { key: VIEWS.CHECKIN, label: '打卡', icon: '🏠' },
  { key: VIEWS.WISHLIST, label: '愿望', icon: '⭐' },
  { key: VIEWS.MESSAGES, label: '留言板', icon: '💬' },
];

export default function Home() {
  const [currentUser, setCurrentUser] = useState(USERS.DIANE.id);
  const [currentView, setCurrentView] = useState(VIEWS.CHECKIN);

  const userLabel =
    currentUser === USERS.DIANE.id ? USERS.DIANE.label : USERS.LANREN.label;

  return (
    <div
      style={{
        maxWidth: 480,
        margin: '0 auto',
        minHeight: '100vh',
        padding: '24px 16px 80px',
        background: '#fefcf9',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
        }}
      >
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: '#4a90d9',
            margin: 0,
          }}
        >
          Wall Squat
        </h1>
        <button
          onClick={() =>
            setCurrentUser((id) =>
              id === USERS.DIANE.id ? USERS.LANREN.id : USERS.DIANE.id
            )
          }
          style={{
            padding: '6px 14px',
            borderRadius: 999,
            border: '1px solid #4a90d9',
            background: '#fff',
            color: '#4a90d9',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          当前：{userLabel}（点击切换）
        </button>
      </div>

      {/* View content */}
      <div>
        {currentView === VIEWS.CHECKIN && (
          <CheckinView userId={currentUser} />
        )}
        {currentView === VIEWS.WISHLIST && (
          <WishlistView userId={currentUser} />
        )}
        {currentView === VIEWS.MESSAGES && <MessagesView />}
      </div>

      {/* Bottom tab bar */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#fff',
          borderTop: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-around',
          padding: '8px 0',
          zIndex: 100,
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setCurrentView(tab.key)}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              cursor: 'pointer',
              color: currentView === tab.key ? '#4a90d9' : '#999',
              fontSize: 12,
              fontWeight: currentView === tab.key ? 600 : 400,
              padding: '4px 12px',
            }}
          >
            <span style={{ fontSize: 20 }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
