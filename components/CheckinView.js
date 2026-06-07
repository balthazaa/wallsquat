import { useState, useEffect, useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import FadeIn from './FadeIn';
import Modal from './Modal';
import Toast from './Toast';
import { fetchCheckins, saveCheckins } from '../lib/api';

function getDaysInMonth(year, month) {
  return dayjs(`${year}-${String(month).padStart(2, '0')}-01`).daysInMonth();
}

function getFirstDayOfWeek(year, month) {
  return dayjs(`${year}-${String(month).padStart(2, '0')}-01`).day();
}

function buildDateStr(year, month, day) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export default function CheckinView({ userId }) {
  const [year, setYear] = useState(dayjs().year());
  const [month, setMonth] = useState(dayjs().month() + 1);
  const [records, setRecords] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalDate, setModalDate] = useState('');
  const [modalDuration, setModalDuration] = useState('');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCheckins();
      setRecords(data);
    } catch (e) {
      setToast({ message: '加载失败', type: 'error' });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  // Filter records for current user + current month
  const filteredKeys = useMemo(() => {
    const prefix = `${year}-${String(month).padStart(2, '0')}`;
    return Object.keys(records).filter(
      (k) => k.startsWith(prefix) && records[k].userId === userId
    );
  }, [records, year, month, userId]);

  const checkinDateSet = useMemo(() => {
    return new Set(filteredKeys);
  }, [filteredKeys]);

  const totalDuration = filteredKeys.reduce((s, k) => s + (records[k].duration || 0), 0);
  const avgDuration = filteredKeys.length
    ? Math.round(totalDuration / filteredKeys.length)
    : 0;

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  const handlePrevMonth = () => {
    if (month === 1) { setYear(year - 1); setMonth(12); }
    else { setMonth(month - 1); }
  };

  const handleNextMonth = () => {
    if (month === 12) { setYear(year + 1); setMonth(1); }
    else { setMonth(month + 1); }
  };

  const handleDayClick = (day) => {
    setModalDate(buildDateStr(year, month, day));
    setModalDuration('');
    setShowModal(true);
  };

  const handleAddCheckin = async () => {
    const dur = Number(modalDuration);
    if (!modalDuration || isNaN(dur) || dur <= 0) {
      setToast({ message: '请输入有效时长', type: 'error' });
      return;
    }
    try {
      const updated = { ...records, [modalDate]: { duration: dur, userId } };
      await saveCheckins(updated);
      setRecords(updated);
      setToast({ message: '打卡成功！', type: 'success' });
      setShowModal(false);
    } catch (e) {
      setToast({ message: '打卡失败', type: 'error' });
    }
  };

  const handleDeleteCheckin = async (dateKey) => {
    if (!confirm(`确定删除 ${dateKey} 的记录？`)) return;
    try {
      const updated = { ...records };
      delete updated[dateKey];
      await saveCheckins(updated);
      setRecords(updated);
      setToast({ message: '已删除', type: 'success' });
    } catch (e) {
      setToast({ message: '删除失败', type: 'error' });
    }
  };

  // Build calendar cells
  const renderCells = [];
  for (let i = 0; i < firstDay; i++) {
    renderCells.push(<div key={`empty-${i}`} />);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = buildDateStr(year, month, d);
    const isChecked = checkinDateSet.has(dateStr);
    renderCells.push(
      <div
        key={d}
        onClick={() => handleDayClick(d)}
        style={{
          padding: '8px 0',
          borderRadius: 8,
          cursor: 'pointer',
          background: isChecked ? '#e8f4fd' : 'transparent',
          color: isChecked ? '#4a90d9' : '#333',
          fontWeight: isChecked ? 600 : 400,
          fontSize: 15,
          transition: 'background 0.15s',
          textAlign: 'center',
        }}
      >
        {d}
      </div>
    );
  }
  const remaining = totalCells - renderCells.length;
  for (let i = 0; i < remaining; i++) {
    renderCells.push(<div key={`end-${i}`} />);
  }

  // Sorted record list
  const sortedRecords = filteredKeys
    .slice()
    .sort((a, b) => (a > b ? -1 : 1));

  return (
    <FadeIn>
      <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />

      {/* Month navigator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 18,
          marginBottom: 18,
        }}
      >
        <button onClick={handlePrevMonth} style={navBtnStyle}>‹</button>
        <span style={{ fontSize: 18, fontWeight: 600, color: '#4a90d9' }}>
          {year}年{month}月
        </span>
        <button onClick={handleNextMonth} style={navBtnStyle}>›</button>
      </div>

      {/* Calendar grid */}
      <div
        style={{
          background: '#fff',
          borderRadius: 14,
          padding: 16,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          maxWidth: 400,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7,1fr)',
            gap: 4,
            textAlign: 'center',
            marginBottom: 6,
          }}
        >
          {WEEKDAYS.map((w) => (
            <div key={w} style={{ fontSize: 13, color: '#999', fontWeight: 500 }}>
              {w}
            </div>
          ))}
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7,1fr)',
            gap: 4,
            textAlign: 'center',
          }}
        >
          {renderCells}
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 32,
          marginTop: 18,
          fontSize: 14,
          color: '#666',
          flexWrap: 'wrap',
        }}
      >
        <span>本月打卡：{filteredKeys.length} 天</span>
        <span>总时长：{totalDuration} 分钟</span>
        <span>均值：{avgDuration} 分钟/天</span>
      </div>

      {/* Checkin list */}
      <div style={{ marginTop: 20, maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
        <h4 style={{ color: '#4a90d9', marginBottom: 10 }}>打卡记录</h4>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#999' }}>加载中...</div>
        ) : sortedRecords.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#bbb', padding: 20 }}>
            本月暂无记录
          </div>
        ) : (
          sortedRecords.map((dateKey) => (
            <div
              key={dateKey}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#fff',
                borderRadius: 10,
                padding: '10px 16px',
                marginBottom: 8,
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}
            >
              <span style={{ fontSize: 15 }}>
                {dateKey} — {records[dateKey].duration} 分钟
              </span>
              <button
                onClick={() => handleDeleteCheckin(dateKey)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#e74c3c',
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                删除
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add checkin modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="添加打卡记录">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label style={{ fontSize: 14, color: '#555' }}>
            日期：<b>{modalDate}</b>
          </label>
          <input
            type="number"
            placeholder="时长（分钟）"
            value={modalDuration}
            onChange={(e) => setModalDuration(e.target.value)}
            style={inputStyle}
          />
          <button onClick={handleAddCheckin} style={btnStyle}>
            提交
          </button>
        </div>
      </Modal>
    </FadeIn>
  );
}

const navBtnStyle = {
  background: 'none',
  border: '1px solid #ddd',
  borderRadius: 8,
  width: 36,
  height: 36,
  fontSize: 20,
  cursor: 'pointer',
  color: '#4a90d9',
};

const inputStyle = {
  padding: '10px 14px',
  borderRadius: 8,
  border: '1px solid #ddd',
  fontSize: 15,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};

const btnStyle = {
  padding: '10px 0',
  borderRadius: 8,
  border: 'none',
  background: '#4a90d9',
  color: '#fff',
  fontSize: 15,
  fontWeight: 600,
  cursor: 'pointer',
  width: '100%',
};
