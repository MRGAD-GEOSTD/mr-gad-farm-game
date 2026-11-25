import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

/**
 * Game "juice": a canvas particle system (sparkles, confetti, water splashes,
 * leaves, dust), floating score texts and a screen shake. One provider at the
 * top of the app, any component calls useFx().
 */
export type BurstKind = 'sparkle' | 'confetti' | 'splash' | 'leaf' | 'dust' | 'coin';
type Shape = 'star' | 'rect' | 'drop' | 'leaf' | 'dot';
type Particle = { x: number; y: number; vx: number; vy: number; g: number; age: number; life: number; size: number; color: string; shape: Shape; rot: number; vr: number };
type FloatText = { id: number; x: number; y: number; text: string; color: string };

const CONFETTI = ['#f2b705', '#2f8f4e', '#2a8fd0', '#e0422f', '#ff8fb1', '#8a5fd0'];
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

export type FxApi = {
    burst: (x: number, y: number, kind: BurstKind, count?: number) => void;
    burstAt: (el: Element | null, kind: BurstKind, count?: number) => void;
    text: (x: number, y: number, text: string, color?: string) => void;
    textAt: (el: Element | null, text: string, color?: string) => void;
    confettiRain: (count?: number) => void;
    shake: () => void;
};

const noop: FxApi = { burst() {}, burstAt() {}, text() {}, textAt() {}, confettiRain() {}, shake() {} };
const FxContext = createContext<FxApi>(noop);
export const useFx = () => useContext(FxContext);

