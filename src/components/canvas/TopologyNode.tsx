import React, { memo, useState, useRef } from 'react';
import { Handle, Position, NodeResizeControl, type NodeProps, type Node } from '@xyflow/react';
import { getIconDataUriColored } from '../icons';
import {
  COLORS,
  FONT,
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
  align: string; // MODIF
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
  const { label, icon, statusColor, textSize, iconSize, backgroundColor, isBackgroundFixed, isEditable, align } = data; // MODIF
  const [hovered, setHovered] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null); // MODIF
  const nodeRef = useRef<HTMLDivElement>(null);
  const iconUri = getIconDataUriColored(icon, COLORS.textWhite);
  const handleOpacity = isEditable && hovered ? 0.6 : 0;
  const positions = ['25%', '50%', '75%'];
  const [showNodeDetailModal, setShowNodeDetailModal] = useState(false); // MODIF

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

  // MODIF: Adicionando opções de alinhamento
  const getAlignOptions = (align: string) => {
    switch(align) {
      case 'top': return 'flex-start';
      case 'bottom': return 'flex-end';
      default: return 'center';
    }
  }

  return (
    <>
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
        onClick={() => setShowNodeDetailModal(true)} // MODIF: Abrindo o modal de detalhes ao clicar
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
          justifyContent: getAlignOptions(align),
          overflow: 'hidden',
          boxShadow: `0 0 18px ${statusColor}44, 0 4px 12px rgba(0,0,0,0.3)`,
          transition: 'background 0.35s ease, box-shadow 0.35s ease',
          position: 'relative',
          gap: 4,
          padding: '8px 6px',
          cursor: 'grab',
          // zIndex: backgroundColor === '#00000000' ? -1 : undefined, // MODIF: enviando os nodes com cor transparente para o fundo
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
            maxWidth: '100%',
            lineHeight: 1.2,
            textShadow: '0 1px 3px rgba(0,0,0,0.4)',
            // MODIF: Quebra de linha em vez de reticências
            whiteSpace: 'normal',
            overflowWrap: 'break-word',
            overflow: 'hidden',
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
    </>
  );
});

TopologyNode.displayName = 'TopologyNode';
