import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';

/**
 * ArchNode — Final visual spec
 *
 * ENTRY:      bg #4F46E5  border #A78BFA  glow purple-lg
 * HIGH:       bg #2563EB  border #60A5FA  glow blue
 * MEDIUM:     bg #059669  border #34D399  glow green
 * LOW/NORMAL: bg #374151  border #4F46E5  glow indigo-sm
 */
const ArchNode = ({ data, selected }) => {
    const [hovered, setHovered] = useState(false);

    const isEntry  = data.isEntry || false;
    const impact   = data.impact  || 0;
    const deps     = (data.dependencies || []).length;
    const depts    = (data.dependents   || []).length;
    const totalDeg = deps + depts;

    // Tier classification
    const isHigh   = !isEntry && totalDeg >= 6;
    const isMedium = !isEntry && !isHigh && totalDeg >= 2;
    const isLow    = !isEntry && !isHigh && !isMedium;

    const isConfig = data.isConfig || data.id === 'package.json';
    const framework = data.framework || null; // 'React', 'Express', etc.

    // ── Palette per spec ──────────────────────────────────────────
    let bg, borderColor, glowColor, textColor, badgeBg, badgeText;

    if (isConfig) {
        // Amber/Orange Config Theme
        bg          = '#D97706';
        borderColor = '#FBBF24';
        glowColor   = selected || hovered ? 'rgba(245, 158, 11, 1)' : 'rgba(245, 158, 11, 0.6)';
        textColor   = '#FFFFFF';
        badgeBg     = 'rgba(255,255,255,0.25)';
        badgeText   = '#FEF3C7';
    } else if (isEntry) {
        bg          = '#4F46E5';
        borderColor = '#A78BFA';
        glowColor   = selected || hovered ? 'rgba(139,92,246,1)'   : 'rgba(139,92,246,0.8)';
        textColor   = '#FFFFFF';
        badgeBg     = 'rgba(255,255,255,0.2)';
        badgeText   = '#EDE9FE';
    } else if (isHigh) {
        bg          = '#2563EB';
        borderColor = '#60A5FA';
        glowColor   = selected || hovered ? 'rgba(59,130,246,0.9)'  : 'rgba(59,130,246,0.5)';
        textColor   = '#FFFFFF';
        badgeBg     = 'rgba(255,255,255,0.18)';
        badgeText   = '#BFDBFE';
    } else if (isMedium) {
        bg          = '#059669';
        borderColor = '#34D399';
        glowColor   = selected || hovered ? 'rgba(5,150,105,0.9)'   : 'rgba(5,150,105,0.5)';
        textColor   = '#FFFFFF';
        badgeBg     = 'rgba(255,255,255,0.15)';
        badgeText   = '#A7F3D0';
    } else {
        bg          = '#374151';
        borderColor = selected ? '#6366F1' : (hovered ? '#818CF8' : '#4F46E5');
        glowColor   = selected ? 'rgba(99,102,241,0.6)' : (hovered ? 'rgba(99,102,241,0.35)' : 'rgba(79,70,229,0.25)');
        textColor   = '#F9FAFB';
        badgeBg     = 'rgba(255,255,255,0.08)';
        badgeText   = '#9CA3AF';
    }

    // --- Framework Tinting (Subtle 5% overlay) ---
    const tintColor = framework === 'React' ? 'rgba(16, 185, 129, 0.08)' 
                    : framework === 'Express' ? 'rgba(59, 130, 246, 0.08)' 
                    : 'transparent';

    // ── Scale ─────────────────────────────────────────────────────
    const scale = isConfig ? (selected ? 1.25 : 1.2)
                : isEntry ? (selected ? 1.35 : 1.3)
                : selected ? 1.12 : (hovered ? 1.06 : 1.0);

    // ── Label ─────────────────────────────────────────────────────
    const raw   = data.label || (data.id || '').split('/').pop() || '';
    const label = raw.length > 22 ? raw.slice(0, 20) + '…' : raw;
    const badge = isConfig ? 'CONFIG'
                : isEntry ? 'ENTRY'
                : isHigh  ? 'HIGH'
                : isMedium ? 'MED'
                : (data.role || raw.split('.').pop()?.toUpperCase() || 'FILE');

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            title={`${raw}\nPath: ${data.id || ''}\nDependencies: ${deps} | Dependents: ${depts}`}
            style={{
                width: '200px',
                background: bg,
                borderRadius: '14px',
                border: `2px solid ${borderColor}`,
                padding: '12px 16px',
                color: textColor,
                fontWeight: 600,
                boxSizing: 'border-box',
                boxShadow: `0 0 ${isEntry ? 25 : isHigh ? 18 : isMedium ? 14 : isConfig ? 18 : 10}px ${glowColor}, 0 4px 20px rgba(0,0,0,0.6)`,
                transform: `scale(${scale})`,
                transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
                cursor: 'pointer',
                opacity: isLow && !selected && !isConfig ? 0.85 : 1,
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Framework Tint Overlay */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: tintColor, pointerEvents: 'none', zIndex: 0
            }} />

            <Handle type="target" position={Position.Top}    style={{ opacity: 0, pointerEvents: 'none' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative', zIndex: 1 }}>
                {/* File icon */}
                <div style={{
                    width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
                    background: 'rgba(255,255,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <rect x="2" y="1" width="9" height="12" rx="1.5" stroke="rgba(255,255,255,0.9)" strokeWidth="1.4" fill="none"/>
                        <path d="M5 5h5M5 8h3" stroke="rgba(255,255,255,0.9)" strokeWidth="1.2" strokeLinecap="round"/>
                        <path d="M11 8l3 3-3 3" stroke="rgba(255,255,255,0.9)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>

                {/* Labels */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                        fontSize: '12px', fontWeight: 700, color: textColor,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        letterSpacing: '0.01em', lineHeight: 1.3,
                    }}>
                        {label}
                    </div>
                    <div style={{
                        display: 'inline-block', marginTop: '3px',
                        fontSize: '9px', fontWeight: 800, letterSpacing: '0.1em',
                        color: badgeText, background: badgeBg,
                        padding: '1px 7px', borderRadius: '4px',
                    }}>
                        {badge}
                    </div>
                </div>

                {/* Degree badge */}
                {totalDeg > 0 && (
                    <div style={{
                        fontSize: '11px', fontWeight: 800,
                        color: 'rgba(255,255,255,0.9)',
                        background: 'rgba(0,0,0,0.25)', borderRadius: '6px',
                        padding: '2px 7px', flexShrink: 0,
                        letterSpacing: '-0.02em',
                    }}>
                        {totalDeg}
                    </div>
                )}
            </div>

            <Handle type="source" position={Position.Bottom} style={{ opacity: 0, pointerEvents: 'none' }} />
        </div>
    );
};

export default memo(ArchNode);
