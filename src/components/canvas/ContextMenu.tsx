import React from 'react';
import { COLORS, SHADOW, RADIUS, BLUR, FONT } from '../../styles/tokens';

interface Props {
  x: number;
  y: number;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: (() => void) | undefined; // MODIF
}

const boxStyle: React.CSSProperties = {
  position: 'absolute',
  zIndex: 50,
  background: COLORS.surface,
  border: `1px solid ${COLORS.borderStrong}`,
  borderRadius: RADIUS.large,
  boxShadow: SHADOW.dropdown,
  padding: 6,
  minWidth: 160,
  backdropFilter: BLUR,
};

const btnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  width: '100%',
  background: 'none',
  border: 'none',
  color: COLORS.textSecondary,
  fontSize: FONT.md,
  padding: '9px 14px',
  cursor: 'pointer',
  borderRadius: 7,
  textAlign: 'left',
  transition: 'background 0.12s',
};

export const ContextMenu: React.FC<Props> = ({ x, y, onEdit, onDelete, onDuplicate }) => (
  <div style={{ ...boxStyle, left: x, top: y }}>
    <button
      style={btnStyle}
      onClick={onEdit}
      onMouseEnter={(e) => (e.currentTarget.style.background = COLORS.surfaceHover)}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
      Edit
    </button>
    <button
      style={{ ...btnStyle, color: COLORS.danger }}
      onClick={onDelete}
      onMouseEnter={(e) => (e.currentTarget.style.background = COLORS.dangerBg)}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </svg>
      Delete
    </button>

    {/* MODIF: Adicionando a opção de duplicar node */}
    {onDuplicate && (
      <button
        style={btnStyle}
        onClick={onDuplicate}
        onMouseEnter={(e) => (e.currentTarget.style.background = COLORS.surfaceHover)}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 -960 960 960" fill="currentColor">
          <path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z" />
        </svg>
        Duplicate
      </button>
    )}
  </div>
);
