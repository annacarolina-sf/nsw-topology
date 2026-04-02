import React, { useState } from 'react';
import { Modal } from '@grafana/ui';
import ReactMarkdown from 'react-markdown';
import { COLORS, FONT, statusDot, tooltipDivider, tooltipLabel, tooltipRow } from 'styles/tokens';
import { getThresholdColor } from 'data/parser';
import { formattedValueToString, getValueFormat } from '@grafana/data';
// import { config } from '@grafana/runtime';
// import { ALLOWED_USERS } from '../../constants';
import { Button } from '@grafana/ui';
import { CreateTicketModal } from 'components/editors/CreateTicketModal';


export type TrafficHistoryPoint = { time: number; dl: number; ul: number };

interface Props {
    data: any;
    source: string;
    target: string;
    onClose: () => void;
}

const formatAxisValue = (bps: number): string => {
    if (bps >= 1e9) {
        return `${(bps / 1e9).toFixed(1)}G`;
    }
    if (bps >= 1e6) {
        return `${(bps / 1e6).toFixed(0)}M`;
    }
    if (bps >= 1e3) {
        return `${(bps / 1e3).toFixed(0)}K`;
    }
    return `${bps.toFixed(0)}`;
};

const Sparkline: React.FC<{ data: TrafficHistoryPoint[]; height: number; capacity: number }> = ({
    data,
    height,
    capacity,
}) => {
    if (!data || data.length < 2) {
        return (
            <div style={{ color: COLORS.textMuted, fontSize: FONT.sm, textAlign: 'center', padding: 4 }}>
                Sem dados históricos
            </div>
        );
    }

    const capacityBps = capacity * 1e6;
    const maxTraffic = Math.max(...data.map((d) => Math.max(d.dl, d.ul)), 1);
    const yMax = Math.max(capacityBps, maxTraffic) * 1.1;

    const leftMargin = 42;
    const chartWidth = 100;

    const gridLines = [0.25, 0.5, 0.75, 1.0].map((pct) => ({
        bps: capacityBps * pct,
        y: 100 - ((capacityBps * pct) / yMax) * 100,
        label: formatAxisValue(capacityBps * pct),
    }));

    const capacityY = 100 - (capacityBps / yMax) * 100;

    const dlPoints = data
        .map((d, i) => {
            const x = (i / (data.length - 1)) * chartWidth;
            const y = 100 - (d.dl / yMax) * 100;
            return `${x},${y}`;
        })
        .join(' ');
    const ulPoints = data
        .map((d, i) => {
            const x = (i / (data.length - 1)) * chartWidth;
            const y = 100 - (d.ul / yMax) * 100;
            return `${x},${y}`;
        })
        .join(' ');

    return (
        <div style={{ position: 'relative', width: '100%', height, display: 'flex' }}>
            <div
                style={{
                    width: leftMargin,
                    height: '100%',
                    position: 'relative',
                    flexShrink: 0,
                    borderRight: '1px solid rgba(255,255,255,0.2)',
                }}
            >
                {gridLines.map((g, idx) => (
                    <div
                        key={idx}
                        style={{
                            position: 'absolute',
                            right: 3,
                            top: `${g.y}%`,
                            transform: 'translateY(-50%)',
                            fontSize: FONT.xs,
                            color: COLORS.textMuted,
                            lineHeight: 1,
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {g.label}
                    </div>
                ))}
                <div
                    style={{
                        position: 'absolute',
                        right: 3,
                        bottom: 0,
                        fontSize: FONT.xs,
                        color: COLORS.textMuted,
                        lineHeight: 1,
                    }}
                >
                    0
                </div>
            </div>

            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                <svg
                    width="100%"
                    height="100%"
                    viewBox={`0 -2 ${chartWidth} 104`}
                    preserveAspectRatio="none"
                    style={{ display: 'block' }}
                >
                    {gridLines.map((g, idx) => (
                        <line
                            key={idx}
                            x1="0"
                            y1={g.y}
                            x2={chartWidth}
                            y2={g.y}
                            stroke="rgba(255,255,255,0.08)"
                            strokeWidth="0.5"
                            vectorEffect="non-scaling-stroke"
                        />
                    ))}
                    <line
                        x1="0"
                        y1="100"
                        x2={chartWidth}
                        y2="100"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="0.5"
                        vectorEffect="non-scaling-stroke"
                    />
                    <line
                        x1="0"
                        y1={capacityY}
                        x2={chartWidth}
                        y2={capacityY}
                        stroke={COLORS.trafficCapacity}
                        strokeWidth="1"
                        strokeDasharray="4,3"
                        vectorEffect="non-scaling-stroke"
                        opacity={0.6}
                    />
                    <polyline
                        points={dlPoints}
                        fill="none"
                        stroke={COLORS.trafficDownload}
                        strokeWidth="1.5"
                        vectorEffect="non-scaling-stroke"
                        opacity={0.9}
                    />
                    <polyline
                        points={ulPoints}
                        fill="none"
                        stroke={COLORS.trafficUpload}
                        strokeWidth="1.5"
                        vectorEffect="non-scaling-stroke"
                        opacity={0.9}
                    />
                </svg>
            </div>
        </div>
    );
};

// MODIF: Componente criado para substituir o tooltip com os detalhes presentes no WeathermapEdge
export const EdgeDetailsModal: React.FC<Props> = ({ data, source, target, onClose }) => {
    const [ticketCreated, setTicketCreated] = useState(false);
    const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const isUserAllowed = () => {
        // const user = config.bootData.user;
        // console.log('Verificando se o usuário tem permissão para criar ticket')
        // console.log(user)
        // console.log(ALLOWED_USERS)
        // console.log(user.email in ALLOWED_USERS || user.login in ALLOWED_USERS)
        // return user.email in ALLOWED_USERS || user.login in ALLOWED_USERS
        return true
    }

    const handleTicketCreated = (success: boolean) => {
        setTicketCreated(success);
        if (success) setShowCreateTicketModal(false);
        else {
            setErrorMessage('Erro ao criar ticket');
            setTimeout(() => {
                setErrorMessage(null);
            }, 3000);
        }
    }

    return (
        <Modal title={`${data?.sourceName || source} ↔ ${data?.targetName || target}`} isOpen={true} onDismiss={onClose}>
            {data?.interfaceName && (
                <div style={{ fontSize: FONT.sm + 1, color: COLORS.textMuted, marginBottom: 2 }}>
                    {data.interfaceName}
                </div>
            )}
            <div style={tooltipDivider} />
            <div style={tooltipRow}>
                <span style={tooltipLabel}>{data?.sourceName || source}:</span>
                <span
                    style={{ color: data?.sourceStatus === 'online' ? COLORS.green : COLORS.danger, fontWeight: 600 }}
                >
                    {data?.sourceStatus === 'online' ? '● Online' : '● Offline'}
                </span>
            </div>
            <div style={tooltipRow}>
                <span style={tooltipLabel}>{data?.targetName || target}:</span>
                <span
                    style={{ color: data?.targetStatus === 'online' ? COLORS.green : COLORS.danger, fontWeight: 600 }}
                >
                    {data?.targetStatus === 'online' ? '● Online' : '● Offline'}
                </span>
            </div>
            {/* MODIF: adição de observações customizadas */}
            {data?.observation && (
                <>
                    <div style={tooltipDivider} />
                    <div style={tooltipRow}>
                        <div style={tooltipLabel}>
                            <ReactMarkdown
                                components={{
                                    p: ({ children }) => (
                                        <p style={{ margin: 0 }}>{children}</p>
                                    ),
                                    strong: ({ children }) => (
                                        <strong style={{ fontWeight: 700 }}>
                                            {children}
                                        </strong>
                                    ),
                                }}
                            >
                                {data.observation}
                            </ReactMarkdown>
                        </div>
                    </div>
                </>
            )}
            <div style={tooltipDivider} />
            <div style={tooltipRow}>
                <span style={{ color: COLORS.trafficDownload, fontWeight: 600 }}>↓ Download:</span>
                <span style={{ color: COLORS.trafficDownload, fontWeight: 600 }}>{data?.downloadValue || '—'}</span>
            </div>
            <div style={tooltipRow}>
                <span style={{ color: COLORS.trafficUpload, fontWeight: 600 }}>↑ Upload:</span>
                <span style={{ color: COLORS.trafficUpload, fontWeight: 600 }}>{data?.uploadValue || '—'}</span>
            </div>

            {data?.customMetrics && data.customMetrics.length > 0 && (
                <>
                    <div style={tooltipDivider} />
                    {data.customMetrics.map(
                        (m: any, idx: any) =>
                            m.computedValue !== null && (
                                <div key={idx} style={tooltipRow}>
                                    <span style={{ ...tooltipLabel, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {m.icon && <span>{m.icon}</span>}
                                        {m.name}:
                                    </span>
                                    <span
                                        style={{
                                            color: getThresholdColor(m.computedValue, m.thresholds) || COLORS.textWhite, // MODIF: THRESHOLDS
                                            fontWeight: 600,
                                        }}
                                    >
                                        {(() => {
                                            if (m.unit && m.unit !== 'none') {
                                                const fmt = getValueFormat(m.unit);
                                                return formattedValueToString(fmt(m.computedValue, m.decimals ?? 1));
                                            }
                                            return m.computedValue.toFixed(m.decimals ?? 1);
                                        })()}
                                    </span>
                                </div>
                            )
                    )}
                </>
            )}

            {data?.trafficHistory && data.trafficHistory.length > 1 && (
                <>
                    <div style={tooltipDivider} />
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: FONT.sm,
                            color: COLORS.textMuted,
                            marginBottom: 2,
                        }}
                    >
                        <div style={statusDot(data.isRed ? COLORS.danger : COLORS.green)} />
                        Tráfego
                    </div>
                    <div
                        style={{
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: 4,
                            padding: '4px 0',
                            marginTop: 2,
                            width: '100%',
                            overflow: 'hidden',
                        }}
                    >
                        {/* MODIF: alterando a altura do gráfico (valor original = 80) */}
                        <Sparkline data={data.trafficHistory} height={200} capacity={data.capacity || 1000} />
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: FONT.sm }}>
                        <span style={{ color: COLORS.trafficDownload }}>— Download</span>
                        <span style={{ color: COLORS.trafficUpload }}>— Upload</span>
                        <span style={{ color: COLORS.trafficCapacity, opacity: 0.6 }}>┈ Capacity</span>
                    </div>
                </>
            )}

            {/* MODIF: Adicionando a opção de criar ticket */}
            {isUserAllowed() && (
                <>
                    <div style={tooltipDivider} />
                    <div style={{ ...tooltipRow, maxHeight: 15 }}>
                        <Button variant="secondary" icon="external-link-alt" fullWidth
                            onClick={ticketCreated ? undefined : () => setShowCreateTicketModal(true)}
                            disabled={ticketCreated}>
                            Create Ticket
                        </Button>
                    </div>
                </>
            )}

            {/* MODIF: Modal para criar ticket */}
            {showCreateTicketModal && (
                <CreateTicketModal
                    sourceName={data?.sourceName || source}
                    targetName={data?.targetName || target}
                    onCancel={() => setShowCreateTicketModal(false)}
                    onCreated={handleTicketCreated}
                />
            )}

            {/* MODIF: Toast em caso de erro (usado na criação do ticket) */}
            {errorMessage && (
                <div
                    style={{
                        backgroundColor: '#fdecea',
                        color: '#611a15',
                        padding: '8px 12px',
                        borderRadius: 4,
                        marginTop: 8,
                        fontSize: 12,
                    }}
                >
                    {errorMessage}
                </div>
            )}
        </Modal>
    )
}