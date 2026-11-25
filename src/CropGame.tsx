import React, { useEffect, useRef, useState } from 'react';
import { useDrag } from './drag';
import { useFx } from './fx';
import { Coach, type Note } from './Coach';
import { Cloud, Flame, Sun } from './art';
import { Cane, Cotton, Heart, Star, Wheat } from './icons';
import { sound } from './sound';
import { AR, wait, type Result } from './common';

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
const GOLD: Card = { label: 'نجمة ذهبية', bin: '', why: '' };
const BINS = [
    { id: 'grain', label: 'حبوب غذائية', icon: <Wheat size={44} />, color: '#d99a00' },
    { id: 'sugar', label: 'محاصيل سكرية', icon: <Cane size={44} />, color: '#4f8a2a' },
    { id: 'fiber', label: 'محاصيل الألياف', icon: <Cotton size={44} />, color: '#6a7f99' },
];
const H = 250, IH = 54, GOAL = 16, SLOW_SECONDS = 6;
type Fall = { id: number; card: Card; lane: number; y: number; gold?: boolean };
const hit = (id: number) => document.querySelector(`[data-fid="${id}"]`);

/**
 * Level 3: cards fall in three lanes. Drag each to its bin (or tap a bin to sort the lowest card).
 * Every 5th correct card sends a golden star, tap it to slow time for a few seconds.
 */
