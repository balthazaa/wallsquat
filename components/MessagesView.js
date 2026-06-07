import { useState, useRef, useEffect } from 'react';
import { COLORS } from '../lib/constants';
import { uid as genUid } from '../lib/api';

function senderAvatar(sender) {
  if (sender === 'Diane') return { bg: 'hsl(346, 84%, 61%)', emoji: 'D', color: '#fff', border: 'hsl(346, 84%, 61%)' };
  return { bg: 'hsl(218, 60%, 65%)', emoji: '懒', color: '#fff', border: 'hsl(218, 60%, 65%)' };
}

function formatTime(iso) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function MessagesView({ messages, onUpdate, currentUser, onShowToast }) {
  const [text, setText] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!text.trim()) return;
    const newMsg = {
      id: genUid(),
      content: text.trim(),
      sender: currentUser.id,
      createdAt: new Date().toISOString(),
    };
    onUpdate([...(messages || []), newMsg]);
    setText('');
    onShowToast('留言已发送');
  };

  const handleDelete = (msgId) => {
    onUpdate(messages.filter((m) => m.id !== msgId));
    setDeleteId(null);
    onShowToast('已删除');
  };

  const isDiane = currentUser.id === 'Diane';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 16 }}>
        {(!messages || messages.length === 0) ? (
          <div
            style={{
              textAlign: 'center',
              padding: '48px 0',
              color: COLORS.textMuted,
              fontSize: '0.88rem',
            }}
          >
            还没有留言，说点什么吧！
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map((msg) => {
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
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: avatar.bg,
                      border: `2px solid ${avatar.border}33`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
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
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          padding: '12px 0 0',
          marginTop: 8,
          borderTop: `1px solid ${COLORS.subtleBorder}`,
        }}
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="说点什么..."
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: 999,
            border: `1px solid ${COLORS.subtleBorder}`,
            fontSize: '0.88rem',
            color: COLORS.textDark,
            outline: 'none',
            background: '#fff',
            fontFamily: 'inherit',
          }}
        />
        <button
          onClick={handleSend}
          style={{
            padding: '10px 20px',
            borderRadius: 999,
            border: 'none',
            background: isDiane ? COLORS.primary : 'hsl(218, 60%, 65%)',
            color: '#fff',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: `0 4px 14px ${isDiane ? COLORS.primaryGlow : 'hsla(218, 60%, 65%, 0.35)'}`,
          }}
        >
          发送
        </button>
      </div>
    </div>
  );
}
