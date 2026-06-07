import { useState } from 'react';
import { COLORS, CATEGORIES } from '../lib/constants';
import { uid as genUid } from '../lib/api';
import Modal from './Modal';

export default function WishlistView({ items, onUpdate, currentUser, onShowToast }) {
  const [showAdd, setShowAdd] = useState(false);
  const [addContent, setAddContent] = useState('');
  const [addCategory, setAddCategory] = useState('other');
  const [filter, setFilter] = useState('all');
  const [deleteId, setDeleteId] = useState(null);

  // Filter by category only (show all users' items)
  const filteredItems =
    filter === 'all' ? (items || []) : (items || []).filter((item) => item.category === filter);

  const handleToggle = (itemId) => {
    const newItems = items.map((item) =>
      item.id === itemId ? { ...item, done: !item.done } : item
    );
    onUpdate(newItems);
  };

  const handleAdd = () => {
    if (!addContent.trim()) return;
    const newItem = {
      id: genUid(),
      category: addCategory,
      title: addContent.trim(),
      notes: '',
      createdBy: currentUser.id,
      createdAt: Date.now(),
      done: false,
      completedAt: null,
    };
    onUpdate([...(items || []), newItem]);
    setAddContent('');
    setShowAdd(false);
    onShowToast('愿望已添加');
  };

  const handleDelete = (itemId) => {
    onUpdate(items.filter((item) => item.id !== itemId));
    setDeleteId(null);
    onShowToast('已删除');
  };

  const getCategoryInfo = (catId) => {
    return CATEGORIES.find((c) => c.id === catId) || CATEGORIES[3];
  };

  const getUserBadge = (userId) => {
    if (userId === 'Diane') {
      return { bg: COLORS.dianeBadgeBg, color: COLORS.dianeBadgeColor, text: 'Diane' };
    }
    if (userId === '淡人') {
      return { bg: COLORS.lanrenBadgeBg, color: COLORS.lanrenBadgeColor, text: '懒人' };
    }
    return null;
  };

  const fmtDate = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Section header with add button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: COLORS.textDark, margin: 0 }}>
          我们的愿望清单
        </h3>
        <button
          onClick={() => setShowAdd(true)}
          style={{
            padding: '7px 16px',
            borderRadius: 999,
            border: 'none',
            background: COLORS.primary,
            color: '#fff',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: `0 4px 14px ${COLORS.primaryGlow}`,
          }}
        >
          + 添加
        </button>
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            border: 'none',
            borderRadius: 999,
            padding: '6px 14px',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer',
            background: filter === 'all' ? COLORS.textDark : '#fff',
            color: filter === 'all' ? '#fff' : COLORS.textMuted,
            boxShadow: filter === 'all' ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
            transition: 'all 0.15s',
          }}
        >
          全部
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            style={{
              border: 'none',
              borderRadius: 999,
              padding: '6px 14px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: filter === cat.id ? cat.color : '#fff',
              color: filter === cat.id ? '#fff' : COLORS.textMuted,
              boxShadow:
                filter === cat.id
                  ? `0 2px 8px ${cat.color}33`
                  : '0 1px 4px rgba(0,0,0,0.06)',
              transition: 'all 0.15s',
            }}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Items */}
      {filteredItems.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 0',
            color: COLORS.textMuted,
            fontSize: '0.88rem',
          }}
        >
          还没有愿望，添加一个吧！
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredItems.map((item) => {
            const cat = getCategoryInfo(item.category);
            const badge = getUserBadge(item.createdBy);

            return (
              <div
                key={item.id}
                style={{
                  borderRadius: '1.4rem',
                  border: item.done
                    ? '1.5px solid hsl(142, 71%, 70%)'
                    : `1.5px solid ${COLORS.subtleBorder}`,
                  background: item.done ? COLORS.successBg : '#fff',
                  padding: '16px 18px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                  }}
                >
                  {/* Category icon avatar */}
                  <button
                    onClick={() => handleToggle(item.id)}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      background: item.done
                        ? 'hsl(142, 71%, 75%)'
                        : `${cat.color}18`,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.1rem',
                      transition: 'background 0.2s',
                      flexShrink: 0,
                    }}
                  >
                    {item.done ? '✓' : cat.icon}
                  </button>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        color: item.done
                          ? 'hsl(142, 71%, 40%)'
                          : COLORS.textDark,
                        marginBottom: 4,
                        wordBreak: 'break-word',
                        textDecoration: item.done ? 'line-through' : 'none',
                      }}
                    >
                      {item.title}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        flexWrap: 'wrap',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          background: `${cat.color}18`,
                          color: cat.color,
                          padding: '2px 8px',
                          borderRadius: 999,
                        }}
                      >
                        {cat.icon} {cat.label}
                      </span>

                      {badge && (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            background: badge.bg,
                            color: badge.color,
                            padding: '2px 8px',
                            borderRadius: 999,
                          }}
                        >
                          {badge.text}
                        </span>
                      )}

                      {item.createdAt && (
                        <span style={{ fontSize: '0.65rem', color: COLORS.textMuted }}>
                          {fmtDate(item.createdAt)}
                        </span>
                      )}

                      {item.done && (
                        <>
                          <span
                            style={{
                              fontSize: '0.65rem',
                              color: COLORS.success,
                              fontWeight: 600,
                            }}
                          >
                            已实现
                          </span>
                          {item.completedAt && (
                            <span style={{ fontSize: '0.65rem', color: COLORS.textMuted }}>
                              {fmtDate(item.completedAt)}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Delete */}
                  {deleteId === item.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <button
                        onClick={() => handleDelete(item.id)}
                        style={{
                          border: 'none',
                          borderRadius: 999,
                          padding: '6px 10px',
                          background: COLORS.deleteRed,
                          color: '#fff',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        确认
                      </button>
                      <button
                        onClick={() => setDeleteId(null)}
                        style={{
                          border: 'none',
                          borderRadius: 999,
                          padding: '6px 10px',
                          background: COLORS.subtleBg,
                          color: COLORS.textMedium,
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                        }}
                      >
                        取消
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteId(item.id)}
                      style={{
                        border: 'none',
                        borderRadius: 999,
                        padding: '6px 10px',
                        background: COLORS.subtleBg,
                        color: COLORS.textMedium,
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      删除
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      <Modal visible={showAdd} onClose={() => { setShowAdd(false); setAddContent(''); }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: COLORS.textDark, margin: '0 0 20px 0', textAlign: 'center' }}>
          添加愿望
        </h3>

        <input
          type="text"
          placeholder="输入愿望..."
          value={addContent}
          onChange={(e) => setAddContent(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          autoFocus
          style={{
            width: '100%',
            padding: '12px 16px',
            border: `1.5px solid ${COLORS.subtleBorder}`,
            borderRadius: 999,
            fontSize: '0.95rem',
            color: COLORS.textDark,
            outline: 'none',
            background: COLORS.subtleBg2,
            marginBottom: 16,
            fontFamily: 'inherit',
            boxSizing: 'border-box',
          }}
        />

        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: COLORS.textMedium,
              marginBottom: 10,
            }}
          >
            分类
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setAddCategory(cat.id)}
                style={{
                  border: addCategory === cat.id ? `2px solid ${cat.color}` : `1.5px solid ${COLORS.subtleBorder}`,
                  borderRadius: 999,
                  padding: '8px 16px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: addCategory === cat.id ? `${cat.color}14` : '#fff',
                  color: addCategory === cat.id ? cat.color : COLORS.textMedium,
                  transition: 'all 0.15s',
                }}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => { setShowAdd(false); setAddContent(''); }}
            style={{
              flex: 1,
              padding: 13,
              borderRadius: 999,
              border: `1.5px solid ${COLORS.subtleBorder}`,
              background: '#fff',
              color: COLORS.textMedium,
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            取消
          </button>
          <button
            onClick={handleAdd}
            style={{
              flex: 1,
              padding: 13,
              borderRadius: 999,
              border: 'none',
              background: COLORS.primary,
              color: '#fff',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: `0 4px 14px ${COLORS.primaryGlow}`,
            }}
          >
            添加
          </button>
        </div>
      </Modal>
    </div>
  );
}
