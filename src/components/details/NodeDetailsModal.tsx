import React from 'react';
import { Modal } from '@grafana/ui';
import { TopologyNodeData } from 'components/canvas/TopologyNode';
import { COLORS, statusDot, tooltipDivider, tooltipLabel, tooltipRow } from 'styles/tokens'; // MODIF: tirei "FONT"

interface Props {
  nodeData: TopologyNodeData;
  onClose: () => void;
}

// MODIF: Componente criado para substituir o tooltip com os detalhes presentes no TopologyNode
export const NodeDetailsModal: React.FC<Props> = ({ nodeData, onClose }) => {
  return (
    <Modal title={nodeData.label} isOpen={true} onDismiss={onClose}>
      <div style={tooltipDivider} />
      {!nodeData.isBackgroundFixed && ( 
        <div style={tooltipRow}>
          <div style={statusDot(nodeData.statusColor)} />
          <span style={tooltipLabel}>Status:</span>
          <span style={{ color: nodeData.statusColor, fontWeight: 700 }}>{status === 'online' ? 'Online' : 'Offline'}</span>
        </div>
      )}
      {nodeData.uptimeValue && (
        <div style={tooltipRow}>
          <span style={{ width: 8 }} />
          <span style={tooltipLabel}>Uptime:</span>
          <span>{nodeData.uptimeValue}</span>
        </div>
      )}
      {nodeData.metrics.length > 0 && (
        <>
          <div style={tooltipDivider} />
          <div style={{ ...tooltipLabel, marginBottom: 2 }}>Metrics:</div>
          {nodeData.metrics.map((m, i) => (
            <div key={i} style={tooltipRow}>
              <div style={statusDot(m.alerting ? m.color : COLORS.green)} />
              <span style={tooltipLabel}>{m.label}:</span>
              <span
                style={{ color: m.alerting ? m.color : COLORS.textSecondary, fontWeight: m.alerting ? 700 : 400 }}
              >
                {m.value}
                {m.alerting && <span style={{ marginLeft: 4, color: m.color }}>⚠</span>} {/* MODIF: tirando "fontSize: FONT.sm, " */}
              </span>
            </div>
          ))}
        </>
      )}
      {nodeData.hyperlink != '' && (
        <>
          <div style={tooltipDivider} />
          <div style={{ ...tooltipLabel, marginBottom: 2 }}>Hyperlink:</div>
          <div style={{ ...tooltipRow, cursor: 'pointer' }} onClick={() => window.open(nodeData.hyperlink, '_blank')}>
            <span>🔗</span>
            <span style={{ color: COLORS.textSecondary }}>{nodeData.hyperlinkLabel}</span>
          </div>
        </>
      )}
      {nodeData.connections.length > 0 && (
        <>
          <div style={tooltipDivider} />
          <div style={{ ...tooltipLabel, marginBottom: 2 }}>Connections:</div>
          {nodeData.connections.slice(0, 5).map((c, i) => (
            <div key={i} style={{ ...tooltipRow, paddingLeft: 2 }}>
              <div style={statusDot(c.color)} />
              <span style={{ color: COLORS.textSecondary }}>{c.name}</span> {/* MODIF: tirando "fontSize: FONT.sm + 1, " */}
            </div>
          ))}
        </>
      )}
    </Modal>
  )
}