import React, { memo, useState, useRef } from 'react';
import { Handle, Position, NodeResizeControl, type NodeProps, type Node } from '@xyflow/react';
import { getIconDataUriColored } from '../icons';
import {
  COLORS,
  FONT,
  // tooltipBox, // TODO
  // tooltipDivider,
  // tooltipLabel,
  // tooltipRow,
  // tooltipTitle,
  // statusDot,
} from '../../styles/tokens';
import { NodeDetailsModal } from 'components/details/NodeDetailsModal';

export type MetricDisplay = {
  label: string;
  value: string;
  color: string;
  alerting: boolean;
};

export type ConnectionDisplay = {
  name: string;
  color: string;
};

export type TopologyNodeData = {
  label: string;
  ip: string;
  icon: string;
  statusColor: string;
  status: string;
  uptimeValue: string;
  hyperlink: string;
  hyperlinkLabel: string;
  connections: ConnectionDisplay[];
  metrics: MetricDisplay[];
  bgColor: string;
  iconColor: string;
  textColor: string;
  textSize: number;
  iconSize: number;
  width: number;
  height: number;
  backgroundColor: string; // MODIF
  isBackgroundFixed: boolean; // MODIF
  isEditable: boolean; // MODIF
};

type TopologyNodeType = Node<TopologyNodeData, 'topology'>;

const handleStyle: React.CSSProperties = {
  width: 10,
  height: 10,
  background: COLORS.accent,
  border: '2px solid rgba(255,255,255,0.3)',
  borderRadius: '50%',
  cursor: 'crosshair',
  zIndex: 10,
  opacity: 0.6,
};

