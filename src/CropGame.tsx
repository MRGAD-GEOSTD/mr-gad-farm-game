import React, { useEffect, useRef, useState } from 'react';
import { useDrag } from './drag';
import { Cane, Cotton, Heart, Wheat } from './icons';
import { AR, type Result } from './SortGame';

type Card = { label: string; bin: string; why: string };
const CARDS: Card[] = [
    { label: 'القمح', bin: 'grain', why: 'القمح من الحبوب الغذائية.' },
    { label: 'الخبز', bin: 'grain', why: 'الخبز يصنع من القمح، وهو من الحبوب الغذائية.' },
    { label: 'قصب السكر', bin: 'sugar', why: 'قصب السكر من المحاصيل السكرية.' },
    { label: 'السكر', bin: 'sugar', why: 'السكر يصنع من قصب السكر، وهو من المحاصيل السكرية.' },
    { label: 'يزرع في الصعيد', bin: 'sugar', why: 'قصب السكر يزرع في مناطق من صعيد مصر.' },
    { label: 'القطن', bin: 'fiber', why: 'القطن من محاصيل الألياف.' },
    { label: 'الملابس والمنسوجات', bin: 'fiber', why: 'القطن يدخل في صناعة الملابس والمنسوجات.' },
    { label: 'القطن طويل التيلة', bin: 'fiber', why: 'مصر من أشهر الدول إنتاجًا للقطن طويل التيلة.' },
];
const BINS = [
    { id: 'grain', label: 'حبوب غذائية', icon: <Wheat size={44} />, color: '#d99a00' },
    { id: 'sugar', label: 'محاصيل سكرية', icon: <Cane size={44} />, color: '#4f8a2a' },
    { id: 'fiber', label: 'محاصيل الألياف', icon: <Cotton size={44} />, color: '#6a7f99' },
];
const H = 270, IH = 54, GOAL = 16;
type Fall = { id: number; card: Card; lane: number; y: number };

export function CropGame({ onDone }: { onDone: (r: Result) => void }) {
    const startDrag = useDrag();
    const [items, setItems] = useState<Fall[]>([]);
    const [lives, setLives] = useState(3);
    const [sorted, setSorted] = useState(0);
    const [combo, setCombo] = useState(0);
    const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
    const [started, setStarted] = useState(false);
    const st = useRef({ items: [] as Fall[], lives: 3, sorted: 0, spawned: 0, next: 0.4, id: 1, over: false, last: 0, t: 0 });

    const end = (win: boolean) => {
        const s = st.current; if (s.over) return; s.over = true;
        setTimeout(() => onDone({ stars: win ? s.lives : 0, score: s.sorted, total: GOAL }), 700);
    };
    const judge = (id: number, bin: string) => {
        const s = st.current; if (s.over) return;
        const it = s.items.find((x) => x.id === id); if (!it) return;
        s.items = s.items.filter((x) => x.id !== id);
        if (it.card.bin === bin) {
            s.sorted += 1; setCombo((c) => c + 1); setNote({ ok: true, text: it.card.why });
            setSorted(s.sorted);
            if (s.sorted >= GOAL) end(true);
        } else {
            s.lives -= 1; setCombo(0); setLives(s.lives);
            const b = BINS.find((x) => x.id === it.card.bin)!;
            setNote({ ok: false, text: `${it.card.label} مكانها: ${b.label}. ${it.card.why}` });
            if (s.lives <= 0) end(false);
        }
        setItems(s.items.slice());
    };
    const lowest = () => st.current.items.slice().sort((a, b) => b.y - a.y)[0];

    useEffect(() => {
        if (!started) return;
        let raf = 0;
        const tick = (now: number) => {
            const s = st.current;
            if (s.over) return;
            if (!s.last) s.last = now;
            const dt = Math.min(0.05, (now - s.last) / 1000); s.last = now; s.t += dt;
            const speed = 40 + s.sorted * 4.5;
            s.items.forEach((it) => { it.y += speed * dt; });
            const fell = s.items.filter((it) => it.y > H - 4);
            if (fell.length) {
                s.items = s.items.filter((it) => it.y <= H - 4);
                s.lives -= fell.length; setLives(s.lives); setCombo(0);
                setNote({ ok: false, text: `فاتك: ${fell[0].card.label}. ${fell[0].card.why}` });
                if (s.lives <= 0) { end(false); setItems(s.items.slice()); return; }
            }
            s.next -= dt;
            if (s.next <= 0 && s.spawned < GOAL + 2 + (3 - s.lives)) {
                const lanes = [0, 1, 2].filter((l) => !s.items.some((it) => it.lane === l && it.y < IH + 20));
                if (lanes.length) {
                    const lane = lanes[Math.floor(Math.random() * lanes.length)];
                    const card = CARDS[Math.floor(Math.random() * CARDS.length)];
                    s.items.push({ id: s.id++, card, lane, y: -IH }); s.spawned += 1;
                    s.next = Math.max(1.1, 2.4 - s.sorted * 0.07);
                } else s.next = 0.3;
            }
            if (s.spawned >= GOAL + 2 + (3 - s.lives) && s.items.length === 0 && s.sorted < GOAL) { s.spawned -= 3; }
            setItems(s.items.slice());
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [started]);

    return <div>
        <p className="ag-intro">صنّف الكارت قبل ما يوصل الأرض: اسحبه للصندوق، أو اضغط الصندوق.</p>
        <div className="ag-top">
            <div className="ag-stat">تم <b>{AR(sorted)}</b> من {AR(GOAL)}</div>
            <div className="ag-stat" aria-label="المحاولات">{[0, 1, 2].map((k) => <Heart key={k} on={k < lives} />)}</div>
            <div className="ag-stat">سلسلة <b>{AR(combo)}</b></div>
        </div>
        <div className="ag-sky" style={{ height: H }}>
            {!started && <div className="ag-overlay"><button type="button" className="ag-btn ag-primary" onClick={() => setStarted(true)}>ابدأ</button></div>}
            {items.map((it) => {
                const front = lowest();
                return <div key={it.id} role="button" tabIndex={0} className={`ag-fall${front && front.id === it.id ? ' ag-front' : ''}`}
                    style={{ transform: `translateY(${it.y}px)`, right: `${2 + it.lane * 33}%`, height: IH }}
                    onPointerDown={(e) => startDrag(e, it.card.label, (t) => { if (t) judge(it.id, t); }, () => {})}>{it.card.label}</div>;
            })}
            <div className="ag-ground" />
        </div>
        <div className="ag-bins">
            {BINS.map((b) => <button type="button" key={b.id} data-drop={b.id} className="ag-bin" style={{ borderColor: b.color, background: b.color + '22' }}
                onClick={() => { const f = lowest(); if (f) judge(f.id, b.id); }}>{b.icon}<strong>{b.label}</strong></button>)}
        </div>
        {note && <div className={`ag-fb ${note.ok ? 'ag-fb-ok' : 'ag-fb-no'}`} role="status"><strong>{note.ok ? 'صح' : 'خطأ'}</strong><p>{note.text}</p></div>}
    </div>;
}
