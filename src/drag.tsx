import React, { createContext, useCallback, useContext, useState } from 'react';
import { sound } from './sound';

/**
 * Pointer-based drag and drop that works the same with a finger and a mouse.
 * Any element with data-drop="<id>" is a target. A press that never moves is a tap.
 * While dragging, the target under the finger gets the class "ag-over".
 */
type StartFn = (e: React.PointerEvent, label: string, onDrop: (target: string | null) => void, onTap: () => void) => void;
const Ctx = createContext<StartFn>(() => {});
export const useDrag = () => useContext(Ctx);

const targetAt = (x: number, y: number): HTMLElement | null => {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    return el ? (el.closest('[data-drop]') as HTMLElement | null) : null;
};

export function DragProvider({ children }: { children: React.ReactNode }) {
    const [ghost, setGhost] = useState<{ label: string; x: number; y: number } | null>(null);

    const start: StartFn = useCallback((e, label, onDrop, onTap) => {
        const sx = e.clientX, sy = e.clientY;
        let moved = false;
        let hot: HTMLElement | null = null;
        const setHot = (t: HTMLElement | null) => {
            if (t === hot) return;
            hot?.classList.remove('ag-over');
            t?.classList.add('ag-over');
            hot = t;
        };
        const move = (ev: PointerEvent) => {
            if (!moved && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 8) { moved = true; sound.play('pop'); }
            if (moved) { setGhost({ label, x: ev.clientX, y: ev.clientY }); setHot(targetAt(ev.clientX, ev.clientY)); }
        };
        const end = (ev: PointerEvent, cancel: boolean) => {
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', up);
            window.removeEventListener('pointercancel', cancelFn);
            setHot(null);
            setGhost(null);
            if (cancel) return;
            if (!moved) { onTap(); return; }
            const t = targetAt(ev.clientX, ev.clientY);
            onDrop(t ? t.getAttribute('data-drop') : null);
        };
        const up = (ev: PointerEvent) => end(ev, false);
        const cancelFn = (ev: PointerEvent) => end(ev, true);
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
        window.addEventListener('pointercancel', cancelFn);
    }, []);

    return <Ctx.Provider value={start}>
        {children}
        {ghost && <div className="ag-ghost" style={{ left: ghost.x, top: ghost.y }}>{ghost.label}</div>}
    </Ctx.Provider>;
}
