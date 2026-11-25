import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDrag } from './drag';
import { useFx } from './fx';
import { Coach, type Note } from './Coach';
import { Barn, Cloud, Farmer, Sun, type Mood } from './art';
import { Plot, Warn } from './icons';
import { sound } from './sound';
import { AR, shuffle, wait, type Result } from './common';

const SOL = {
    desal: 'تحلية مياه البحر', reclaim: 'استصلاح الأراضي الصحراوية', sewage: 'معالجة مياه الصرف',
    dams: 'بناء السدود والخزانات', drip: 'الري بالتنقيط', seeds: 'بذور مقاومة للتغيرات المناخية', future: 'مشروع مستقبل مصر للزراعة المستدامة',
} as const;
type Key = keyof typeof SOL;
/** Solutions that bring water get a rain animation, the others grow leaves. */
const WATER: Key[] = ['dams', 'drip', 'desal', 'sewage'];
type Scene = 'drought' | 'scarce' | 'climate' | 'sprawl' | 'pollution' | 'food';
const PROBLEMS: { text: string; scene: Scene; ok: Key[]; why: string }[] = [
    { text: 'قلة الأمطار هذا الموسم، والمحصول يحتاج ماء', scene: 'drought', ok: ['dams', 'drip'], why: 'السدود والخزانات تخزن المياه، والري الحديث بالتنقيط يوفرها.' },
    { text: 'ندرة المياه العذبة في المنطقة', scene: 'scarce', ok: ['desal', 'sewage'], why: 'تحلية مياه البحر ومعالجة مياه الصرف توفران مصادر مياه جديدة.' },
    { text: 'التغيرات المناخية تقتل المحصول', scene: 'climate', ok: ['seeds'], why: 'البذور المقاومة للتغيرات المناخية تتحمل الظروف الجديدة.' },
    { text: 'الزحف العمراني أكل جزءًا من الأرض الزراعية', scene: 'sprawl', ok: ['reclaim', 'future'], why: 'استصلاح الصحراء يعوض الأرض المفقودة، ومشروع مستقبل مصر يستصلح أكثر من مليون فدان.' },
    { text: 'مياه الصرف تلوث الأرض والمياه', scene: 'pollution', ok: ['sewage'], why: 'معالجة مياه الصرف تقلل التلوث وتعيد استخدام المياه.' },
    { text: 'الدولة تريد توسيع الرقعة الزراعية وتأمين الغذاء', scene: 'food', ok: ['future', 'reclaim'], why: 'مشروع مستقبل مصر جزء من الدلتا الجديدة ويستصلح أكثر من مليون فدان بالري الحديث والطاقة النظيفة.' },
];
const SECS = 15;

/** The backdrop that shows the current problem. */
function Backdrop({ scene }: { scene: Scene }) {
    switch (scene) {
        case 'drought': return <><div className="sc-a"><Sun size={64} hot /></div><div className="sc-cracks" /></>;
        case 'scarce': return <><div className="sc-a"><Sun size={54} /></div><div className="sc-pond" /></>;
        case 'climate': return <><div className="sc-a ag-cloud-a"><Cloud width={96} dark /></div><div className="sc-b ag-cloud-b"><Cloud width={70} dark /></div><div className="sc-bolt" /></>;
        case 'sprawl': return <div className="sc-city">{[26, 40, 32, 48, 30].map((h, i) => <i key={i} style={{ height: h }} />)}</div>;
        case 'pollution': return <><div className="sc-a ag-cloud-a"><Cloud width={90} dark /></div><div className="sc-sludge" /></>;
        default: return <><div className="sc-a"><Sun size={54} /></div><div className="sc-barn"><Barn size={64} /></div></>;
    }
}

