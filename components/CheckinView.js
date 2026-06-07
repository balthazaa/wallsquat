import { useState, useEffect } from 'react';
import { COLORS, TIME_SLOTS } from '../lib/constants';

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatMinutes(mins) {
  if (!mins) return '0';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}hr ${m}min` : `${m}min`;
}

function getFirstDayOfMonth(y, m) {
  return new Date(y, m, 1).getDay();
}

function getDaysInMonth(y, m) {
  return new Date(y, m + 1, 0).getDate();
}

export default function CheckinView({ checkins, onUpdate, currentUser, onShowToast }) {
  const today = getToday();
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(today);

  // Calendar data
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const totalDays = getDaysInMonth(viewYear, viewMonth);
  const prevTotalDays = getDaysInMonth(viewYear, viewMonth - 1);

  const calendarDays = [];
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

  // Previous month fill
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarDays.push({
      day: prevTotalDays - i,
      date: getDateStr(new Date(viewYear, viewMonth - 1, prevTotalDays - i)),
      isOtherMonth: true,
    });
  }

  // Current month
  for (let d = 1; d <= totalDays; d++) {
    const date = getDateStr(new Date(viewYear, viewMonth, d));
    calendarDays.push({ day: d, date, isOtherMonth: false });
  }

  // Fill remaining cells
  const remaining = 7 - (calendarDays.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      calendarDays.push({
        day: d,
        date: getDateStr(new Date(viewYear, viewMonth + 1, d)),
        isOtherMonth: true,
      });
    }
  }

  // Compute stats
  let monthCount = 0;
  let monthMinutes = 0;
  Object.keys(checkins).forEach((k) => {
    if (!k.startsWith(`${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`))
      return;
    if (!checkins[k]) return;
    monthMinutes += checkins[k].duration || 0;
  });
  // Count unique days in month with any checkin
  const monthDays = new Set();
  Object.keys(checkins).forEach((k) => {
    if (!k.startsWith(`${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`))
      return;
    if (!checkins[k]) return;
    monthDays.add(k.slice(0, 10));
  });
  monthCount = monthDays.size;

  // Today's checkins
  const todayAM = checkins[`${today}_am`];
  const todayPM = checkins[`${today}_pm`];

  function navMonth(delta) {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) {
      m = 11;
      y--;
    } else if (m > 11) {
      m = 0;
      y++;
    }
    setViewMonth(m);
    setViewYear(y);
  }

  function getDayStatus(date) {
    const am = checkins[`${date}_am`];
    const pm = checkins[`${date}_pm`];
    if (am && pm) return 'full';
    if (am || pm) return 'half';
    return 'none';
  }

  function handleAddSlot(slotId, duration) {
    const key = `${selectedDate}_${slotId}`;
    const newCheckins = { ...checkins };
    newCheckins[key] = { duration, userId: currentUser.id };
    onUpdate(newCheckins);
    onShowToast('已添加');
  }

  function handleDeleteSlot(slotId) {
    const key = `${selectedDate}_${slotId}`;
    const newCheckins = { ...checkins };
    delete newCheckins[key];
    onUpdate(newCheckins);
    onShowToast('已删除');
  }

  // Records for selected date
  const selectedAM = checkins[`${selectedDate}_am`];
  const selectedPM = checkins[`${selectedDate}_pm`];
  const selectedSlots = [];
  if (selectedAM) selectedSlots.push({ id: 'am', ...selectedAM, slot: TIME_SLOTS[0] });
  if (selectedPM) selectedSlots.push({ id: 'pm', ...selectedPM, slot: TIME_SLOTS[1] });

  // Records for the month
  const monthRecords = [];
  Object.keys(checkins).forEach((k) => {
    if (!k.startsWith(`${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`))
      return;
    if (!checkins[k]) return;
    const date = k.slice(0, 10);
    const slotId = k.slice(11);
    const slot = TIME_SLOTS.find((s) => s.id === slotId);
    monthRecords.push({ date, slotId, duration: checkins[k].duration, slot });
  });
  monthRecords.sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      {/* ---- Today Checkin Cards (moved above calendar) ---- */}
      <div style={{ marginBottom: 24, maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
        <h3 style={{ color: COLORS.textDark, marginBottom: 14, fontSize: '1.05rem', fontWeight: 700 }}>
          今日打卡
        </h3>

        {TIME_SLOTS.map((slot) => {
          const hasCheckin = checkins[`${today}_${slot.id}`];

          return (
            <div
              key={slot.id}
              style={{
                borderRadius: '1.6rem',
                border: hasCheckin
                  ? `1.5px solid hsl(142, 71%, 70%)`
                  : `1.5px solid ${COLORS.subtleBorder}`,
                background: hasCheckin ? 'hsl(142, 76%, 96%)' : '#fff',
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
                  {hasCheckin ? `已完成 ${formatMinutes(hasCheckin.duration)}` : slot.subLabel}
                </div>
              </div>
              {hasCheckin ? (
                <button
                  onClick={() => {
                    const key = `${today}_${slot.id}`;
                    const newCheckins = { ...checkins };
                    delete newCheckins[key];
                    onUpdate(newCheckins);
                    onShowToast('已取消');
                  }}
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
                  onClick={() => {
                    const key = `${today}_${slot.id}`;
                    const newCheckins = { ...checkins };
                    newCheckins[key] = { duration: 30, userId: currentUser.id };
                    onUpdate(newCheckins);
                    onShowToast('已打卡');
                  }}
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

      {/* ---- Calendar ---- */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 18,
          marginBottom: 16,
        }}
      >
        <button
          onClick={() => navMonth(-1)}
          style={{
            background: 'none',
            border: `1px solid ${COLORS.subtleBorder}`,
            borderRadius: 8,
            width: 36,
            height: 36,
            fontSize: 20,
            cursor: 'pointer',
            color: COLORS.textMedium,
          }}
        >
          ‹
        </button>
        <span
          style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            color: COLORS.textDark,
          }}
        >
          {viewYear}年{viewMonth + 1}月
        </span>
        <button
          onClick={() => navMonth(1)}
          style={{
            background: 'none',
            border: `1px solid ${COLORS.subtleBorder}`,
            borderRadius: 8,
            width: 36,
            height: 36,
            fontSize: 20,
            cursor: 'pointer',
            color: COLORS.textMedium,
          }}
        >
          ›
        </button>
      </div>

      <div
        style={{
          background: '#fff',
          borderRadius: '1.5rem',
          padding: '22px 18px',
          boxShadow:
            '0 4px 20px rgba(0,0,0,0.05), 0 1px 4px rgba(0,0,0,0.04)',
          border: `1px solid ${COLORS.subtleBorder}`,
          maxWidth: 420,
          margin: '0 auto',
        }}
      >
        {/* Weekday headers */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 4,
            textAlign: 'center',
            marginBottom: 6,
          }}
        >
          {weekdays.map((w) => (
            <div
              key={w}
              style={{
                textAlign: 'center',
                fontSize: '0.72rem',
                fontWeight: 600,
                color: COLORS.textMuted,
                padding: '4px 0',
              }}
            >
              {w}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 4,
            textAlign: 'center',
          }}
        >
          {calendarDays.map(({ day, date, isOtherMonth }, i) => {
            const isToday = date === today;
            const status = getDayStatus(date);
            const isSelected = date === selectedDate;
            const isOther = isOtherMonth;

            let bg;
            if (status === 'full') bg = COLORS.successLightBg;
            else if (status === 'half') bg = COLORS.warning;
            else bg = COLORS.subtleBg2;

            return (
              <div
                key={i}
                onClick={() => {
                  if (!isOther) setSelectedDate(date);
                }}
                style={{
                  padding: '8px 0',
                  borderRadius: '1rem',
                  cursor: isOther ? 'default' : 'pointer',
                  border: isToday
                    ? '2px solid hsl(346, 84%, 61%)'
                    : '2px solid transparent',
                  background: isSelected && !isOther ? bg : isOther ? 'transparent' : bg,
                  color: isOther ? COLORS.textDisabled : COLORS.textDark,
                  fontWeight: 400,
                  fontSize: 15,
                  transition: 'background 0.15s',
                  textAlign: 'center',
                }}
              >
                {day}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 16,
            marginTop: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 3,
                background: COLORS.successLightBg,
                border: '1px solid hsl(142, 71%, 70%)',
              }}
            />
            <span style={{ fontSize: '0.72rem', color: COLORS.textMuted }}>
              完成
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 3,
                background: COLORS.warning,
                border: '1px solid hsl(45, 85%, 70%)',
              }}
            />
            <span style={{ fontSize: '0.72rem', color: COLORS.textMuted }}>
              部分
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 24,
          marginTop: 18,
          fontSize: '0.82rem',
          color: COLORS.textMedium,
          flexWrap: 'wrap',
        }}
      >
        <span>本月打卡：{monthCount} 天</span>
        <span>总时长：{monthMinutes} 分钟</span>
        <span>均值：{monthCount > 0 ? Math.round(monthMinutes / monthCount) : 0} 分钟/天</span>
      </div>

      {/* Monthly record list */}
      {monthRecords.length > 0 && (
        <div style={{ marginTop: 24, maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
          <h4 style={{ color: COLORS.textMedium, marginBottom: 8, fontSize: '0.82rem', fontWeight: 600 }}>
            本月记录
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {monthRecords.map((rec, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.8rem',
                  color: COLORS.textMedium,
                  padding: '4px 0',
                }}
              >
                <span style={{ color: COLORS.textMuted, width: 80 }}>
                  {rec.date.slice(5)}
                </span>
                <span>{rec.slot?.label || rec.slotId}</span>
                <span style={{ color: COLORS.textDark, fontWeight: 500 }}>
                  {formatMinutes(rec.duration)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
