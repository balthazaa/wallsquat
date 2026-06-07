import { useState, useMemo } from 'react';
import { COLORS } from '../lib/constants';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

const TIME_SLOTS = [
  { id: 'am', label: '上午打卡', subLabel: '6:00 — 12:00', icon: '☀️' },
  { id: 'pm', label: '下午打卡', subLabel: '12:00 — 21:00', icon: '🌙' },
];

// D1 format: { "YYYY-MM-DD": { "userId": { "am"|"pm": { done, time } } } }
export default function CheckinView({ checkins, onUpdate, currentUser, onShowToast }) {
  const today = new Date().toISOString().slice(0, 10);
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());

  const navMonth = (delta) => {
    setViewMonth((m) => {
      let newM = m + delta;
      let yr = viewYear;
      if (newM < 0) { yr--; newM = 11; }
      if (newM > 11) { yr++; newM = 0; }
      setViewYear(yr);
      return newM;
    });
  };

  // Get slot info for a specific date + slot
  const getSlotInfo = (date, slotId) => {
    const dayData = checkins?.[date];
    if (!dayData) return null;
    const userData = dayData[currentUser.id];
    if (!userData) return null;
    return userData[slotId] || null;
  };

  // Day status for calendar coloring
  const getDayStatus = (date) => {
    const dayData = checkins?.[date];
    if (!dayData) return 'none';
    const userData = dayData[currentUser.id];
    if (!userData) return 'none';
    const amDone = !!userData.am?.done;
    const pmDone = !!userData.pm?.done;
    if (amDone && pmDone) return 'full';
    if (amDone || pmDone) return 'half';
    return 'none';
  };

  // Calendar grid
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push({ day: '', date: null, isOther: true });
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    calendarDays.push({ day: d, date: `${viewYear}-${mm}-${dd}`, isOther: false });
  }

  // Monthly stats
  const monthKey = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;
  const stats = useMemo(() => {
    let days = 0;
    let count = 0;
    if (!checkins) return { days, count };
    for (const [date, dayData] of Object.entries(checkins)) {
      if (date.slice(0, 7) !== monthKey) continue;
      const userData = dayData?.[currentUser.id];
      if (!userData) continue;
      let hasAny = false;
      if (userData.am?.done) { hasAny = true; count++; }
      if (userData.pm?.done) { hasAny = true; count++; }
      if (hasAny) days++;
    }
    return { days, count };
  }, [checkins, currentUser.id, monthKey]);

  // Handle checkin
  const handleCheckin = (slotId) => {
    const newCheckins = JSON.parse(JSON.stringify(checkins || {}));
    if (!newCheckins[today]) newCheckins[today] = {};
    if (!newCheckins[today][currentUser.id]) newCheckins[today][currentUser.id] = {};
    newCheckins[today][currentUser.id][slotId] = { done: true, time: Date.now() };
    onUpdate(newCheckins);
    onShowToast('已打卡');
  };

  // Handle cancel
  const handleCancel = (slotId) => {
    const newCheckins = JSON.parse(JSON.stringify(checkins || {}));
    const dayData = newCheckins[today];
    if (dayData?.[currentUser.id]) {
      delete dayData[currentUser.id][slotId];
      if (Object.keys(dayData[currentUser.id]).length === 0) {
        delete dayData[currentUser.id];
      }
      if (Object.keys(dayData).length === 0) {
        delete newCheckins[today];
      }
    }
    onUpdate(newCheckins);
    onShowToast('已取消');
  };

  return (
    <div>
      {/* Today Checkin Cards */}
      <div style={{ marginBottom: 24, maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
        <h3 style={{ color: COLORS.textDark, marginBottom: 14, fontSize: '1.05rem', fontWeight: 700 }}>
          今日打卡
        </h3>

        {TIME_SLOTS.map((slot) => {
          const info = getSlotInfo(today, slot.id);
          return (
            <div
              key={slot.id}
              style={{
                borderRadius: '1.6rem',
                border: info
                  ? '1.5px solid hsl(142, 71%, 70%)'
                  : `1.5px solid ${COLORS.subtleBorder}`,
                background: info ? 'hsl(142, 76%, 96%)' : '#fff',
                padding: '14px 18px',
                marginBottom: 10,
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <span style={{ fontSize: '1.3rem' }}>{slot.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: COLORS.textDark }}>
                  {slot.label}
                </div>
                <div style={{ fontSize: '0.72rem', color: COLORS.textMuted, marginTop: 2 }}>
                  {info ? '已完成' : slot.subLabel}
                </div>
              </div>
              {info ? (
                <button
                  onClick={() => handleCancel(slot.id)}
                  style={{
                    border: 'none',
                    borderRadius: 999,
                    padding: '7px 16px',
                    background: 'hsl(142, 71%, 90%)',
                    color: 'hsl(142, 71%, 35%)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  取消
                </button>
              ) : (
                <button
                  onClick={() => handleCheckin(slot.id)}
                  style={{
                    border: 'none',
                    borderRadius: 999,
                    padding: '8px 18px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: COLORS.primary,
                    color: '#fff',
                    boxShadow: `0 4px 14px ${COLORS.primaryGlow}`,
                  }}
                >
                  打卡
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Calendar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, marginBottom: 16 }}>
        <button onClick={() => navMonth(-1)} style={{ background: 'none', border: `1px solid ${COLORS.subtleBorder}`, borderRadius: 8, width: 36, height: 36, fontSize: 20, cursor: 'pointer', color: COLORS.textMedium }}>‹</button>
        <span style={{ fontSize: '1.05rem', fontWeight: 700, color: COLORS.textDark }}>
          {viewYear}年{viewMonth + 1}月
        </span>
        <button onClick={() => navMonth(1)} style={{ background: 'none', border: `1px solid ${COLORS.subtleBorder}`, borderRadius: 8, width: 36, height: 36, fontSize: 20, cursor: 'pointer', color: COLORS.textMedium }}>›</button>
      </div>

      <div style={{ background: '#fff', borderRadius: '1.5rem', padding: '22px 18px', boxShadow: '0 4px 20px rgba(0,0,0,0.05), 0 1px 4px rgba(0,0,0,0.04)', border: `1px solid ${COLORS.subtleBorder}`, maxWidth: 420, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, textAlign: 'center', marginBottom: 6 }}>
          {WEEKDAYS.map((w) => (
            <div key={w} style={{ textAlign: 'center', fontSize: '0.72rem', fontWeight: 600, color: COLORS.textMuted, padding: '4px 0' }}>{w}</div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, textAlign: 'center' }}>
          {calendarDays.map(({ day, date, isOther }, i) => {
            const isToday = date === today;
            const status = getDayStatus(date);
            let bg = COLORS.subtleBg2;
            if (status === 'full') bg = COLORS.successLightBg;
            else if (status === 'half') bg = COLORS.warning;

            return (
              <div
                key={i}
                style={{
                  padding: '8px 0',
                  borderRadius: '1rem',
                  cursor: 'default',
                  border: isToday ? '2px solid hsl(346, 84%, 61%)' : '2px solid transparent',
                  background: !isOther ? bg : 'transparent',
                  color: isOther ? 'transparent' : COLORS.textDark,
                  fontWeight: 400,
                  fontSize: 15,
                  textAlign: 'center',
                }}
              >
                {day}
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: COLORS.successLightBg, border: '1px solid hsl(142, 71%, 70%)' }} />
            <span style={{ fontSize: '0.72rem', color: COLORS.textMuted }}>完成</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: COLORS.warning, border: '1px solid hsl(45, 85%, 70%)' }} />
            <span style={{ fontSize: '0.72rem', color: COLORS.textMuted }}>部分</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 18, fontSize: '0.82rem', color: COLORS.textMedium, flexWrap: 'wrap' }}>
        <span>本月打卡：{stats.days} 天</span>
        <span>总次数：{stats.count} 次</span>
      </div>
    </div>
  );
}