export function FarmGame({ onDone }: { onDone: (r: Result) => void }) {
    const startDrag = useDrag();
    const fx = useFx();
    const probs = useMemo(() => shuffle(PROBLEMS), []);
    const [season, setSeason] = useState(0);
    const [plots, setPlots] = useState<number[]>(probs.map(() => 0));
    const [result, setResult] = useState<null | { ok: boolean; water: boolean }>(null);
    const [note, setNote] = useState<Note | null>(null);
    const [left, setLeft] = useState(SECS);
    const [good, setGood] = useState(0);
    const [harvest, setHarvest] = useState(false);
    const noteId = useRef(1);
    const resolved = useRef(false);
    const scene = useRef<HTMLDivElement>(null);
    const p = probs[season];

    const options = useMemo(() => {
        if (!p) return [] as Key[];
        const wrongs = shuffle((Object.keys(SOL) as Key[]).filter((k) => !p.ok.includes(k))).slice(0, 3);
        return shuffle([p.ok[0], ...wrongs]);
    }, [season]);

    useEffect(() => {
        if (result || harvest) return;
        const t = window.setInterval(() => setLeft((l) => l - 1), 1000);
        return () => window.clearInterval(t);
    }, [result, harvest, season]);
    useEffect(() => {
        if (result || harvest) return;
        if (left <= 0) resolve(null);
        else if (left <= 5) sound.play('tick');
    }, [left]);

    const resolve = (k: Key | null) => {
        if (resolved.current) return;
        resolved.current = true;
        const ok = k !== null && p.ok.includes(k);
        const water = k !== null && WATER.includes(k);
        setPlots((old) => old.map((s, i) => (i === season ? (ok ? 3 : 1) : s)));
        if (ok) {
            setGood((g) => g + 1);
            sound.play('ok');
            fx.burstAt(scene.current, water ? 'splash' : 'leaf', 22);
            wait(250, () => fx.burstAt(scene.current, 'sparkle', 16));
            fx.textAt(scene.current, 'المحصول نجح!', '#1f6b37');
        } else {
            sound.play('bad'); fx.shake();
            fx.burstAt(scene.current, 'dust', 16);
        }
        setResult({ ok, water });
        setNote({
            id: noteId.current++, ok,
            title: ok ? `المحصول نجح (${SOL[k!]})` : k === null ? 'الوقت خلص والمحصول ضاع' : `المحصول تضرر (${SOL[k]})`,
            text: ok ? p.why : `الحل المناسب: ${p.ok.map((x) => SOL[x]).join(' أو ')}. ${p.why}`,
        });
    };

    const next = () => {
        if (season + 1 >= probs.length) {
            setHarvest(true);
            const stars = good >= 6 ? 3 : good >= 4 ? 2 : good >= 2 ? 1 : 0;
            if (good > 0) { sound.play('win'); fx.confettiRain(60); wait(300, () => fx.burstAt(scene.current, 'coin', 24)); }
            wait(2000, () => onDone({ stars, score: good, total: probs.length }));
            return;
        }
        sound.play('whoosh');
        resolved.current = false; setResult(null); setNote(null); setLeft(SECS); setSeason(season + 1);
    };

    const mood: Mood = harvest ? 'cheer' : result ? (result.ok ? 'happy' : 'sad') : left <= 5 ? 'think' : 'idle';
    const danger = left <= 5 && !result;
    return <div>
        <p className="ag-intro">اسحب الحل المناسب للمشكلة وحطه على المزرعة قبل ما الوقت يخلص.</p>
        <div className="ag-top">
            <div className="ag-stat">الموسم <b>{AR(Math.min(season + 1, probs.length))}</b> / {AR(probs.length)}</div>
            <div className="ag-stat">محصول <b>{AR(good)}</b></div>
            <div className={`ag-stat${danger ? ' ag-danger' : ''}`}>{AR(Math.max(0, left))} ث</div>
        </div>
        <div className="ag-bar"><div className={danger ? 'ag-bar-hot' : ''} style={{ width: `${(Math.max(0, left) / SECS) * 100}%` }} /></div>
        <div className="ag-prob" key={season}><Warn size={40} /><strong>{p.text}</strong></div>
        <div ref={scene} data-drop="farm" className={`ag-scene sc-${p.scene}${result ? (result.ok ? ' ag-scene-ok' : ' ag-scene-no') : ''}`}>
            <Backdrop scene={p.scene} />
            {result && result.ok && result.water && <div className="ag-rain">{Array.from({ length: 16 }, (_, i) => <span key={i} style={{ right: `${3 + i * 6}%`, animationDelay: `${(i % 5) * 120}ms` }} />)}</div>}
            <div className="ag-plots">
                {plots.map((s, i) => <div key={`${i}-${s}`} className={`ag-plot${s === 3 ? ' ag-grow' : ''}${harvest && s === 3 ? ' ag-harvest' : ''}`}><Plot state={s} size={50} /></div>)}
            </div>
            <div className="ag-walker" style={{ right: `${((season + 0.5) / probs.length) * 100}%` }}><Farmer mood={mood} size={56} /></div>
            {!result && <div className="ag-drophere">اسحب الحل هنا</div>}
        </div>
        {!result && !harvest && <div className="ag-sols">
            {options.map((k) => <div key={k} role="button" tabIndex={0} className="ag-sol"
                onPointerDown={(e) => startDrag(e, SOL[k], (t) => { if (t === 'farm') resolve(k); }, () => resolve(k))}>{SOL[k]}</div>)}
        </div>}
        {(result || harvest) && <>
            <Coach note={note} idle="" />
            {result && !harvest && <button type="button" className="ag-btn ag-primary ag-nextbtn" onClick={next}>{season + 1 >= probs.length ? 'الحصاد!' : 'الموسم التالي'}</button>}
            {harvest && <div className="ag-harvest-banner">وقت الحصاد! {AR(good)} من {AR(probs.length)} مواسم نجحت</div>}
        </>}
    </div>;
}
