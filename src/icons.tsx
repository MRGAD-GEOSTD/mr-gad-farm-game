import React from 'react';

export const Svg = ({ children, size = 48, vb = 64 }: { children: React.ReactNode; size?: number; vb?: number }) =>
    <svg width={size} height={size} viewBox={`0 0 ${vb} ${vb}`} aria-hidden="true" style={{ flex: 'none' }}>{children}</svg>;

export const Wheat = ({ size = 48 }: { size?: number }) => <Svg size={size}>
    <path d="M32 62 V20" stroke="#2f8f4e" strokeWidth="3.5" strokeLinecap="round" />
    {[0, 1, 2, 3].map((k) => <g key={k}>
        <ellipse cx="25" cy={26 - k * 7} rx="3.2" ry="5.5" fill="#f2b705" transform={`rotate(-30 25 ${26 - k * 7})`} />
        <ellipse cx="39" cy={26 - k * 7} rx="3.2" ry="5.5" fill="#f2b705" transform={`rotate(30 39 ${26 - k * 7})`} />
    </g>)}
    <ellipse cx="32" cy="3" rx="3" ry="5" fill="#f2b705" />
</Svg>;

export const Cane = ({ size = 48 }: { size?: number }) => <Svg size={size}>
    {[18, 32, 46].map((x, k) => <g key={x}>
        <rect x={x - 5} y={14 + k * 3} width="10" height={46 - k * 3} rx="4" fill="#7fbf4a" stroke="#4f8a2a" strokeWidth="2" />
        {[24, 34, 44, 54].map((y) => <line key={y} x1={x - 5} x2={x + 5} y1={y + k * 3} y2={y + k * 3} stroke="#4f8a2a" strokeWidth="2" />)}
        <path d={`M${x} ${14 + k * 3} q-10 -8 -14 -2 M${x} ${14 + k * 3} q10 -8 14 -2`} stroke="#2f8f4e" strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>)}
</Svg>;

export const Cotton = ({ size = 48 }: { size?: number }) => <Svg size={size}>
    <path d="M32 62 V32" stroke="#6e4a22" strokeWidth="4" strokeLinecap="round" />
    <path d="M32 44 L16 34 M32 44 L48 34" stroke="#6e4a22" strokeWidth="3" strokeLinecap="round" />
    {[[32, 22], [17, 28], [47, 28]].map(([x, y], k) => <g key={k}>
        <path d={`M${x - 9} ${y + 8} q-2 -10 6 -10 q-2 -8 6 -8 q8 0 6 8 q8 0 6 10 z`} fill="#fff" stroke="#c9c9c0" strokeWidth="2" strokeLinejoin="round" transform={`scale(.9) translate(${x * 0.11} ${y * 0.11})`} />
    </g>)}
</Svg>;

export const River = ({ size = 48 }: { size?: number }) => <Svg size={size}>
    <rect x="2" y="8" width="60" height="48" rx="10" fill="#dff1fb" />
    {[22, 36, 50].map((y) => <path key={y} className="ic-wave" style={{ animationDelay: `${y * 12}ms` }} d={`M6 ${y} q8 -9 14 0 t14 0 t14 0 t10 0`} stroke="#2a8fd0" strokeWidth="5" fill="none" strokeLinecap="round" />)}
</Svg>;

export const Underground = ({ size = 48 }: { size?: number }) => <Svg size={size}>
    <rect x="2" y="8" width="60" height="48" rx="10" fill="#f6ead2" />
    <path d="M10 26 H54" stroke="#8a5a2b" strokeWidth="4" strokeLinecap="round" />
    <path className="ic-bob" d="M32 6 C26 14 22 18 22 22 a10 10 0 0 0 20 0 C42 18 38 14 32 6z" fill="#2a8fd0" />
    <path d="M12 46 q8 -8 14 0 t14 0 t12 0" stroke="#2a8fd0" strokeWidth="4" fill="none" strokeLinecap="round" />
</Svg>;

export const Rain = ({ size = 48 }: { size?: number }) => <Svg size={size}>
    <rect x="2" y="8" width="60" height="48" rx="10" fill="#e8eef7" />
    <path d="M18 34 a9 9 0 0 1 4 -17 a12 12 0 0 1 23 3 a8 8 0 0 1 -2 14 z" fill="#8aa0bd" />
    {[20, 32, 44].map((x) => <path key={x} className="ic-drop" style={{ animationDelay: `${x * 20}ms` }} d={`M${x} 40 l-3 8 M${x + 2} 46 l-3 8`} stroke="#2a8fd0" strokeWidth="3.5" strokeLinecap="round" />)}
