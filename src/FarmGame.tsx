import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDrag } from './drag';
import { Plot, Warn } from './icons';
import { AR, type Result } from './SortGame';

const SOL = {
    desal: 'تحلية مياه البحر', reclaim: 'استصلاح الأراضي الصحراوية', sewage: 'معالجة مياه الصرف',
    dams: 'بناء السدود والخزانات', drip: 'الري بالتنقيط', seeds: 'بذور مقاومة للتغيرات المناخية', future: 'مشروع مستقبل مصر للزراعة المستدامة',
} as const;
type Key = keyof typeof SOL;
const PROBLEMS: { text: string; ok: Key[]; why: string }[] = [
    { text: 'قلة الأمطار هذا الموسم، والمحصول يحتاج ماء', ok: ['dams', 'drip'], why: 'السدود والخزانات تخزن المياه، والري الحديث بالتنقيط يوفرها.' },
    { text: 'ندرة المياه العذبة في المنطقة', ok: ['desal', 'sewage'], why: 'تحلية مياه البحر ومعالجة مياه الصرف توفران مصادر مياه جديدة.' },
    { text: 'التغيرات المناخية تقتل المحصول', ok: ['seeds'], why: 'البذور المقاومة للتغيرات المناخية تتحمل الظروف الجديدة.' },
    { text: 'الزحف العمراني أكل جزءًا من الأرض الزراعية', ok: ['reclaim', 'future'], why: 'استصلاح الصحراء يعوض الأرض المفقودة، ومشروع مستقبل مصر يستصلح أكثر من مليون فدان.' },
    { text: 'مياه الصرف تلوث الأرض والمياه', ok: ['sewage'], why: 'معالجة مياه الصرف تقلل التلوث وتعيد استخدام المياه.' },
    { text: 'الدولة تريد توسيع الرقعة الزراعية وتأمين الغذاء', ok: ['future', 'reclaim'], why: 'مشروع مستقبل مصر جزء من الدلتا الجديدة ويستصلح أكثر من مليون فدان بالري الحديث والطاقة النظيفة.' },
];
function shuffle<T>(a: T[]): T[] { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
const SECS = 15;

export function FarmGame({ onDone }: { onDone: (r: Result) => void }) {
    const startDrag = useDrag();
    const probs = useMemo(() => shuffle(PROBLEMS), []);
    const [season, setSeason] = useState(0);
    const [plots, setPlots] = useState<number[]>([0, 0, 0, 0, 0, 0]);
    const [result, setResult] = useState<null | { ok: boolean; text: string; picked: string | null }>(null);
    const [left, setLeft] = useState(SECS);
    const [good, setGood] = useState(0);
    const [over, setOver] = useState(false);
    const resolved = useRef(false);
    const p = probs[season];
    const options = useMemo(() => {
        if (!p) return [] as Key[];
        const wrongs = shuffle((Object.keys(SOL) as Key[]).filter((k) => !p.ok.includes(k))).slice(0, 4 - 1);
        return shuffle([p.ok[0], ...wrongs]);
    }, [season]);

    useEffect(() => {
        if (result || over) return;
        const t = setInterval(() => setLeft((l) => l - 1), 1000);
        return () => clearInterval(t);
    }, [result, over, season]);
    useEffect(() => { if (!result && !over && left <= 0) resolve(null); }, [left]);

    const resolve = (k: Key | null) => {
        if (resolved.current) return; resolved.current = true;
        const ok = k !== null && p.ok.includes(k);
        const np = plots.slice(); np[season] = ok ? 3 : 1; setPlots(np);
        if (ok) setGood(good + 1);
        setResult({ ok, picked: k ? SOL[k] : null, text: k === null ? `الوقت خلص والمحصول ضاع. ${p.why}` : ok ? p.why : `مش مناسب لهذه المشكلة. ${p.why}` });
    };
    const next = () => {
        if (season + 1 >= probs.length) {
            setOver(true);
            const stars = good >= 6 ? 3 : good >= 4 ? 2 : good >= 2 ? 1 : 0;
            onDone({ stars, score: good, total: probs.length });
            return;
        }
        resolved.current = false; setResult(null); setLeft(SECS); setSeason(season + 1);
    };

    if (over || !p) return null;
    return <div>
        <p className="ag-intro">اسحب الحل المناسب للمشكلة وحطه على المزرعة قبل ما الوقت يخلص.</p>
        <div className="ag-top">
            <div className="ag-stat">الموسم <b>{AR(season + 1)}</b> / {AR(probs.length)}</div>
            <div className="ag-stat">محصول <b>{AR(good)}</b></div>
            <div className={`ag-stat${left <= 5 && !result ? ' ag-danger' : ''}`}>{AR(Math.max(0, left))} ث</div>
        </div>
        <div className="ag-bar"><div style={{ width: `${(Math.max(0, left) / SECS) * 100}%`, transition: 'width 1s linear' }} /></div>
        <div className="ag-prob"><Warn size={40} /><strong>{p.text}</strong></div>
        <div data-drop="farm" className={`ag-farm${result ? (result.ok ? ' ag-farm-ok' : ' ag-farm-no') : ''}`}>
            {plots.map((s, i) => <div key={i} className={`ag-plot${i === season ? ' ag-cur' : ''}`}><Plot state={s} size={50} /></div>)}
            {!result && <div className="ag-drophere">اسحب الحل هنا</div>}
        </div>
        {!result && <div className="ag-sols">
            {options.map((k) => <div key={k} role="button" tabIndex={0} className="ag-sol"
                onPointerDown={(e) => startDrag(e, SOL[k], (t) => { if (t === 'farm') resolve(k); }, () => resolve(k))}>{SOL[k]}</div>)}
        </div>}
        {result && <div className={`ag-fb ${result.ok ? 'ag-fb-ok' : 'ag-fb-no'}`} role="status">
            <strong>{result.ok ? 'المحصول نجح' : 'المحصول تضرر'}{result.picked ? ` (${result.picked})` : ''}</strong>
            <p>{result.text}</p>
            <button type="button" className="ag-btn ag-primary" onClick={next}>{season + 1 >= probs.length ? 'شوف النتيجة' : 'الموسم التالي'}</button>
        </div>}
    </div>;
}