export function CropGame({ onDone }: { onDone: (r: Result) => void }) {
    const startDrag = useDrag();
    const fx = useFx();
    const [items, setItems] = useState<Fall[]>([]);
    const [lives, setLives] = useState(3);
    const [sorted, setSorted] = useState(0);
    const [combo, setCombo] = useState(0);
    const [slow, setSlow] = useState(false);
    const [bump, setBump] = useState<string | null>(null);
    const [note, setNote] = useState<Note | null>(null);
    const [started, setStarted] = useState(false);
    const noteId = useRef(1);
    const sky = useRef<HTMLDivElement>(null);
    const st = useRef({ items: [] as Fall[], lives: 3, sorted: 0, combo: 0, spawned: 0, next: 0.4, id: 1, over: false, last: 0, t: 0, slow: 0, goldDue: false });

    const say = (ok: boolean, title: string, text: string) => setNote({ id: noteId.current++, ok, title, text });
    const end = (win: boolean) => {
        const s = st.current;
        if (s.over) return;
        s.over = true;
        sound.play(win ? 'win' : 'lose');
        if (win) fx.confettiRain(60);
        wait(1100, () => onDone({ stars: win ? s.lives : 0, score: s.sorted, total: GOAL }));
    };
    const lowest = () => st.current.items.filter((x) => !x.gold).sort((a, b) => b.y - a.y)[0];

    const judge = (id: number, bin: string) => {
        const s = st.current;
        if (s.over) return;
        const it = s.items.find((x) => x.id === id);
        if (!it || it.gold) return;
        const from = hit(id), binEl = document.querySelector(`[data-drop="${bin}"]`);
        s.items = s.items.filter((x) => x.id !== id);
        if (it.card.bin === bin) {
            s.sorted += 1; s.combo += 1;
            setSorted(s.sorted); setCombo(s.combo); setBump(bin); wait(400, () => setBump(null));
            say(true, 'صح!', it.card.why);
            fx.burstAt(binEl, 'sparkle'); fx.textAt(binEl, '+١', '#1f6b37');
            sound.play('ok');
            if (s.combo === 3 || s.combo === 6 || s.combo === 9) {
                sound.play('combo');
                fx.textAt(sky.current, s.combo === 3 ? 'رائع!' : s.combo === 6 ? 'ممتاز!' : 'أسطورة!', '#d46a00');
                fx.burstAt(sky.current, 'confetti', 24);
            }
            if (s.sorted % 5 === 0 && s.sorted < GOAL) s.goldDue = true;
            if (s.sorted >= GOAL) end(true);
        } else {
            s.lives -= 1; s.combo = 0;
            setLives(s.lives); setCombo(0);
            const right = BINS.find((x) => x.id === it.card.bin)!;
            say(false, 'خطأ', `${it.card.label} مكانها: ${right.label}. ${it.card.why}`);
            fx.shake(); fx.burstAt(from, 'dust', 14);
            sound.play('bad');
            if (s.lives <= 0) end(false);
        }
        setItems(s.items.slice());
    };

    const grabGold = (id: number) => {
        const s = st.current;
        const el = hit(id);
        s.items = s.items.filter((x) => x.id !== id);
        s.slow = SLOW_SECONDS; setSlow(true);
        fx.burstAt(el, 'confetti', 30); fx.textAt(el, 'الوقت أبطأ!', '#2a8fd0');
        sound.play('coin');
        setItems(s.items.slice());
    };

    useEffect(() => {
        if (!started) return;
        let raf = 0;
        const tick = (now: number) => {
            const s = st.current;
            if (s.over) return;
            if (!s.last) s.last = now;
            const dt = Math.min(0.05, (now - s.last) / 1000);
            s.last = now; s.t += dt;
            if (s.slow > 0) { s.slow -= dt; if (s.slow <= 0) setSlow(false); }
            const speed = (40 + s.sorted * 4.5) * (s.slow > 0 ? 0.4 : 1);
            s.items.forEach((it) => { it.y += speed * dt; });
            const fell = s.items.filter((it) => it.y > H - 4);
            if (fell.length) {
                s.items = s.items.filter((it) => it.y <= H - 4);
                const real = fell.filter((f) => !f.gold);
                const rect = sky.current?.getBoundingClientRect();
                fell.forEach((f) => { const r = hit(f.id)?.getBoundingClientRect(); if (r && rect) fx.burst(r.left + r.width / 2, rect.bottom - 6, 'dust', 12); });
                if (real.length) {
                    s.lives -= real.length; s.combo = 0; setLives(s.lives); setCombo(0);
                    say(false, 'فاتك الكارت', `${real[0].card.label}: ${real[0].card.why}`);
                    fx.shake(); sound.play('bad');
                    if (s.lives <= 0) { end(false); setItems(s.items.slice()); return; }
                }
            }
            s.next -= dt;
            const cap = GOAL + 2 + (3 - s.lives);
            if (s.next <= 0 && s.spawned < cap) {
                const lanes = [0, 1, 2].filter((l) => !s.items.some((it) => it.lane === l && it.y < IH + 20));
                if (lanes.length) {
                    const lane = lanes[Math.floor(Math.random() * lanes.length)];
                    const gold = s.goldDue;
                    s.goldDue = false;
                    s.items.push({ id: s.id++, card: gold ? GOLD : CARDS[Math.floor(Math.random() * CARDS.length)], lane, y: -IH, gold });
                    if (!gold) s.spawned += 1;
                    s.next = Math.max(1.1, 2.4 - s.sorted * 0.07);
                } else s.next = 0.3;
            }
            if (s.spawned >= cap && s.items.every((i) => i.gold) && s.sorted < GOAL) s.spawned -= 3;
            setItems(s.items.slice());
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [started]);

    const front = lowest();
    return <div>
        <p className="ag-intro">صنّف الكارت قبل ما يوصل الأرض: اسحبه للصندوق، أو اضغط الصندوق. اصطاد النجمة الذهبية تبطّئ الوقت.</p>
        <div className="ag-top">
            <div className="ag-stat">تم <b>{AR(sorted)}</b> من {AR(GOAL)}</div>
            <div className="ag-stat" aria-label="المحاولات">{[0, 1, 2].map((k) => <Heart key={k} on={k < lives} />)}</div>
            <div className={`ag-stat${combo >= 3 ? ' ag-hot' : ''}`}><Flame />سلسلة <b>{AR(combo)}</b></div>
        </div>
        <div className="ag-bar"><div style={{ width: `${(sorted / GOAL) * 100}%` }} /></div>
        <div ref={sky} className={`ag-sky${slow ? ' ag-slow' : ''}`} style={{ height: H }}>
            <div className="ag-sky-sun"><Sun size={46} /></div>
            <div className="ag-cloud ag-cloud-a"><Cloud width={80} /></div>
            <div className="ag-cloud ag-cloud-b"><Cloud width={56} /></div>
            {slow && <div className="ag-slowtag">الوقت أبطأ</div>}
            {!started && <div className="ag-overlay"><button type="button" className="ag-btn ag-primary" onClick={() => { sound.play('whoosh'); setStarted(true); }}>ابدأ</button></div>}
            {items.map((it) => it.gold
                ? <div key={it.id} data-fid={it.id} role="button" tabIndex={0} className="ag-fall ag-gold"
                    style={{ transform: `translateY(${it.y}px)`, right: `${2 + it.lane * 33}%`, height: IH }}
                    onPointerDown={() => grabGold(it.id)}><Star size={34} />نجمة</div>
                : <div key={it.id} data-fid={it.id} role="button" tabIndex={0} className={`ag-fall${front && front.id === it.id ? ' ag-front' : ''}`}
                    style={{ transform: `translateY(${it.y}px) rotate(${Math.sin(st.current.t * 2.2 + it.id) * 2.5}deg)`, right: `${2 + it.lane * 33}%`, height: IH }}
                    onPointerDown={(e) => startDrag(e, it.card.label, (t) => { if (t) judge(it.id, t); }, () => {})}>{it.card.label}</div>)}
            <div className="ag-ground" />
        </div>
        <div className="ag-bins">
            {BINS.map((b) => <button type="button" key={b.id} data-drop={b.id} className={`ag-bin${bump === b.id ? ' ag-bump' : ''}`} style={{ borderColor: b.color, background: b.color + '22' }}
                onClick={() => { const f = lowest(); if (f) judge(f.id, b.id); }}>{b.icon}<strong>{b.label}</strong></button>)}
        </div>
        <Coach note={note} idle="صنّف بسرعة! كل ٥ كروت صح بتنزل نجمة ذهبية." />
    </div>;
}