</Svg>;

export const Leaf = ({ size = 48 }: { size?: number }) => <Svg size={size}>
    <rect x="2" y="8" width="60" height="48" rx="10" fill="#e3f4df" />
    <path d="M16 46 C14 24 30 14 50 14 C50 34 40 48 16 46z" fill="#3aa655" />
    <path d="M16 46 C26 36 34 28 44 20" stroke="#1f6b37" strokeWidth="3" fill="none" strokeLinecap="round" />
</Svg>;

export const Worker = ({ size = 48 }: { size?: number }) => <Svg size={size}>
    <rect x="2" y="8" width="60" height="48" rx="10" fill="#fff1d6" />
    <circle cx="32" cy="24" r="8" fill="#c98a3d" />
    <path d="M14 52 a18 16 0 0 1 36 0z" fill="#e0a13a" />
    <path d="M22 18 h20 l-4 -6 h-12z" fill="#f2b705" />
</Svg>;

export const Warn = ({ size = 48 }: { size?: number }) => <Svg size={size}>
    <path d="M32 6 L60 56 H4z" fill="#f2b705" stroke="#b58600" strokeWidth="3" strokeLinejoin="round" />
    <rect x="29" y="22" width="6" height="18" rx="3" fill="#5a3b00" />
    <circle cx="32" cy="47" r="3.5" fill="#5a3b00" />
</Svg>;

export const Star = ({ on = true, size = 22 }: { on?: boolean; size?: number }) =>
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ flex: 'none' }}><path d="M12 2l3 7 7.5.6-5.7 4.9 1.8 7.4L12 18l-6.6 3.9 1.8-7.4L1.5 9.6 9 9z" fill={on ? '#f2b705' : '#d9d9d0'} stroke={on ? '#b58600' : '#c4c4ba'} strokeWidth="1.2" strokeLinejoin="round" /></svg>;

export const Heart = ({ on = true, size = 24 }: { on?: boolean; size?: number }) =>
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ flex: 'none' }}><path d="M12 21 C4 14 2 10 2 7.5 A5 5 0 0 1 12 6 A5 5 0 0 1 22 7.5 C22 10 20 14 12 21z" fill={on ? '#e0422f' : '#e4e0d8'} /></svg>;

export const Lock = ({ size = 28 }: { size?: number }) =>
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" fill="#8d958a" /><path d="M8 11 V8 a4 4 0 0 1 8 0 V11" stroke="#8d958a" strokeWidth="2.5" fill="none" /></svg>;

/* A farm plot: state 0 empty, 1 withered, 2 sprout, 3 grown */
export function Plot({ state, size = 52 }: { state: number; size?: number }) {
    return <Svg size={size}>
        <rect x="2" y="30" width="60" height="30" rx="8" fill={state === 1 ? '#a98a5f' : '#8a5a2b'} />
        <rect x="2" y="30" width="60" height="6" rx="3" fill={state === 1 ? '#8f734a' : '#6e4520'} />
        {state === 1 && <><path d="M32 46 V30 q8 -2 8 4" stroke="#8c6b1f" strokeWidth="3.5" fill="none" strokeLinecap="round" /><path d="M32 40 q-9 -2 -10 6" stroke="#8c6b1f" strokeWidth="3" fill="none" strokeLinecap="round" /></>}
        {state === 2 && <><path d="M32 46 V28" stroke="#2f8f4e" strokeWidth="3.5" strokeLinecap="round" /><ellipse cx="24" cy="30" rx="8" ry="4" fill="#3aa655" transform="rotate(-30 24 30)" /><ellipse cx="40" cy="30" rx="8" ry="4" fill="#3aa655" transform="rotate(30 40 30)" /></>}
        {state === 3 && <><path d="M32 46 V10" stroke="#2f8f4e" strokeWidth="3.5" strokeLinecap="round" />{[0, 1, 2].map((k) => <g key={k}><ellipse cx="26" cy={26 - k * 8} rx="3" ry="5" fill="#f2b705" transform={`rotate(-30 26 ${26 - k * 8})`} /><ellipse cx="38" cy={26 - k * 8} rx="3" ry="5" fill="#f2b705" transform={`rotate(30 38 ${26 - k * 8})`} /></g>)}<ellipse cx="32" cy="6" rx="3" ry="5" fill="#f2b705" /></>}
    </Svg>;
}
