import React from 'react';

/** Hand-drawn SVG characters and scenery. Animations live in style.css (classes fm-*, ag-sun-*, ag-cloud). */
export type Mood = 'idle' | 'happy' | 'sad' | 'think' | 'cheer';

/** Mr. Gad the farmer. The mood changes the face, the arms and the body animation. */
export function Farmer({ mood = 'idle', size = 80 }: { mood?: Mood; size?: number }) {
    const happy = mood === 'happy' || mood === 'cheer';
    return <svg className={`fm fm-${mood}`} width={size} height={size * 1.3} viewBox="0 0 100 130" aria-hidden="true" style={{ flex: 'none', overflow: 'visible' }}>
        <ellipse cx="50" cy="126" rx="26" ry="4" fill="rgba(0,0,0,.15)" />
        <g className="fm-body">
            <rect x="33" y="100" width="13" height="20" rx="4" fill="#2a5a94" />
            <rect x="54" y="100" width="13" height="20" rx="4" fill="#2a5a94" />
            <path d="M30 122 q0 -6 8 -6 h8 v8 h-16z M54 116 h8 q8 0 8 6 v2 h-16z" fill="#4a3320" />
            <path d="M28 66 q0 -8 10 -8 h24 q10 0 10 8 v36 q0 6 -6 6 H34 q-6 0 -6 -6z" fill="#3d7fcb" />
            <path d="M38 58 h24 v14 h-24z" fill="#e8553f" />
            <path d="M36 66 h28 v20 h-28z" fill="#2f6fb5" />
            <circle cx="40" cy="70" r="2.4" fill="#f2b705" /><circle cx="60" cy="70" r="2.4" fill="#f2b705" />
            <g className="fm-arm fm-arm-l" style={{ transformOrigin: '30px 66px' }}>
                <rect x="14" y="62" width="17" height="11" rx="5.5" fill="#e8553f" />
                <circle cx="14" cy="67.5" r="6" fill="#f0b27a" />
            </g>
            <g className="fm-arm fm-arm-r" style={{ transformOrigin: '70px 66px' }}>
                <rect x="69" y="62" width="17" height="11" rx="5.5" fill="#e8553f" />
                <circle cx="86" cy="67.5" r="6" fill="#f0b27a" />
            </g>
            <g className="fm-head">
                <circle cx="50" cy="42" r="20" fill="#f0b27a" />
                <circle cx="30" cy="44" r="4" fill="#e39f66" /><circle cx="70" cy="44" r="4" fill="#e39f66" />
                <g className="fm-eyes">
                    <ellipse cx="42" cy="41" rx="2.8" ry={mood === 'sad' ? 2.2 : 3.2} fill="#2a1d12" />
                    <ellipse cx="58" cy="41" rx="2.8" ry={mood === 'sad' ? 2.2 : 3.2} fill="#2a1d12" />
                </g>
                {mood === 'sad' && <><path d="M37 34 l8 3 M63 34 l-8 3" stroke="#5a3a1c" strokeWidth="2.2" strokeLinecap="round" /><path className="fm-sweat" d="M68 26 q4 6 0 9 q-4 -3 0 -9z" fill="#6cc4f0" /></>}
                {happy && <><circle cx="37" cy="48" r="3.4" fill="#ff9d8a" opacity=".7" /><circle cx="63" cy="48" r="3.4" fill="#ff9d8a" opacity=".7" /></>}
                <path d="M38 50 q12 -5 24 0 q-3 4 -12 4 q-9 0 -12 -4z" fill="#6b4423" />
                {happy ? <path d="M42 53 q8 9 16 0z" fill="#8a2a1a" /> : mood === 'sad' ? <path d="M43 58 q7 -6 14 0" stroke="#6b3a1c" strokeWidth="2.4" fill="none" strokeLinecap="round" /> : mood === 'think' ? <circle cx="56" cy="55" r="2.6" fill="#8a2a1a" /> : <path d="M43 55 q7 4 14 0" stroke="#8a2a1a" strokeWidth="2.4" fill="none" strokeLinecap="round" />}
                <ellipse cx="50" cy="28" rx="35" ry="8" fill="#e8c15a" stroke="#c99a2e" strokeWidth="2" />
                <path d="M30 28 q0 -22 20 -22 q20 0 20 22z" fill="#f1d078" stroke="#c99a2e" strokeWidth="2" />
                <path d="M30 26 q20 6 40 0 v-5 q-20 6 -40 0z" fill="#e0422f" />
            </g>
        </g>
        {mood === 'cheer' && <g className="fm-stars"><path d="M12 24 l2 5 5 .5 -4 3.5 1.2 5 -4.2 -2.7 -4.2 2.7 1.2 -5 -4 -3.5 5 -.5z" fill="#f2b705" /><path d="M88 14 l2 5 5 .5 -4 3.5 1.2 5 -4.2 -2.7 -4.2 2.7 1.2 -5 -4 -3.5 5 -.5z" fill="#f2b705" /></g>}
    </svg>;
}