export function centerOf(el: Element | null): { x: number; y: number } | null {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

function spawn(kind: BurstKind, x: number, y: number, count?: number): Particle[] {
    const out: Particle[] = [];
    const make = (p: Partial<Particle>): Particle => ({ x, y, vx: 0, vy: 0, g: 0, age: 0, life: 1, size: 6, color: '#f2b705', shape: 'dot', rot: 0, vr: 0, ...p });
    if (kind === 'sparkle') {
        for (let i = 0; i < (count ?? 14); i++) {
            const a = rand(0, Math.PI * 2), s = rand(60, 220);
            out.push(make({ vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, g: 260, life: rand(0.5, 0.9), size: rand(5, 10), color: pick(['#f2b705', '#ffd84d', '#fff3b0', '#ffffff']), shape: 'star', vr: rand(-6, 6) }));
        }
    } else if (kind === 'confetti') {
        for (let i = 0; i < (count ?? 36); i++) {
            const a = rand(-Math.PI * 0.95, -Math.PI * 0.05), s = rand(180, 480);
            out.push(make({ vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: 700, life: rand(1.1, 1.8), size: rand(6, 11), color: pick(CONFETTI), shape: 'rect', rot: rand(0, 6), vr: rand(-12, 12) }));
        }
    } else if (kind === 'splash') {
        for (let i = 0; i < (count ?? 16); i++) {
            const a = rand(-Math.PI * 0.9, -Math.PI * 0.1), s = rand(80, 260);
            out.push(make({ vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: 800, life: rand(0.5, 0.85), size: rand(3, 7), color: pick(['#2a8fd0', '#6cc4f0', '#bfe6f8']), shape: 'drop' }));
        }
    } else if (kind === 'leaf') {
        for (let i = 0; i < (count ?? 10); i++) {
            const a = rand(-Math.PI, 0), s = rand(60, 180);
            out.push(make({ vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: 120, life: rand(0.8, 1.4), size: rand(7, 12), color: pick(['#3aa655', '#7fbf4a', '#2f8f4e']), shape: 'leaf', rot: rand(0, 6), vr: rand(-5, 5) }));
        }
    } else if (kind === 'coin') {
        for (let i = 0; i < (count ?? 10); i++) {
            const a = rand(-Math.PI * 0.85, -Math.PI * 0.15), s = rand(200, 380);
            out.push(make({ vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: 900, life: rand(0.8, 1.1), size: rand(7, 10), color: '#f2b705', shape: 'dot' }));
        }
    } else {
        for (let i = 0; i < (count ?? 10); i++) {
            const a = rand(Math.PI, Math.PI * 2), s = rand(20, 90);
            out.push(make({ vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: 40, life: rand(0.4, 0.8), size: rand(4, 9), color: pick(['#b08a5a', '#8a5a2b', '#c9a97a']) }));
        }
    }
    return out;
}

function draw(c: CanvasRenderingContext2D, p: Particle) {
    const fade = Math.max(0, 1 - p.age / p.life);
    c.save();
    c.globalAlpha = Math.min(1, fade * 1.6);
    c.translate(p.x, p.y);
    c.rotate(p.rot);
    c.fillStyle = p.color;
    if (p.shape === 'rect') c.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    else if (p.shape === 'star') {
        c.beginPath();
        for (let i = 0; i < 10; i++) {
            const r = i % 2 ? p.size * 0.4 : p.size, a = (i * Math.PI) / 5 - Math.PI / 2;
            c.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        c.closePath(); c.fill();
    } else if (p.shape === 'leaf') {
        c.beginPath(); c.ellipse(0, 0, p.size, p.size * 0.45, 0, 0, Math.PI * 2); c.fill();
    } else if (p.shape === 'drop') {
        c.beginPath(); c.ellipse(0, 0, p.size * 0.6, p.size, 0, 0, Math.PI * 2); c.fill();
    } else {
        c.beginPath(); c.arc(0, 0, p.size * fade + 1, 0, Math.PI * 2); c.fill();
    }
    c.restore();
}

export function FxProvider({ children }: { children: React.ReactNode }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rootRef = useRef<HTMLDivElement>(null);
    const particles = useRef<Particle[]>([]);
    const raf = useRef(0);
    const last = useRef(0);
    const nextId = useRef(1);
    const [texts, setTexts] = useState<FloatText[]>([]);

    const loop = useCallback((now: number) => {
        const canvas = canvasRef.current;
        const c = canvas?.getContext('2d');
        if (!canvas || !c) { raf.current = 0; return; }
        const dt = Math.min(0.05, (now - (last.current || now)) / 1000);
        last.current = now;
        c.setTransform(1, 0, 0, 1, 0, 0);
        c.clearRect(0, 0, canvas.width, canvas.height);
        const k = canvas.width / window.innerWidth;
        c.scale(k, k);
        particles.current = particles.current.filter((p) => p.age < p.life);
        for (const p of particles.current) {
            p.age += dt; p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
            draw(c, p);
        }
        raf.current = particles.current.length ? requestAnimationFrame(loop) : 0;
        if (!particles.current.length) c.clearRect(0, 0, canvas.width, canvas.height);
    }, []);

    const start = useCallback(() => {
        if (!raf.current) { last.current = 0; raf.current = requestAnimationFrame(loop); }
    }, [loop]);

    useEffect(() => {
        const fit = () => {
            const canvas = canvasRef.current; if (!canvas) return;
            const dpr = Math.min(2, window.devicePixelRatio || 1);
            canvas.width = Math.round(window.innerWidth * dpr);
            canvas.height = Math.round(window.innerHeight * dpr);
        };
        fit();
        window.addEventListener('resize', fit);
        return () => { window.removeEventListener('resize', fit); cancelAnimationFrame(raf.current); };
    }, []);

    const api = useRef<FxApi>(noop);
    api.current = {
        burst(x, y, kind, count) { particles.current.push(...spawn(kind, x, y, count)); start(); },
        burstAt(el, kind, count) { const c = centerOf(el); if (c) api.current.burst(c.x, c.y, kind, count); },
        text(x, y, text, color = '#1f6b37') {
            const id = nextId.current++;
            setTexts((t) => [...t, { id, x, y, text, color }]);
            setTimeout(() => setTexts((t) => t.filter((i) => i.id !== id)), 1000);
        },
        textAt(el, text, color) { const c = centerOf(el); if (c) api.current.text(c.x, c.y - 20, text, color); },
        confettiRain(count = 70) {
            const w = window.innerWidth;
            for (let i = 0; i < count; i++) {
                const p = spawn('confetti', rand(0, w), rand(-40, -5), 1)[0];
                p.vx = rand(-60, 60); p.vy = rand(60, 220); p.g = 90; p.life = rand(2, 3.4); p.age = -rand(0, 0.9);
                particles.current.push(p);
            }
            start();
        },
        shake() {
            const el = rootRef.current; if (!el) return;
            el.classList.remove('ag-shaking'); void el.offsetWidth; el.classList.add('ag-shaking');
        },
    };
    const stable = useRef<FxApi>({
        burst: (...a) => api.current.burst(...a), burstAt: (...a) => api.current.burstAt(...a),
        text: (...a) => api.current.text(...a), textAt: (...a) => api.current.textAt(...a),
        confettiRain: (...a) => api.current.confettiRain(...a), shake: () => api.current.shake(),
    });

    return <FxContext.Provider value={stable.current}>
        <div ref={rootRef} className="ag-fxroot">{children}</div>
        <canvas ref={canvasRef} className="ag-canvas" aria-hidden="true" />
        {texts.map((t) => <div key={t.id} className="ag-float" style={{ left: t.x, top: t.y, color: t.color }}>{t.text}</div>)}
    </FxContext.Provider>;
      }
