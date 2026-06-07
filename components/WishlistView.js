import { useState } from 'react';
import { COLORS, CATEGORIES, USERS } from '../lib/constants';
import { uid as genUid } from '../lib/api';
import Modal from './Modal';

export default function WishlistView({ items, onUpdate, currentUser, onShowToast }) {
  // Add modal state
  const [showAdd, setShowAdd] = useState(false);
  const [addSender, setAddSender] = useState(USERS[1].id); // default 懒人
  const [addCategory, setAddCategory] = useState('travel');
  const [addTitle, setAddTitle] = useState('');
  const [addNotes, setAddNotes] = useState('');

  // Edit modal state
  const [editingItem, setEditingItem] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Filter + delete
  const [filter, setFilter] = useState('all');
  const [deleteId, setDeleteId] = useState(null);

  // Filter by category only (show all users' items)
  const filteredItems =
    filter === 'all' ? (items || []) : (items || []).filter((item) => item.category === filter);

  const handleToggle = (itemId) => {
    const now = Date.now();
    const newItems = items.map((item) =>
      item.id === itemId
        ? { ...item, done: !item.done, completedAt: item.done ? null : now }
        : item
    );
    onUpdate(newItems);
  };

  const handleAdd = () => {
    if (!addTitle.trim()) return;
    const newItem = {
      id: genUid(),
      category: addCategory,
      title: addTitle.trim(),
      notes: addNotes.trim(),
      createdBy: addSender,
      createdAt: Date.now(),
      done: false,
      completedAt: null,
    };
    onUpdate([newItem, ...(items || [])]);
    setAddTitle('');
    setAddNotes('');
    setAddCategory('travel');
    setAddSender(USERS[1].id);
    setShowAdd(false);
    onShowToast('愿望已添加');
  };

  // Open edit modal
  const openEdit = (item) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditCategory(item.category);
    setEditNotes(item.notes || '');
  };

  // Save edit
  const handleSaveEdit = () => {
    if (!editTitle.trim() || !editingItem) return;
    const newItems = items.map((item) =>
      item.id === editingItem.id
        ? { ...item, title: editTitle.trim(), category: editCategory, notes: editNotes.trim() }
        : item
    );
    onUpdate(newItems);
    setEditingItem(null);
    onShowToast('愿望已更新');
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
                      position: 'relative',
                    }}
                  >
                    <span style={{ opacity: item.done ? 0.4 : 1 }}>{cat.icon}</span>
                    {item.done && (
                      <span style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: 'hsl(142, 71%, 30%)',
                      }}>
                        ✓
                      </span>
                    )}
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
                    </div>

                    {item.createdAt && (
                      <div style={{ fontSize: '0.65rem', color: COLORS.textMuted, marginTop: 3 }}>
                        {fmtDate(item.createdAt)}
                      </div>
                    )}

                    {item.done && (
                      <div style={{ fontSize: '0.65rem', color: COLORS.success, fontWeight: 600, marginTop: 2 }}>
                        ✓ {item.completedAt ? fmtDate(item.completedAt) : ''}已完成
                      </div>
                    )}
                  </div>

                  {/* Edit + Delete */}
                  {deleteId === item.id ? (
                    <div style={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
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
                    <div style={{ display: 'flex', flexDirection: 'row', gap: 4, alignItems: 'center' }}>
                      <button
                        onClick={() => openEdit(item)}
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
                        编辑
                      </button>
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
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      <Modal visible={showAdd} onClose={() => { setShowAdd(false); setAddTitle(''); setAddNotes(''); }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: COLORS.textDark, margin: '0 0 20px 0', textAlign: 'center' }}>
          添加愿望
        </h3>

        {/* Sender selector */}
        <div style={{ marginBottom: 6 }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: COLORS.textMedium, marginBottom: 8 }}>
            发起人
          </div>
          <div style={{ display: 'inline-flex', gap: 0, padding: 3, background: COLORS.subtleBg2, borderRadius: 999 }}>
            {USERS.map((user) => {
              const active = addSender === user.id;
              const isDiane = user.id === USERS[0].id;
              const avatarBg = isDiane ? COLORS.primary : COLORS.lanrenPrimary;
              const avatarEmoji = isDiane ? 'D' : '懒';
              return (
                <button
                  key={user.id}
                  onClick={() => setAddSender(user.id)}
                  style={{
                    width: 90,
                    padding: '7px 4px',
                    border: 'none',
                    borderRadius: 999,
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    background: active ? avatarBg : 'transparent',
                    color: active ? '#fff' : COLORS.textMuted,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 5,
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: active ? 'rgba(255,255,255,0.3)' : avatarBg,
                    color: '#fff',
                    fontSize: '0.55rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {avatarEmoji}
                  </span>
                  {user.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category selector */}
        <div style={{ marginBottom: 6, marginTop: 16 }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: COLORS.textMedium, marginBottom: 8 }}>
            分类
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setAddCategory(cat.id)}
                style={{
                  border: 'none',
                  borderRadius: 999,
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: addCategory === cat.id ? `${cat.color}18` : COLORS.subtleBg2,
                  color: addCategory === cat.id ? cat.color : COLORS.textMedium,
                  transition: 'all 0.15s',
                }}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Wish title */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: COLORS.textMedium, marginBottom: 8 }}>
            愿望
          </div>
          <input
            type="text"
            placeholder="输入愿望..."
            value={addTitle}
            onChange={(e) => setAddTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            autoFocus
            style={{
              width: '100%',
              padding: '11px 14px',
              border: `1.5px solid ${COLORS.subtleBorder}`,
              borderRadius: '1rem',
              fontSize: '0.92rem',
              color: COLORS.textDark,
              outline: 'none',
              background: COLORS.subtleBg2,
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Notes (optional) */}
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: COLORS.textMedium, marginBottom: 8 }}>
            备注 <span style={{ fontWeight: 400, color: COLORS.textLight }}>(选填)</span>
          </div>
          <textarea
            placeholder="可以写一些细节，比如具体时间地点、预算、发起这个心愿的原因……"
            value={addNotes}
            onChange={(e) => setAddNotes(e.target.value)}
            rows={2}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: `1.5px solid ${COLORS.subtleBorder}`,
              borderRadius: '1rem',
              fontSize: '0.88rem',
              color: COLORS.textDark,
              outline: 'none',
              background: COLORS.subtleBg2,
              fontFamily: 'inherit',
              resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button
            onClick={() => { setShowAdd(false); setAddTitle(''); setAddNotes(''); }}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 999,
              border: `1.5px solid ${COLORS.subtleBorder}`,
              background: '#fff',
              color: COLORS.textMedium,
              fontSize: '0.88rem',
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
              padding: 12,
              borderRadius: 999,
              border: 'none',
              background: COLORS.primary,
              color: '#fff',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: `0 4px 14px ${COLORS.primaryGlow}`,
            }}
          >
            添加
          </button>
        </div>
      </Modal>
      {/* Edit Modal */}
      <Modal visible={!!editingItem} onClose={() => setEditingItem(null)}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: COLORS.textDark, margin: '0 0 20px 0', textAlign: 'center' }}>
          编辑愿望
        </h3>

        {/* Category selector */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: COLORS.textMedium, marginBottom: 8 }}>
            分类
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setEditCategory(cat.id)}
                style={{
                  border: editCategory === cat.id ? `2px solid ${cat.color}` : `1.5px solid ${COLORS.subtleBorder}`,
                  borderRadius: 999,
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: editCategory === cat.id ? `${cat.color}14` : '#fff',
                  color: editCategory === cat.id ? cat.color : COLORS.textMedium,
                  transition: 'all 0.15s',
                }}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: COLORS.textMedium, marginBottom: 8 }}>
            愿望
          </div>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
            autoFocus
            style={{
              width: '100%',
              padding: '11px 14px',
              border: `1.5px solid ${COLORS.subtleBorder}`,
              borderRadius: '1rem',
              fontSize: '0.92rem',
              color: COLORS.textDark,
              outline: 'none',
              background: COLORS.subtleBg2,
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Notes */}
        <div style={{ marginBottom: 6 }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: COLORS.textMedium, marginBottom: 8 }}>
            备注 <span style={{ fontWeight: 400, color: COLORS.textLight }}>(选填)</span>
          </div>
          <textarea
            value={editNotes}
            onChange={(e) => setEditNotes(e.target.value)}
            rows={2}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: `1.5px solid ${COLORS.subtleBorder}`,
              borderRadius: '1rem',
              fontSize: '0.88rem',
              color: COLORS.textDark,
              outline: 'none',
              background: COLORS.subtleBg2,
              fontFamily: 'inherit',
              resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button
            onClick={() => setEditingItem(null)}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 999,
              border: `1.5px solid ${COLORS.subtleBorder}`,
              background: '#fff',
              color: COLORS.textMedium,
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            取消
          </button>
          <button
            onClick={handleSaveEdit}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 999,
              border: 'none',
              background: COLORS.primary,
              color: '#fff',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: `0 4px 14px ${COLORS.primaryGlow}`,
            }}
          >
            保存
          </button>
        </div>
      </Modal>
    </div>
  );
}