export const Sun = ({ size = 70, hot = false }: { size?: number; hot?: boolean }) =>
    <svg className="ag-sun" width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" style={{ flex: 'none' }}>
        <g className="ag-sun-rays" style={{ transformOrigin: '50px 50px' }}>
            {Array.from({ length: 12 }, (_, i) => <rect key={i} x="46" y="2" width="8" height="16" rx="4" fill={hot ? '#ff8a3d' : '#ffd84d'} transform={`rotate(${i * 30} 50 50)`} />)}
        </g>
        <circle cx="50" cy="50" r="24" fill={hot ? '#ff6a2b' : '#ffcf33'} />
        <circle cx="42" cy="46" r="3" fill="#7a3b00" /><circle cx="58" cy="46" r="3" fill="#7a3b00" />
        <path d="M42 57 q8 7 16 0" stroke="#7a3b00" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>;

export const Cloud = ({ width = 90, dark = false }: { width?: number; dark?: boolean }) =>
    <svg width={width} height={width * 0.55} viewBox="0 0 100 55" aria-hidden="true" style={{ flex: 'none' }}>
        <path d="M22 50 a16 16 0 0 1 2 -32 a22 22 0 0 1 42 -4 a18 18 0 0 1 14 36z" fill={dark ? '#6d7a8c' : '#ffffff'} />
        <path d="M30 50 a12 12 0 0 1 8 -14 a16 16 0 0 1 30 4 a10 10 0 0 1 10 10z" fill={dark ? '#58657a' : '#eef6fb'} />
    </svg>;

export const Tree = ({ size = 56 }: { size?: number }) =>
    <svg className="ag-tree" width={size} height={size * 1.2} viewBox="0 0 50 60" aria-hidden="true" style={{ flex: 'none' }}>
        <rect x="22" y="34" width="6" height="24" rx="2" fill="#7a4a22" />
        <circle cx="25" cy="22" r="17" fill="#3aa655" /><circle cx="15" cy="30" r="10" fill="#2f8f4e" /><circle cx="36" cy="29" r="11" fill="#2f8f4e" />
        <circle cx="19" cy="18" r="3" fill="#e0422f" /><circle cx="31" cy="24" r="3" fill="#e0422f" />
    </svg>;

export const Barn = ({ size = 72 }: { size?: number }) =>
    <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden="true" style={{ flex: 'none' }}>
        <path d="M8 36 L40 10 L72 36 V74 H8z" fill="#c8402f" />
        <path d="M4 38 L40 8 L76 38" stroke="#7a2418" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="26" y="42" width="28" height="32" fill="#a73224" stroke="#fff" strokeWidth="3" />
        <path d="M26 42 L54 74 M54 42 L26 74" stroke="#fff" strokeWidth="3" />
        <circle cx="40" cy="28" r="5" fill="#fff3d6" />
    </svg>;

export const Flame = ({ size = 22 }: { size?: number }) =>
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ flex: 'none' }}>
        <path d="M12 2 C13 7 19 9 19 15 a7 7 0 0 1 -14 0 C5 11 8 10 8 6 C10 7 11 5 12 2z" fill="#ff7a1a" />
        <path d="M12 11 C13 14 16 14 16 17 a4 4 0 0 1 -8 0 C8 14 11 14 12 11z" fill="#ffd84d" />
    </svg>;

export const Speaker = ({ on, size = 24 }: { on: boolean; size?: number }) =>
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 9 h4 l5 -4 v14 l-5 -4 H4z" fill="#3b473b" />
        {on ? <path d="M16 8 q4 4 0 8 M18.5 5.5 q7 6.5 0 13" stroke="#3b473b" strokeWidth="2" fill="none" strokeLinecap="round" /> : <path d="M16 9 l6 6 M22 9 l-6 6" stroke="#d64545" strokeWidth="2.4" strokeLinecap="round" />}
    </svg>;

export const Flag = ({ size = 40 }: { size?: number }) =>
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" style={{ flex: 'none' }}>
        <rect x="9" y="4" width="3.5" height="34" rx="1.7" fill="#7a4a22" />
        <path className="ag-flag-wave" d="M12.5 5 q8 -4 14 0 t12 0 v14 q-6 4 -12 0 t-14 0z" fill="#e0422f" />
    </svg>;

export const Trophy = ({ size = 64 }: { size?: number }) =>
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" style={{ flex: 'none' }}>
        <path d="M18 8 h28 v16 a14 14 0 0 1 -28 0z" fill="#f2b705" stroke="#b58600" strokeWidth="2.5" />
        <path d="M18 14 h-8 q0 14 10 16 M46 14 h8 q0 14 -10 16" stroke="#b58600" strokeWidth="3" fill="none" />
        <rect x="28" y="38" width="8" height="10" fill="#d49c00" />
        <rect x="20" y="48" width="24" height="8" rx="3" fill="#b58600" />
        <path d="M32 14 l2.5 5 5.5 .6 -4 3.8 1 5.4 -5 -2.7 -5 2.7 1 -5.4 -4 -3.8 5.5 -.6z" fill="#fff3b0" />
    </svg>;
