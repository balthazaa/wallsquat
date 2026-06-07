import { useState } from 'react';
import { COLORS, USERS } from '../lib/constants';
import { uid as genUid } from '../lib/api';
import Modal from './Modal';

function senderAvatar(sender) {
  if (sender === 'Diane') return { bg: COLORS.primary, emoji: 'D', color: '#fff', border: COLORS.primary };
  return { bg: COLORS.lanrenPrimary, emoji: '懒', color: '#fff', border: COLORS.lanrenPrimary };
}

function formatTime(iso) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function formatDateLabel(iso) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

function groupByDate(msgs) {
  const groups = [];
  let currentDate = null;
  msgs.forEach((msg) => {
    const dateLabel = formatDateLabel(msg.createdAt);
    if (dateLabel !== currentDate) {
      currentDate = dateLabel;
      groups.push({ type: 'date', label: dateLabel });
    }
    groups.push({ type: 'msg', data: msg });
  });
  return groups;
}

export default function MessagesView({ messages, onUpdate, currentUser, onShowToast }) {
  const [text, setText] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [sendAs, setSendAs] = useState(USERS[1].id); // default 懒人
  const [deleteId, setDeleteId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editContent, setEditContent] = useState('');

  const handleSend = () => {
    if (!text.trim()) return;
    const newMsg = {
      id: genUid(),
      content: text.trim(),
      sender: sendAs,
      createdAt: new Date().toISOString(),
    };
    onUpdate([newMsg, ...(messages || [])]);
    setText('');
    setSendAs(USERS[1].id); // reset to 懒人
    setShowInput(false);
    onShowToast('留言已发送');
  };

  const handleDelete = (msgId) => {
    onUpdate(messages.filter((m) => m.id !== msgId));
    setDeleteId(null);
    onShowToast('已删除');
  };

  const openEdit = (msg) => {
    setEditId(msg.id);
    setEditContent(msg.content);
  };

  const handleSaveEdit = () => {
    if (!editContent.trim()) return;
    onUpdate(messages.map((m) =>
      m.id === editId ? { ...m, content: editContent.trim() } : m
    ));
    setEditId(null);
    setEditContent('');
    onShowToast('留言已更新');
  };

  const grouped = groupByDate(messages || []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Section header with send button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: COLORS.textDark, margin: 0 }}>
          留言板
        </h3>
        <button
          onClick={() => setShowInput(true)}
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
          + 发消息
        </button>
      </div>

      {/* Send Modal */}
      <Modal visible={showInput} onClose={() => { setShowInput(false); setText(''); setSendAs(USERS[1].id); }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: COLORS.textDark, margin: '0 0 20px 0', textAlign: 'center' }}>
          发消息
        </h3>

        {/* Sender switcher */}
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              gap: 0,
              padding: 4,
              background: COLORS.subtleBg2,
              borderRadius: 999,
            }}
          >
            {USERS.map((user) => {
              const active = sendAs === user.id;
              const avatar = senderAvatar(user.id);
              return (
                <button
                  key={user.id}
                  onClick={() => setSendAs(user.id)}
                  style={{
                    width: 100,
                    padding: '8px 6px',
                    border: 'none',
                    borderRadius: 999,
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    transition: 'all 0.2s ease',
                    background: active ? avatar.bg : 'transparent',
                    color: active ? '#fff' : COLORS.textMuted,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: active ? 'rgba(255,255,255,0.3)' : avatar.bg,
                      color: active ? '#fff' : '#fff',
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {avatar.emoji}
                  </span>
                  {user.label}
                </button>
              );
            })}
          </div>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="说点什么..."
          autoFocus
          rows={4}
          style={{
            width: '100%',
            padding: '14px 16px',
            border: `1.5px solid ${COLORS.subtleBorder}`,
            borderRadius: '1.2rem',
            fontSize: '0.95rem',
            color: COLORS.textDark,
            outline: 'none',
            background: COLORS.subtleBg2,
            marginBottom: 20,
            fontFamily: 'inherit',
            resize: 'vertical',
            boxSizing: 'border-box',
          }}
        />
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => { setShowInput(false); setText(''); }}
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
            onClick={handleSend}
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
            发送
          </button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal visible={!!editId} onClose={() => { setEditId(null); setEditContent(''); }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: COLORS.textDark, margin: '0 0 20px 0', textAlign: 'center' }}>
          编辑留言
        </h3>
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          autoFocus
          rows={4}
          style={{
            width: '100%',
            padding: '14px 16px',
            border: `1.5px solid ${COLORS.subtleBorder}`,
            borderRadius: '1.2rem',
            fontSize: '0.95rem',
            color: COLORS.textDark,
            outline: 'none',
            background: COLORS.subtleBg2,
            marginBottom: 20,
            fontFamily: 'inherit',
            resize: 'vertical',
            boxSizing: 'border-box',
          }}
        />
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => { setEditId(null); setEditContent(''); }}
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
            onClick={handleSaveEdit}
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
            保存
          </button>
        </div>
      </Modal>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 16 }}>
        {(!messages || messages.length === 0) ? (
          <div
            style={{
              textAlign: 'center',
              padding: '48px 0',
              color: COLORS.textMuted,
              fontSize: '0.85rem',
            }}
          >
            还没有留言，说点什么吧！
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {grouped.map((item, idx) => {
              if (item.type === 'date') {
                return (
                  <div
                    key={`date-${idx}`}
                    style={{
                      textAlign: 'center',
                      margin: '8px 0',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.72rem',
                        color: COLORS.textMuted,
                        background: COLORS.subtleBg,
                        padding: '3px 12px',
                        borderRadius: 999,
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                );
              }

              const msg = item.data;
              const isMe = msg.sender === currentUser.id;
              const avatar = senderAvatar(msg.sender);
              const time = msg.createdAt ? formatTime(msg.createdAt) : '';

              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: isMe ? 'row-reverse' : 'row',
                    gap: 8,
                    alignItems: 'flex-end',
                  }}
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: avatar.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: avatar.color,
                      flexShrink: 0,
                    }}
                  >
                    {avatar.emoji}
                  </div>

                  {/* Bubble */}
                  <div style={{ maxWidth: '75%' }}>
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        background: isMe ? COLORS.primary : '#fff',
                        color: isMe ? '#fff' : COLORS.textDark,
                        fontSize: '0.88rem',
                        lineHeight: 1.5,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                        wordBreak: 'break-word',
                      }}
                    >
                      {msg.content}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        marginTop: 4,
                        paddingLeft: isMe ? 0 : 4,
                        paddingRight: isMe ? 4 : 0,
                        justifyContent: isMe ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <span style={{ fontSize: '0.65rem', color: COLORS.textLight }}>
                        {time}
                      </span>
                      {deleteId === msg.id ? (
                        <>
                          <button
                            onClick={() => handleDelete(msg.id)}
                            style={{
                              border: 'none',
                              background: 'none',
                              cursor: 'pointer',
                              fontSize: '0.65rem',
                              color: COLORS.deleteRed,
                              fontWeight: 600,
                              padding: '2px 4px',
                              borderRadius: 4,
                            }}
                          >
                            确认
                          </button>
                          <button
                            onClick={() => setDeleteId(null)}
                            style={{
                              border: 'none',
                              background: 'none',
                              cursor: 'pointer',
                              fontSize: '0.65rem',
                              color: COLORS.textMuted,
                              padding: '2px 4px',
                              borderRadius: 4,
                            }}
                          >
                            取消
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => openEdit(msg)}
                            style={{
                              border: 'none',
                              background: 'none',
                              cursor: 'pointer',
                              fontSize: '0.65rem',
                              color: COLORS.textMuted,
                              padding: '2px 4px',
                              borderRadius: 4,
                            }}
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => setDeleteId(msg.id)}
                            style={{
                              border: 'none',
                              background: 'none',
                              cursor: 'pointer',
                              fontSize: '0.65rem',
                              color: COLORS.textMuted,
                              padding: '2px 4px',
                              borderRadius: 4,
                            }}
                          >
                            删除
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
