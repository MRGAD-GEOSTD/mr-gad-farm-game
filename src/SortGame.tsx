import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDrag } from './drag';
import { useFx, type BurstKind } from './fx';
import { Coach, type Note } from './Coach';
import { Flame } from './art';
import { Plot } from './icons';
import { sound } from './sound';
import { AR, shuffle, wait, type Result } from './common';

export type Bucket = { id: string; label: string; icon: React.ReactNode; color: string; fx: BurstKind };
export type Chip = { id: string; label: string; bucket: string; why: string };

type Props = {
    intro: string;
    buckets: Bucket[];
    chips: Chip[];
    /** Countdown mode (level 2). Wrong answers cost `penalty` seconds, every third answer in a row gives 3 back. */
    seconds?: number;
    penalty?: number;
    onDone: (r: Result) => void;
};

/** Levels 1 and 2: drag every card onto the bucket it belongs to. */
export function SortGame({ intro, buckets, chips, seconds, penalty = 0, onDone }: Props) {
    const startDrag = useDrag();
    const fx = useFx();
    const order = useMemo(() => shuffle(chips), [chips]);
    const [placed, setPlaced] = useState<Record<string, string>>({});
    const [sel, setSel] = useState<string | null>(null);
    const [wrong, setWrong] = useState(0);
    const [combo, setCombo] = useState(0);
    const [note, setNote] = useState<Note | null>(null);
    const [flash, setFlash] = useState<string | null>(null);
    const [bump, setBump] = useState<string | null>(null);
    const [left, setLeft] = useState(seconds ?? 0);
    const noteId = useRef(1);
    const finished = useRef(false);
    const remaining = order.filter((c) => !placed[c.id]);
    const count = Object.keys(placed).length;

    const finish = (timeout: boolean, pl: Record<string, string>, wr: number) => {
        if (finished.current) return;
        finished.current = true;
        const score = Object.keys(pl).length;
        const stars = timeout ? (score >= chips.length * 0.6 ? 1 : 0) : wr === 0 ? 3 : wr <= 2 ? 2 : 1;
        wait(1100, () => onDone({ stars, score, total: chips.length, timeout }));
    };

    useEffect(() => {
        if (!seconds) return;
        const t = window.setInterval(() => setLeft((l) => (finished.current ? l : l - 1)), 1000);
        return () => window.clearInterval(t);
    }, [seconds]);
    useEffect(() => {
        if (!seconds) return;
        if (left <= 0) { sound.play('lose'); finish(true, placed, wrong); }
        else if (left <= 5) sound.play('tick');
    }, [left]);

    const say = (ok: boolean, title: string, text: string) => setNote({ id: noteId.current++, ok, title, text });

    const drop = (chipId: string, bucketId: string) => {
        if (finished.current) return;
        const chip = chips.find((c) => c.id === chipId)!;
        const el = document.querySelector(`[data-drop="${bucketId}"]`);
        setSel(null);
        if (chip.bucket === bucketId) {
            const pl = { ...placed, [chipId]: bucketId };
            const nextCombo = combo + 1;
            setPlaced(pl); setCombo(nextCombo); setBump(bucketId); wait(450, () => setBump(null));
            say(true, 'صح!', chip.why);
            fx.burstAt(el, buckets.find((b) => b.id === bucketId)!.fx);
            fx.textAt(el, '+١', '#1f6b37');
            sound.play('ok');
            if (nextCombo % 3 === 0) {
                sound.play('combo');
                fx.burstAt(el, 'sparkle', 22);
                fx.textAt(el, `سلسلة ×${AR(nextCombo)}`, '#d46a00');
                if (seconds) { setLeft((l) => l + 3); wait(350, () => fx.textAt(el, '+٣ ثواني', '#2a8fd0')); }
            }
            if (Object.keys(pl).length === chips.length) {
                sound.play('win');
                wait(250, () => fx.confettiRain(50));
                finish(false, pl, wrong);
            }
        } else {
            const right = buckets.find((b) => b.id === chip.bucket)!;
            setWrong(wrong + 1); setCombo(0); setFlash(chipId); wait(500, () => setFlash(null));
            say(false, 'مش كده', `${chip.label} مكانها: ${right.label}. ${chip.why}`);
            fx.shake(); fx.burstAt(el, 'dust');
            sound.play('bad');
            if (seconds && penalty) { setLeft((l) => l - penalty); fx.textAt(el, `-${AR(penalty)} ثواني`, '#c0302a'); }
        }
    };

    const danger = seconds ? left <= 10 : false;
    return <div>
        <p className="ag-intro">{intro}</p>
        <div className="ag-top">
            <div className="ag-stat">تم <b>{AR(count)}</b> من {AR(chips.length)}</div>
            <div className={`ag-stat${combo >= 2 ? ' ag-hot' : ''}`}><Flame />سلسلة <b>{AR(combo)}</b></div>
            {seconds ? <div className={`ag-stat${danger ? ' ag-danger' : ''}`}>{AR(Math.max(0, left))} ث</div> : <div className="ag-stat">أخطاء <b>{AR(wrong)}</b></div>}
        </div>
        {seconds ? <div className="ag-bar"><div className={danger ? 'ag-bar-hot' : ''} style={{ width: `${Math.min(100, (Math.max(0, left) / seconds) * 100)}%` }} /></div> : null}
        <div className="ag-field" aria-label="حقلك">
            {order.map((c) => <div key={c.id} className="ag-field-plot"><Plot key={placed[c.id] ? 'g' : 'e'} state={placed[c.id] ? 3 : 0} size={34} /></div>)}
        </div>
        <div className="ag-buckets" style={{ gridTemplateColumns: `repeat(${buckets.length}, 1fr)` }}>
            {buckets.map((b) => <button type="button" key={b.id} data-drop={b.id} className={`ag-bucket${sel ? ' ag-armed' : ''}${bump === b.id ? ' ag-bump' : ''}`}
                style={{ borderColor: b.color, background: b.color + '22' }} onClick={() => sel && drop(sel, b.id)}>
                {b.icon}
                <strong>{b.label}</strong>
                <div className="ag-in">{order.filter((c) => placed[c.id] === b.id).map((c) => <span key={c.id} className="ag-mini" style={{ background: b.color }}>{c.label}</span>)}</div>
            </button>)}
        </div>
        <div className="ag-hint">{remaining.length ? 'اسحب العنصر إلى مكانه، أو اضغط عليه ثم اضغط على المكان' : 'أحسنت! خلصت كل العناصر'}</div>
        <div className="ag-chips">
            {remaining.map((c, i) => <div key={c.id} role="button" tabIndex={0} style={{ animationDelay: `${i * 60}ms` }}
                className={`ag-chip${sel === c.id ? ' ag-sel' : ''}${flash === c.id ? ' ag-shake' : ''}`}
                onPointerDown={(e) => startDrag(e, c.label, (t) => { if (t) drop(c.id, t); }, () => { sound.play('pop'); setSel(sel === c.id ? null : c.id); })}>{c.label}</div>)}
        </div>
        <Coach note={note} idle="يلا يا بطل! اسحب كل كارت لمكانه الصح." />
    </div>;
}