export const TopologyNode = memo(({ data, selected }: NodeProps<TopologyNodeType>) => {
  // TODO
  // const { label, icon, statusColor, status, uptimeValue, hyperlink, hyperlinkLabel, connections, metrics, textSize, iconSize, backgroundColor, isBackgroundFixed, isEditable } = data; // MODIF
  const { label, icon, statusColor, textSize, iconSize, backgroundColor, isBackgroundFixed, isEditable } = data; // MODIF
  const [hovered, setHovered] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null); // MODIF
  const nodeRef = useRef<HTMLDivElement>(null);
  const iconUri = getIconDataUriColored(icon, COLORS.textWhite);
  const handleOpacity = isEditable && hovered ? 0.6 : 0;
  const positions = ['25%', '50%', '75%'];
  const [showNodeDetailModal, setShowNodeDetailModal] = useState(false);

  // MODIF
  const renderHandles = (side: Position, axis: 'x' | 'y') =>
    positions.map((pos, index) => (
      <Handle
        key={`${side}-${index}`}
        type="source"
        position={side}
        id={`${side}-${index + 1}`}
        style={{
          ...handleStyle,
          [axis === 'x' ? 'left' : 'top']: pos,
          opacity: handleOpacity,
          pointerEvents: isEditable ? 'auto' : 'none',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
    ));

  // MODIF: Permitindo que o mouse entre no tooltip
  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    setHovered(true);
  };

  const handleMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setHovered(false);
    }, 200); // delay em ms
  };

  return (
    <div onClick={() => setShowNodeDetailModal(true)}> {/* MODIF: Abrindo o modal de detalhes ao clicar */}
      {isEditable && (
        <NodeResizeControl
          position="bottom-right"
          minWidth={80}
          minHeight={60}
          style={{ background: 'transparent', border: 'none', width: 14, height: 14, cursor: 'se-resize' }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" style={{ display: 'block' }}>
            <path
              d="M9 1v8H1"
              fill="none"
              stroke={selected ? COLORS.textWhite : 'rgba(255,255,255,0.4)'}
              strokeWidth="1.5"
            />
            <path
              d="M9 5v4H5"
              fill="none"
              stroke={selected ? COLORS.textWhite : 'rgba(255,255,255,0.4)'}
              strokeWidth="1.5"
            />
          </svg>
        </NodeResizeControl>
      )}

      {/* MODIF: Adiciona mais pontos de conexão e só deixa visível quando passa o mouse */}
      {renderHandles(Position.Top, 'x')}
      {renderHandles(Position.Bottom, 'x')}
      {renderHandles(Position.Left, 'y')}
      {renderHandles(Position.Right, 'y')}

      <div
        ref={nodeRef}
        onMouseEnter={handleMouseEnter} // MODIF
        onMouseLeave={handleMouseLeave} // MODIF
        style={{
          width: '100%',
          height: '100%',
          minWidth: 80,
          minHeight: 60,
          background: isBackgroundFixed ? backgroundColor : statusColor,
          borderRadius: 10,
          border: '2px solid rgba(255,255,255,0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          boxShadow: `0 0 18px ${statusColor}44, 0 4px 12px rgba(0,0,0,0.3)`,
          transition: 'background 0.35s ease, box-shadow 0.35s ease',
          position: 'relative',
          gap: 4,
          padding: '8px 6px',
          cursor: 'grab',
        }}
      >
        {icon && (
          <img
            src={iconUri}
            alt={label}
            style={{ width: iconSize || 32, height: iconSize || 32, objectFit: 'contain' }}
            draggable={false}
          />
        )}

        <div
          style={{
            fontSize: textSize || (icon ? FONT.label : 16),
            fontWeight: 600,
            color: data.textColor || COLORS.textWhite,
            textAlign: 'center',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%',
            lineHeight: 1.2,
            textShadow: '0 1px 3px rgba(0,0,0,0.4)',
          }}
        >
          {label}
        </div>
      </div>

      {/* MODIF: Substituindo o tooltip com os detalhes por um modal */}
      {showNodeDetailModal && (
        <NodeDetailsModal
          nodeData={data}
          onClose={() => {
            setShowNodeDetailModal(false);
          }}
        />
      )}

      {/* {hovered && (
        <div
          onMouseEnter={handleMouseEnter} // MODIF
          onMouseLeave={handleMouseLeave} // MODIF
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '100%',
            transform: 'translateX(-50%)',
            marginBottom: 8,
            zIndex: 9999,
            pointerEvents: 'auto', // MODIF
          }}
        >
          <div style={tooltipBox}>
            <div style={tooltipTitle}>{label}</div>
            <div style={tooltipDivider} />
            {!isBackgroundFixed && ( // MODIF
              <div style={tooltipRow}>
                <div style={statusDot(data.statusColor)} />
                <span style={tooltipLabel}>Status:</span>
                <span style={{ color: statusColor, fontWeight: 700 }}>{status === 'online' ? 'Online' : 'Offline'}</span>
              </div>
            )}
            {uptimeValue && (
              <div style={tooltipRow}>
                <span style={{ width: 8 }} />
                <span style={tooltipLabel}>Uptime:</span>
                <span>{uptimeValue}</span>
              </div>
            )}
            {metrics.length > 0 && (
              <>
                <div style={tooltipDivider} />
                <div style={{ ...tooltipLabel, marginBottom: 2 }}>Metrics:</div>
                {metrics.map((m, i) => (
                  <div key={i} style={tooltipRow}>
                    <div style={statusDot(m.alerting ? m.color : COLORS.green)} />
                    <span style={tooltipLabel}>{m.label}:</span>
                    <span
                      style={{ color: m.alerting ? m.color : COLORS.textSecondary, fontWeight: m.alerting ? 700 : 400 }}
                    >
                      {m.value}
                      {m.alerting && <span style={{ fontSize: FONT.sm, marginLeft: 4, color: m.color }}>⚠</span>}
                    </span>
                  </div>
                ))}
              </>
            )}
            {hyperlink != '' && (
              <>
                <div style={tooltipDivider} />
                <div style={{ ...tooltipLabel, marginBottom: 2 }}>Hyperlink:</div>
                <div style={{...tooltipRow, cursor: 'pointer'}} onClick={() => window.open(hyperlink, '_blank')}>
                  <span style={{ width: 6 }}>🔗</span>
                  <span style={{ color: COLORS.textSecondary, marginRight: 2 }}>{hyperlinkLabel}</span>
                </div>
              </>
            )}
            {connections.length > 0 && (
              <>
                <div style={tooltipDivider} />
                <div style={{ ...tooltipLabel, marginBottom: 2 }}>Connections:</div>
                {connections.slice(0, 5).map((c, i) => (
                  <div key={i} style={{ ...tooltipRow, paddingLeft: 2 }}>
                    <div style={statusDot(c.color)} />
                    <span style={{ fontSize: FONT.sm + 1, color: COLORS.textSecondary }}>{c.name}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )} */}
    </div>
  );
});

TopologyNode.displayName = 'TopologyNode';
