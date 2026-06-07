import { useState, useEffect, useCallback } from 'react';
import FadeIn from './FadeIn';
import Modal from './Modal';
import Toast from './Toast';
import { fetchWishlist, saveWishlist, uid } from '../lib/api';

const CATEGORIES = [
  { id: 'travel', label: '旅行地', icon: '✈️', color: '#4a90d9' },
  { id: 'food', label: '美食', icon: '🍜', color: '#e87c3e' },
  { id: 'experience', label: '新体验', icon: '🌟', color: '#8b5cf6' },
  { id: 'other', label: '其他', icon: '🎀', color: '#d4708a' },
];

export default function WishlistView({ userId }) {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('travel');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userIdInput, setUserIdInput] = useState('');

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchWishlist();
      setItems(data);
    } catch (e) {
      setToast({ message: '加载失败', type: 'error' });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleAdd = async () => {
    if (!newContent.trim()) {
      setToast({ message: '请输入内容', type: 'error' });
      return;
    }
    try {
      const item = {
        id: uid(),
        content: newContent.trim(),
        userId: userId,
        category: newCategory,
        createdAt: new Date().toISOString(),
      };
      const updated = [...items, item];
      await saveWishlist(updated);
      setItems(updated);
      setNewContent('');
      setNewCategory('travel');
      setShowModal(false);
      setToast({ message: '已添加！', type: 'success' });
    } catch (e) {
      setToast({ message: '添加失败', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('确定删除这条愿望？')) return;
    try {
      const updated = items.filter((item) => item.id !== id);
      await saveWishlist(updated);
      setItems(updated);
      setToast({ message: '已删除', type: 'success' });
    } catch (e) {
      setToast({ message: '删除失败', type: 'error' });
    }
  };

  const handleToggleComplete = async (id) => {
    try {
      const updated = items.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      );
      await saveWishlist(updated);
      setItems(updated);
    } catch (e) {
      setToast({ message: '操作失败', type: 'error' });
    }
  };

  // Group by category
  const grouped = {};
  items.forEach((item) => {
    const cat = item.category || 'other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  });

  return (
    <FadeIn>
      <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />

      {/* Add button at top */}
      <div style={{ textAlign: 'right', marginBottom: 16 }}>
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: '6px 16px',
            borderRadius: 999,
            border: '1px solid #4a90d9',
            background: '#fff',
            color: '#4a90d9',
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          + 添加愿望
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#999', padding: 40 }}>加载中...</div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#bbb', padding: 40 }}>
          还没有愿望，快来添加吧！
        </div>
      ) : (
        CATEGORIES.map((cat) => {
          const catItems = grouped[cat.id] || [];
          if (catItems.length === 0) return null;
          return (
            <div key={cat.id} style={{ marginBottom: 20 }}>
              <h4 style={{ color: '#666', fontSize: 14, marginBottom: 8 }}>
                {cat.icon} {cat.label}
              </h4>
              {catItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#fff',
                    borderRadius: 10,
                    padding: '12px 16px',
                    marginBottom: 8,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    opacity: item.completed ? 0.5 : 1,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                    <span
                      onClick={() => handleToggleComplete(item.id)}
                      style={{
                        cursor: 'pointer',
                        fontSize: 18,
                        userSelect: 'none',
                      }}
                    >
                      {item.completed ? '✅' : '⬜'}
                    </span>
                    <span
                      style={{
                        fontSize: 15,
                        textDecoration: item.completed ? 'line-through' : 'none',
                        color: item.completed ? '#bbb' : '#333',
                      }}
                    >
                      {item.content}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#e74c3c',
                      cursor: 'pointer',
                      fontSize: 13,
                      flexShrink: 0,
                    }}
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
          );
        })
      )}

      {/* Add wish modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="添加愿望">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input
            placeholder="愿望内容"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            style={inputStyle}
          />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setNewCategory(cat.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 999,
                  border: newCategory === cat.id ? `2px solid ${cat.color}` : '1px solid #ddd',
                  background: newCategory === cat.id ? `${cat.color}15` : '#fff',
                  color: newCategory === cat.id ? cat.color : '#999',
                  fontSize: 13,
                  cursor: 'pointer',
                  fontWeight: newCategory === cat.id ? 600 : 400,
                }}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
          <button onClick={handleAdd} style={btnStyle}>
            提交
          </button>
        </div>
      </Modal>
    </FadeIn>
  );
}

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
