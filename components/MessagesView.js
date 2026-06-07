import { useState, useEffect, useCallback } from 'react';
import FadeIn from './FadeIn';
import Modal from './Modal';
import Toast from './Toast';
import { fetchMessages, saveMessages, uid } from '../lib/api';
import { USERS } from '../lib/constants';

export default function MessagesView() {
  const [messages, setMessages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newUser, setNewUser] = useState(USERS.DIANE.id);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMessages();
      setMessages(data);
    } catch (e) {
      setToast({ message: '加载失败', type: 'error' });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleAdd = async () => {
    if (!newContent.trim()) {
      setToast({ message: '请输入内容', type: 'error' });
      return;
    }
    try {
      const name = newUser === USERS.DIANE.id ? USERS.DIANE.name : USERS.LANREN.name;
      const msg = {
        id: uid(),
        content: newContent.trim(),
        user: name,
        userId: newUser,
        createdAt: new Date().toISOString(),
      };
      const updated = [...messages, msg];
      await saveMessages(updated);
      setMessages(updated);
      setNewContent('');
      setShowModal(false);
      setToast({ message: '留言成功！', type: 'success' });
    } catch (e) {
      setToast({ message: '留言失败', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('确定删除这条留言？')) return;
    try {
      const updated = messages.filter((m) => m.id !== id);
      await saveMessages(updated);
      setMessages(updated);
      setToast({ message: '已删除', type: 'success' });
    } catch (e) {
      setToast({ message: '删除失败', type: 'error' });
    }
  };

  const sorted = messages.slice().sort((a, b) => {
    if (a.createdAt < b.createdAt) return 1;
    if (a.createdAt > b.createdAt) return -1;
    return 0;
  });

  return (
    <FadeIn>
      <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />

      {/* Add button */}
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
          + 写留言
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#999', padding: 40 }}>加载中...</div>
      ) : sorted.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#bbb', padding: 40 }}>
          还没有留言，来说点什么吧！
        </div>
      ) : (
        <div style={{ maxWidth: 420, margin: '0 auto' }}>
          {sorted.map((msg) => (
            <div
              key={msg.id}
              style={{
                background: '#fff',
                borderRadius: 12,
                padding: '14px 16px',
                marginBottom: 10,
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 6,
                  fontSize: 13,
                  color: '#999',
                }}
              >
                <span style={{ fontWeight: 500, color: '#4a90d9' }}>
                  {msg.user || '匿名'}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span>
                    {msg.createdAt
                      ? new Date(msg.createdAt).toLocaleDateString('zh-CN')
                      : ''}
                  </span>
                  <button
                    onClick={() => handleDelete(msg.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#e74c3c',
                      cursor: 'pointer',
                      fontSize: 12,
                    }}
                  >
                    删除
                  </button>
                </div>
              </div>
              <div style={{ fontSize: 15, lineHeight: 1.6, color: '#333' }}>
                {msg.content}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add message modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="写留言">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setNewUser(USERS.DIANE.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 999,
                border: newUser === USERS.DIANE.id ? '2px solid #4a90d9' : '1px solid #ddd',
                background: newUser === USERS.DIANE.id ? '#e8f4fd' : '#fff',
                color: newUser === USERS.DIANE.id ? '#4a90d9' : '#999',
                fontSize: 13,
                cursor: 'pointer',
                fontWeight: newUser === USERS.DIANE.id ? 600 : 400,
              }}
            >
              {USERS.DIANE.name}
            </button>
            <button
              onClick={() => setNewUser(USERS.LANREN.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 999,
                border: newUser === USERS.LANREN.id ? '2px solid #4a90d9' : '1px solid #ddd',
                background: newUser === USERS.LANREN.id ? '#e8f4fd' : '#fff',
                color: newUser === USERS.LANREN.id ? '#4a90d9' : '#999',
                fontSize: 13,
                cursor: 'pointer',
                fontWeight: newUser === USERS.LANREN.id ? 600 : 400,
              }}
            >
              {USERS.LANREN.name}
            </button>
          </div>
          <textarea
            placeholder="想说点什么..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={3}
            style={{
              ...inputStyle,
              resize: 'vertical',
              minHeight: 80,
            }}
          />
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
