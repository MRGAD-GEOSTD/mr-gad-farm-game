import React, { createContext, useCallback, useContext, useState } from 'react';

type StartFn = (e: React.PointerEvent, label: string, onDrop: (target: string | null) => void, onTap: () => void) => void;
const Ctx = createContext<StartFn>(() => {});
export const useDrag = () => useContext(Ctx);

export function DragProvider({ children }: { children: React.ReactNode }) {
    const [ghost, setGhost] = useState<{ label: string; x: number; y: number } | null>(null);
    const start: StartFn = useCallback((e, label, onDrop, onTap) => {
        const sx = e.clientX, sy = e.clientY;
        let moved = false;
        const move = (ev: PointerEvent) => {
            if (!moved && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 8) moved = true;
            if (moved) setGhost({ label, x: ev.clientX, y: ev.clientY });
        };
        const end = (ev: PointerEvent, cancel: boolean) => {
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', up);
            window.removeEventListener('pointercancel', cancelFn);
            setGhost(null);
            if (cancel) return;
            if (!moved) { onTap(); return; }
            const el = document.elementFromPoint(ev.clientX, ev.clientY) as HTMLElement | null;
            const t = el ? el.closest('[data-drop]') : null;
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
