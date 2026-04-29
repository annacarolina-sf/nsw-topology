import React, { memo, useState } from 'react';
import { getValueFormat, formattedValueToString } from '@grafana/data';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps, type Edge } from '@xyflow/react';
import { COLORS, FONT } from '../../styles/tokens';
import { getThresholdColor } from '../../data/parser'
import { EdgeDetailsModal } from 'components/details/EdgeDetailsModal';
import { DEFAULT_ALIGN } from '../../constants';

export type TrafficHistoryPoint = { time: number; dl: number; ul: number };

export type WeathermapEdgeData = {
  label: string;
  edgeColor: string;
  edgeWidth: number;
  lineStyle: string;
  hasTraffic: boolean;
  animated: boolean;
  showTraffic: boolean;
  sourceName: string;
  targetName: string;
  sourceStatus: string;
  targetStatus: string;
  downloadValue: string;
  uploadValue: string;
  interfaceName: string;
  trafficHistory: TrafficHistoryPoint[];
  isRed: boolean;
  capacity: number;
  observation: string; // MODIF
  alignLabel: string; // MODIF
  customMetrics?: any[];
};

export type WeathermapEdgeType = Edge<WeathermapEdgeData, 'weathermap'>;

export const WeathermapEdge = memo(
  ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    style,
    source,
    target,
  }: EdgeProps<WeathermapEdgeType>) => {

    const edgeColor = data?.edgeColor || '#4b5563';
    const edgeWidth = (data?.edgeWidth || 2) * 1.5; // MODIF: aumentando a espessura das linhas em 1.5 vezes
    const lineStyle = data?.lineStyle || 'solid';
    const label = data?.label || '';
    const animated = data?.animated ?? false;
    const showTraffic = data?.showTraffic ?? false;
    const isRed = data?.isRed ?? false;
    const [showDetailModal, setShowDetailModal] = useState(false); // MODIF

    // MODIF: opções de alinhamento da label
    const translateXMap: Record<string, string> = {
      right: '80%',
      center: '-50%',
      left: '-180%',
    };

    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition,
    });

    let dashArray: string | undefined;
    if (lineStyle === 'dashed') {
      dashArray = '10 5';
    } else if (lineStyle === 'dotted') {
      dashArray = '3 5';
    }

    const shouldAnimate = animated && !isRed;
    const isDashAnimated = shouldAnimate && (lineStyle === 'dashed' || lineStyle === 'dotted');

    return (
      <>
        <path
          d={edgePath}
          fill="none"
          stroke="transparent"
          strokeWidth={Math.max(edgeWidth + 14, 20)}
          onClick={() => setShowDetailModal(true)} // MODIF: Abrindo o modal de detalhes ao clicar
          style={{ cursor: 'pointer', pointerEvents: 'stroke' }}
        />

        <BaseEdge
          id={id}
          path={edgePath}
          style={{
            ...style,
            stroke: edgeColor,
            strokeWidth: edgeWidth,
            strokeDasharray: dashArray,
            pointerEvents: 'none',
            transition: 'stroke 0.35s ease, stroke-width 0.25s ease',
          }}
          className={isDashAnimated ? 'react-flow__edge-animated-dash' : undefined}
        />

        {shouldAnimate && lineStyle === 'solid' && (
          <>
            <circle r={3.5} fill={COLORS.textWhite} filter="url(#glow)" style={{ pointerEvents: 'none' }}>
              <animateMotion dur="2.5s" repeatCount="indefinite" path={edgePath} />
            </circle>
            <circle r={2} fill={edgeColor} style={{ pointerEvents: 'none' }}>
              <animateMotion dur="2.5s" repeatCount="indefinite" path={edgePath} />
            </circle>
          </>
        )}

        {(label || (showTraffic && (data?.downloadValue || data?.uploadValue))) && (
          <EdgeLabelRenderer>
            <div
              onClick={() => setShowDetailModal(true)} // MODIF
              style={{
                position: 'absolute',
                transform: `translate(${translateXMap[data?.alignLabel ?? DEFAULT_ALIGN]}, -50%) translate(${labelX}px, ${labelY}px)`, // MODIF: Podendo escolher o alinhamento (antes: translate(-50%, -50%))
                background: 'rgba(15,15,28,0.85)',
                border: `1px solid ${edgeColor}44`,
                color: COLORS.textWhite,
                fontSize: FONT.sm + 1,
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: 5,
                pointerEvents: 'auto',
                cursor: 'pointer', // MODIF
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                lineHeight: 1.3,
              }}
            >
              {label && <div>{label}</div>}
              {showTraffic && data?.downloadValue && (
                <div style={{ color: COLORS.trafficDownload, fontSize: FONT.sm, fontWeight: 500 }}>
                  ↓ {data.downloadValue}
                </div>
              )}
              {showTraffic && data?.uploadValue && (
                <div style={{ color: COLORS.trafficUpload, fontSize: FONT.sm, fontWeight: 500 }}>
                  ↑ {data.uploadValue}
                </div>
              )}
              {data?.customMetrics?.map(
                (m, idx) =>
                  m.computedValue !== null && m.showInline && ( // MODIF: podendo escolher se a métrica será mostrada inline
                    <div
                      key={idx}
                      style={{
                        color: getThresholdColor(m.computedValue, m.thresholds) || COLORS.textWhite, // MODIF: THRESHOLDS
                        fontSize: FONT.sm,
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                      }}
                    >
                      {m.icon && <span>{m.icon}</span>}
                      {(() => {
                        const isNumber = typeof m.computedValue === 'number';
                        if (!isNumber) return m.computedValue;

                        if (m.unit && m.unit !== 'none') {
                          const fmt = getValueFormat(m.unit);
                          return formattedValueToString(fmt(m.computedValue, m.decimals ?? 1));
                        }
                        return m.computedValue.toFixed(m.decimals ?? 1);
                      })()}
                    </div>
                  )
              )}
            </div>
          </EdgeLabelRenderer>
        )}


        {/* MODIF: Substituindo o tooltip com os detalhes por um modal */}
        {showDetailModal && (
          <EdgeDetailsModal
            data={data}
            source={source}
            target={target}
            onClose={() => {
              setShowDetailModal(false);
            }}
          />
        )}


      </>
    );
  }
);

WeathermapEdge.displayName = 'WeathermapEdge';
