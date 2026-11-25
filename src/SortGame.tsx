import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDrag } from './drag';

export type Bucket = { id: string; label: string; icon: React.ReactNode; color: string };
export type Chip = { id: string; label: string; bucket: string; why: string };
export type Result = { stars: number; score: number; total: number; timeout?: boolean };

function shuffle<T>(a: T[]): T[] { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
export const AR = (n: number) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);

export function SortGame({ intro, buckets, chips, seconds, onDone }: { intro: string; buckets: Bucket[]; chips: Chip[]; seconds?: number; onDone: (r: Result) => void }) {
    const startDrag = useDrag();
    const order = useMemo(() => shuffle(chips), [chips]);
    const [placed, setPlaced] = useState<Record<string, string>>({});
    const [sel, setSel] = useState<string | null>(null);
    const [wrong, setWrong] = useState(0);
    const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
    const [flash, setFlash] = useState<string | null>(null);
    const [left, setLeft] = useState(seconds ?? 0);
    const done = useRef(false);
    const remaining = order.filter((c) => !placed[c.id]);

    const finish = (timeout: boolean, pl: Record<string, string>, wr: number) => {
        if (done.current) return; done.current = true;
        const score = Object.keys(pl).length;
        const stars = timeout ? (score >= chips.length * 0.6 ? 1 : 0) : wr === 0 ? 3 : wr <= 2 ? 2 : 1;
        setTimeout(() => onDone({ stars, score, total: chips.length, timeout }), 900);
    };

    useEffect(() => {
        if (!seconds) return;
        const t = setInterval(() => setLeft((l) => l - 1), 1000);
        return () => clearInterval(t);
    }, [seconds]);
    useEffect(() => { if (seconds && left <= 0) finish(true, placed, wrong); }, [left]);

    const drop = (chipId: string, bucketId: string) => {
        if (done.current) return;
        const chip = chips.find((c) => c.id === chipId)!;
        if (chip.bucket === bucketId) {
            const pl = { ...placed, [chipId]: bucketId };
            setPlaced(pl); setSel(null); setNote({ ok: true, text: chip.why });
            if (Object.keys(pl).length === chips.length) finish(false, pl, wrong);
        } else {
            const b = buckets.find((x) => x.id === chip.bucket)!;
            setWrong(wrong + 1); setSel(null); setFlash(chipId);
            setNote({ ok: false, text: `لا، ${chip.label} مكانها: ${b.label}. ${chip.why}` });
            setTimeout(() => setFlash(null), 500);
        }
    };

    const danger = seconds ? left <= 10 : false;
    return <div>
        <p className="ag-intro">{intro}</p>
        <div className="ag-top">
            <div className="ag-stat">تم <b>{AR(Object.keys(placed).length)}</b> من {AR(chips.length)}</div>
            <div className="ag-stat">أخطاء <b>{AR(wrong)}</b></div>
            {seconds ? <div className={`ag-stat${danger ? ' ag-danger' : ''}`}>{AR(Math.max(0, left))} ث</div> : null}
        </div>
        <div className="ag-buckets" style={{ gridTemplateColumns: `repeat(${buckets.length}, 1fr)` }}>
            {buckets.map((b) => <button type="button" key={b.id} data-drop={b.id} className={`ag-bucket${sel ? ' ag-armed' : ''}`} style={{ borderColor: b.color, background: b.color + '22' }} onClick={() => sel && drop(sel, b.id)}>
                {b.icon}
                <strong>{b.label}</strong>
                <div className="ag-in">{order.filter((c) => placed[c.id] === b.id).map((c) => <span key={c.id} className="ag-mini" style={{ background: b.color }}>{c.label}</span>)}</div>
            </button>)}
        </div>
        <div className="ag-hint">{remaining.length ? 'اسحب العنصر إلى مكانه، أو اضغط عليه ثم اضغط على المكان' : 'أحسنت! خلصت كل العناصر'}</div>
        <div className="ag-chips">
            {remaining.map((c) => <div key={c.id} role="button" tabIndex={0} className={`ag-chip${sel === c.id ? ' ag-sel' : ''}${flash === c.id ? ' ag-shake' : ''}`}
                onPointerDown={(e) => startDrag(e, c.label, (t) => { if (t) drop(c.id, t); }, () => setSel(sel === c.id ? null : c.id))}>{c.label}</div>)}
        </div>
        {note && <div className={`ag-fb ${note.ok ? 'ag-fb-ok' : 'ag-fb-no'}`} role="status"><strong>{note.ok ? 'صح' : 'مش كده'}</strong><p>{note.text}</p></div>}
    </div>;
}
