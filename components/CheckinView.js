import { useState, useMemo } from 'react';
import { COLORS } from '../lib/constants';
import Modal from './Modal';

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

const TIME_SLOTS = [
  { id: 'am', label: '上午打卡', subLabel: '6:00 — 14:00', icon: '☀️' },
  { id: 'pm', label: '下午打卡', subLabel: '14:00 — 22:00', icon: '🌙' },
];

// D1 format: { "YYYY-MM-DD": { "userId": { "am"|"pm": { done, time } } } }
export default function CheckinView({ checkins, onUpdate, currentUser, onShowToast }) {
  const today = new Date().toISOString().slice(0, 10);
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showMakeup, setShowMakeup] = useState(false);

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
  // Monday-first: 0=Mon ... 6=Sun
  const firstDay = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
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

  // Handle makeup checkin for a past date
  const handleMakeupCheckin = (date, slotId) => {
    const newCheckins = JSON.parse(JSON.stringify(checkins || {}));
    if (!newCheckins[date]) newCheckins[date] = {};
    if (!newCheckins[date][currentUser.id]) newCheckins[date][currentUser.id] = {};
    newCheckins[date][currentUser.id][slotId] = { done: true, time: Date.now() };
    onUpdate(newCheckins);
    onShowToast(`${date} ${TIME_SLOTS.find(s => s.id === slotId)?.label} 已补卡`);
  };

  // Handle cancel makeup
  const handleMakeupCancel = (date, slotId) => {
    const newCheckins = JSON.parse(JSON.stringify(checkins || {}));
    const dayData = newCheckins[date];
    if (dayData?.[currentUser.id]) {
      delete dayData[currentUser.id][slotId];
      if (Object.keys(dayData[currentUser.id]).length === 0) {
        delete dayData[currentUser.id];
      }
      if (Object.keys(dayData).length === 0) {
        delete newCheckins[date];
      }
    }
    onUpdate(newCheckins);
    onShowToast('已取消补卡');
  };

  // Format date for display
  const fmtDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${y}年${parseInt(m)}月${parseInt(d)}日`;
  };

  // Format timestamp to HH:MM
  const fmtTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
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
                  {info ? `已完成 ${fmtTime(info.time)}` : slot.subLabel}
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

      {/* Calendar Month Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 420, margin: '0 auto 16px' }}>
        <button
          onClick={() => navMonth(-1)}
          style={{
            background: '#fff',
            border: 'none',
            borderRadius: 14,
            width: 40,
            height: 28,
            fontSize: 18,
            cursor: 'pointer',
            color: COLORS.textLight,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            lineHeight: 1,
          }}
        >
          ‹
        </button>
        <span style={{ fontSize: '1.05rem', fontWeight: 700, color: COLORS.textDark }}>
          {viewYear}年{viewMonth + 1}月
        </span>
        <button
          onClick={() => navMonth(1)}
          style={{
            background: '#fff',
            border: 'none',
            borderRadius: 14,
            width: 40,
            height: 28,
            fontSize: 18,
            cursor: 'pointer',
            color: COLORS.textLight,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            lineHeight: 1,
          }}
        >
          ›
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: '1.5rem', padding: '22px 18px', boxShadow: '0 4px 20px rgba(0,0,0,0.05), 0 1px 4px rgba(0,0,0,0.04)', border: `1px solid ${COLORS.subtleBorder}`, maxWidth: 420, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, textAlign: 'center', marginBottom: 6 }}>
          {WEEKDAYS.map((w) => (
            <div key={w} style={{ textAlign: 'center', fontSize: '0.72rem', fontWeight: 600, color: COLORS.textMuted, padding: '4px 0' }}>{w}</div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, textAlign: 'center' }}>
          {calendarDays.map(({ day, date, isOther }, i) => {
            if (!date) {
              return <div key={i} />;
            }
            const isToday = date === today;
            const isFuture = date > today;
            const status = getDayStatus(date);
            let bg = COLORS.subtleBg2;
            if (status === 'full') bg = COLORS.successLightBg;
            else if (status === 'half') bg = COLORS.warning;

            const canClick = !isOther && !isFuture;

            return (
              <div
                key={i}
                onClick={() => {
                  if (canClick) {
                    setSelectedDate(date);
                    setShowMakeup(true);
                  }
                }}
                style={{
                  padding: '8px 0',
                  borderRadius: '1rem',
                  cursor: canClick ? 'pointer' : 'default',
                  border: isToday ? '2px solid hsl(346, 84%, 61%)' : '2px solid transparent',
                  background: isFuture || isOther ? COLORS.subtleBg2 : bg,
                  color: isOther ? 'transparent' : isFuture ? COLORS.textDisabled : COLORS.textDark,
                  fontWeight: 400,
                  fontSize: 15,
                  textAlign: 'center',
                  opacity: isFuture ? 0.45 : 1,
                  transition: canClick ? 'all 0.15s' : 'none',
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
            <span style={{ fontSize: '0.72rem', color: COLORS.textMuted }}>2次</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: COLORS.warning, border: '1px solid hsl(45, 85%, 70%)' }} />
            <span style={{ fontSize: '0.72rem', color: COLORS.textMuted }}>1次</span>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <span style={{ fontSize: '0.65rem', color: COLORS.textLight }}>
            点击已过去的日期可以补卡
          </span>
        </div>
      </div>

      {/* Tips */}
      <div style={{ maxWidth: 420, margin: '16px auto 0', display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        <span style={{ fontSize: '0.7rem', padding: '4px 12px', borderRadius: 999, background: '#fff', color: COLORS.textMedium, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>并脚</span>
        <span style={{ fontSize: '0.7rem', padding: '4px 12px', borderRadius: 999, background: '#fff', color: COLORS.textMedium, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>收住头部</span>
        <span style={{ fontSize: '0.7rem', padding: '4px 12px', borderRadius: 999, background: '#fff', color: COLORS.textMedium, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>慢做</span>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 18, fontSize: '0.82rem', color: COLORS.textMedium, flexWrap: 'wrap' }}>
        <span>本月打卡：{stats.days} 天</span>
        <span>总次数：{stats.count} 次</span>
      </div>

      {/* Makeup Modal */}
      <Modal visible={showMakeup} onClose={() => { setShowMakeup(false); setSelectedDate(null); }} showClose>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: COLORS.textDark, margin: '0 0 6px 0', textAlign: 'center' }}>
          补卡
        </h3>
        <p style={{ fontSize: '0.82rem', color: COLORS.textMuted, textAlign: 'center', marginBottom: 20 }}>
          {fmtDateDisplay(selectedDate)}
        </p>

        {TIME_SLOTS.map((slot) => {
          const info = selectedDate ? getSlotInfo(selectedDate, slot.id) : null;
          return (
            <div
              key={slot.id}
              style={{
                borderRadius: '1.2rem',
                border: info
                  ? '1.5px solid hsl(142, 71%, 70%)'
                  : `1.5px solid ${COLORS.subtleBorder}`,
                background: info ? 'hsl(142, 76%, 96%)' : COLORS.subtleBg2,
                padding: '12px 16px',
                marginBottom: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{slot.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: COLORS.textDark }}>
                  {slot.label}
                </div>
                <div style={{ fontSize: '0.7rem', color: COLORS.textMuted, marginTop: 2 }}>
                  {info ? '已打卡' : slot.subLabel}
                </div>
              </div>
              {info ? (
                <button
                  onClick={() => handleMakeupCancel(selectedDate, slot.id)}
                  style={{
                    border: 'none',
                    borderRadius: 999,
                    padding: '7px 14px',
                    background: 'hsl(142, 71%, 90%)',
                    color: 'hsl(142, 71%, 35%)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  取消
                </button>
              ) : (
                <button
                  onClick={() => handleMakeupCheckin(selectedDate, slot.id)}
                  style={{
                    border: 'none',
                    borderRadius: 999,
                    padding: '8px 16px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: COLORS.primary,
                    color: '#fff',
                    boxShadow: `0 4px 14px ${COLORS.primaryGlow}`,
                  }}
                >
                  补卡
                </button>
              )}
            </div>
          );
        })}

        <button
          onClick={() => { setShowMakeup(false); setSelectedDate(null); }}
          style={{
            display: 'block',
            width: '100%',
            marginTop: 12,
            padding: '10px 0',
            border: `1.5px solid ${COLORS.subtleBorder}`,
            borderRadius: '1rem',
            background: '#fff',
            color: COLORS.textMedium,
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            textAlign: 'center',
          }}
        >
          关闭
        </button>
      </Modal>
    </div>
  );
}
