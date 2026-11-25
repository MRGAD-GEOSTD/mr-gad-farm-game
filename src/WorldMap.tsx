import React from 'react';
import { Barn, Cloud, Farmer, Flag, Sun, Tree } from './art';
import { Lock, Star } from './icons';
import { AR } from './common';

export type LevelInfo = { id: number; title: string; sub: string; icon: React.ReactNode };

/** Node positions in percent of the map (x from the left, y from the top). */
const NODES = [{ x: 68, y: 84 }, { x: 30, y: 64 }, { x: 68, y: 43 }, { x: 30, y: 23 }];
const PATH = 'M245 437 C150 430 60 390 108 333 C150 280 260 280 245 224 C230 170 90 170 108 120 C120 80 200 70 240 45';

/**
 * The progress map: a winding path through the farm. The farmer stands on the level you
 * should play next and walks to the next node when it unlocks.
 */
export function WorldMap({ levels, stars, current, onOpen }: { levels: LevelInfo[]; stars: Record<number, number>; current: number; onOpen: (id: number) => void }) {
    const unlocked = (id: number) => id === 1 || (stars[id - 1] ?? 0) >= 1;
    const me = NODES[current - 1];
    const farmerX = me.x > 50 ? me.x - 17 : me.x + 17;
    return <div className="ag-map">
        <svg className="ag-map-path" viewBox="0 0 360 520" preserveAspectRatio="none" aria-hidden="true">
            <path d={PATH} stroke="#d9c58f" strokeWidth="30" fill="none" strokeLinecap="round" />
            <path d={PATH} stroke="#fff6d8" strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray="2 14" className="ag-map-dash" />
        </svg>
        <div className="ag-map-sun"><Sun size={58} /></div>
        <div className="ag-cloud ag-cloud-a" style={{ top: '4%' }}><Cloud width={78} /></div>
        <div className="ag-cloud ag-cloud-b" style={{ top: '14%' }}><Cloud width={52} /></div>
        <div className="ag-map-deco" style={{ left: '8%', top: '78%' }}><Tree size={52} /></div>
        <div className="ag-map-deco" style={{ left: '88%', top: '58%' }}><Tree size={44} /></div>
        <div className="ag-map-deco" style={{ left: '10%', top: '40%' }}><Tree size={48} /></div>
        <div className="ag-map-deco" style={{ left: '90%', top: '24%' }}><Tree size={50} /></div>
        <div className="ag-map-deco" style={{ left: '70%', top: '7%' }}><Barn size={66} /></div>
        <div className="ag-map-deco" style={{ left: '84%', top: '5%' }}><Flag size={40} /></div>
        {levels.map((l, i) => {
            const ok = unlocked(l.id);
            const n = NODES[i];
            return <div key={l.id} className="ag-node-wrap" style={{ left: `${n.x}%`, top: `${n.y}%` }}>
                <div className="ag-node-stars">{[0, 1, 2].map((k) => <Star key={k} on={k < (stars[l.id] ?? 0)} size={20} />)}</div>
                <button type="button" disabled={!ok} className={`ag-node${ok ? '' : ' ag-node-locked'}${current === l.id ? ' ag-node-now' : ''}`} onClick={() => onOpen(l.id)} aria-label={`المرحلة ${AR(l.id)}: ${l.title}`}>
                    {ok ? l.icon : <Lock size={40} />}
                </button>
                <div className="ag-node-label"><b>{AR(l.id)}. {l.title}</b></div>
            </div>;
        })}
        <div className="ag-map-farmer" style={{ left: `${farmerX}%`, top: `${me.y + 4}%` }}><Farmer mood="happy" size={52} /></div>
    </div>;
}
