import React, { useEffect, useState } from 'react';
import { DragProvider } from './drag';
import { FxProvider, useFx } from './fx';
import { sound, useSoundOn } from './sound';
import { SortGame, type Bucket, type Chip } from './SortGame';
import { CropGame } from './CropGame';
import { FarmGame } from './FarmGame';
import { WorldMap, type LevelInfo } from './WorldMap';
import { Farmer, Speaker, Trophy, type Mood } from './art';
import { Leaf, Rain, River, Star, Underground, Warn, Wheat, Worker } from './icons';
import { AR, type Result } from './common';

const WATER_BUCKETS: Bucket[] = [
    { id: 'river', label: 'أنهار', icon: <River size={40} />, color: '#2a8fd0', fx: 'splash' },
    { id: 'ground', label: 'مياه جوفية', icon: <Underground size={40} />, color: '#b07a2b', fx: 'dust' },
    { id: 'rain', label: 'أمطار', icon: <Rain size={40} />, color: '#6a7f99', fx: 'splash' },
];
const WATER_CHIPS: Chip[] = [
    { id: 'nile', label: 'نهر النيل', bucket: 'river', why: 'نهر النيل في مصر والسودان.' },
    { id: 'df', label: 'دجلة والفرات', bucket: 'river', why: 'نهرا دجلة والفرات في العراق.' },
    { id: 'oasis', label: 'الواحات', bucket: 'ground', why: 'الزراعة في الواحات تعتمد على المياه الجوفية.' },
    { id: 'maghreb', label: 'بلاد المغرب', bucket: 'rain', why: 'الزراعة في بلاد المغرب تعتمد على مياه الأمطار.' },
    { id: 'leb', label: 'لبنان', bucket: 'rain', why: 'الزراعة في لبنان تعتمد على مياه الأمطار.' },
    { id: 'sudan', label: 'السودان (سهول النيل)', bucket: 'river', why: 'سهول النيل في مصر والسودان.' },
];
const REQ_BUCKETS: Bucket[] = [
    { id: 'nat', label: 'مقومات طبيعية', icon: <Leaf size={40} />, color: '#2f8f4e', fx: 'leaf' },
    { id: 'hum', label: 'مقومات بشرية', icon: <Worker size={40} />, color: '#d9822b', fx: 'sparkle' },
];
const REQ_CHIPS: Chip[] = [
    { id: 'soil', label: 'التربة الخصبة', bucket: 'nat', why: 'التربة الطينية الخصبة مقوم طبيعي.' },
    { id: 'clim', label: 'تنوع المناخ', bucket: 'nat', why: 'تنوع المناخ أدى إلى تنوع المحاصيل.' },
    { id: 'water', label: 'المياه العذبة', bucket: 'nat', why: 'الأنهار والمياه الجوفية والأمطار مقومات طبيعية.' },
    { id: 'labor', label: 'الأيدي العاملة المدربة', bucket: 'hum', why: 'ثروة بشرية مدربة على الأساليب الحديثة.' },
    { id: 'cap', label: 'رأس المال', bucket: 'hum', why: 'لشراء البذور والأسمدة والآلات.' },
    { id: 'trans', label: 'وسائل النقل', bucket: 'hum', why: 'تنقل المحاصيل إلى الأسواق قبل أن تتلف.' },
    { id: 'market', label: 'السوق', bucket: 'hum', why: 'لبيع المنتجات، فيزيد الإنتاج الزراعي.' },
];

const LEVELS: (LevelInfo & { how: string })[] = [
    { id: 1, title: 'مصادر المياه', sub: 'وزّع الأماكن على مصدر مياهها', how: 'اسحب كل مكان إلى مصدر المياه اللي بتعتمد عليه الزراعة فيه. كل ٣ إجابات صح ورا بعض بتعمل سلسلة!', icon: <River size={46} /> },
    { id: 2, title: 'مقومات الزراعة', sub: 'طبيعية ولا بشرية؟', how: 'معاك ٥٠ ثانية. الغلطة بتاخد ٤ ثواني، وكل ٣ إجابات صح بتديك ٣ ثواني زيادة.', icon: <Leaf size={46} /> },
    { id: 3, title: 'سوق المحاصيل', sub: 'كروت نازلة، صنفها قبل الأرض', how: 'الكروت بتنزل في ٣ حارات. صنفها قبل ما توصل الأرض، وصطاد النجمة الذهبية عشان تبطّئ الوقت. معاك ٣ قلوب.', icon: <Wheat size={46} /> },
    { id: 4, title: 'مزرعة المشكلات', sub: 'اختار الحل وانقذ المحصول', how: 'كل موسم ليه مشكلة. اسحب الحل المناسب على المزرعة قبل ١٥ ثانية، وشوف المحصول يكبر.', icon: <Warn size={46} /> },
];
const KEY = 'ag-stars';
const loadStars = (): Record<number, number> => { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } };

function SoundButton() {
    const on = useSoundOn();
    return <button type="button" className="ag-icon-btn" onClick={() => sound.toggle()} aria-label={on ? 'إيقاف الصوت' : 'تشغيل الصوت'}><Speaker on={on} /></button>;
}

type Phase = 'intro' | 'play' | 'result';

function Game() {
    const fx = useFx();
    const [level, setLevel] = useState<number | null>(null);
    const [phase, setPhase] = useState<Phase>('intro');
    const [attempt, setAttempt] = useState(0);
    const [stars, setStars] = useState<Record<number, number>>(loadStars);
    const [res, setRes] = useState<Result | null>(null);

    useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(stars)); } catch { /* ignore */ } }, [stars]);
    const unlocked = (id: number) => id === 1 || (stars[id - 1] ?? 0) >= 1;
    const total = Object.values(stars).reduce((a, b) => a + b, 0);
    const current = LEVELS.filter((l) => unlocked(l.id) && (stars[l.id] ?? 0) === 0).map((l) => l.id)[0] ?? 4;
    const open = (id: number) => { sound.play('whoosh'); setRes(null); setAttempt((a) => a + 1); setPhase('intro'); setLevel(id); };
    const done = (r: Result) => {
        setRes(r); setPhase('result');
        setStars((s) => ({ ...s, [level!]: Math.max(s[level!] ?? 0, r.stars) }));
        if (r.stars >= 1) { window.setTimeout(() => sound.play('coin'), 500); }
    };
    const home = () => { setLevel(null); setRes(null); };
    const info = level ? LEVELS[level - 1] : null;
    const allDone = LEVELS.every((l) => (stars[l.id] ?? 0) >= 1);

    return <div dir="rtl" className="ag-root">
        {level === null && <div className="ag-screen" key="home">
            <div className="ag-hero">
                <div className="ag-hero-row">
                    <Farmer mood="happy" size={62} />
                    <div className="ag-hero-txt"><h1>مزرعة مستر جاد</h1><p>النشاط الزراعي في وطننا العربي</p></div>
                    <SoundButton />
                </div>
                <div className="ag-total"><Star size={26} /> {AR(total)} من {AR(12)}</div>
            </div>
            <WorldMap levels={LEVELS} stars={stars} current={current} onOpen={open} />
            {allDone && <div className="ag-trophy"><Trophy size={56} /><b>مزارع محترف! خلصت كل المراحل</b></div>}
            <p className="ag-small">إعداد أ. محمد جمال جاد، مهندس الدراسات الاجتماعية</p>
        </div>}

        {level !== null && info && <div className="ag-screen" key={`${level}-${attempt}-${phase === 'intro' ? 'i' : 'g'}`}>
            <div className="ag-nav">
                <button type="button" className="ag-back" onClick={home}>الخريطة</button>
                <b className="ag-nav-title">المرحلة {AR(level)}: {info.title}</b>
                <SoundButton />
            </div>
            {phase === 'intro' && <div className="ag-center ag-intro-card">
                <div className="ag-intro-icon">{info.icon}</div>
                <h2>المرحلة {AR(level)}</h2>
                <h3>{info.title}</h3>
                <div className="ag-coach"><Farmer mood="think" size={58} /><div className="ag-bubble"><p>{info.how}</p></div></div>
                <button type="button" className="ag-btn ag-primary" onClick={() => { sound.play('pop'); setPhase('play'); }}>يلا نبدأ</button>
            </div>}
            {phase === 'play' && <div>
                {level === 1 && <SortGame intro="اسحب كل مكان إلى مصدر المياه اللي بتعتمد عليه الزراعة فيه." buckets={WATER_BUCKETS} chips={WATER_CHIPS} onDone={done} />}
                {level === 2 && <SortGame intro="كل عنصر إما مقوم طبيعي أو بشري. الوقت بيعد!" buckets={REQ_BUCKETS} chips={REQ_CHIPS} seconds={50} penalty={4} onDone={done} />}
                {level === 3 && <CropGame onDone={done} />}
                {level === 4 && <FarmGame onDone={done} />}
            </div>}
            {phase === 'result' && res && <Results res={res} level={level} onNext={() => open(level + 1)} onRetry={() => open(level)} onHome={home} fx={fx} />}
        </div>}
    </div>;
}

function Results({ res, level, onNext, onRetry, onHome, fx }: { res: Result; level: number; onNext: () => void; onRetry: () => void; onHome: () => void; fx: ReturnType<typeof useFx> }) {
    useEffect(() => {
        const timers = [0, 1, 2].filter((k) => k < res.stars).map((k) => window.setTimeout(() => { sound.play('coin'); fx.burst(window.innerWidth / 2 + (1 - k) * 70, 150, 'sparkle', 12); }, 350 + k * 380));
        return () => timers.forEach((t) => window.clearTimeout(t));
    }, []);
    const mood: Mood = res.stars >= 2 ? 'cheer' : res.stars === 1 ? 'happy' : 'sad';
    return <div className="ag-center ag-result">
        <div className="ag-stars">{[0, 1, 2].map((k) => <span key={k} className={k < res.stars ? 'ag-star-pop' : ''} style={{ animationDelay: `${350 + k * 380}ms` }}><Star on={k < res.stars} size={64} /></span>)}</div>
        <Farmer mood={mood} size={84} />
        <h2 className="ag-score">{res.timeout ? 'الوقت خلص' : res.stars === 0 ? 'محتاج محاولة تانية' : res.stars === 3 ? 'ممتاز يا مزارع!' : 'كويس، تقدر تحصل على أحسن'}</h2>
        <p className="ag-msg">{AR(res.score)} من {AR(res.total)}</p>
        {res.stars >= 1 && level < 4 && <button type="button" className="ag-btn ag-primary" onClick={onNext}>المرحلة التالية</button>}
        {res.stars >= 1 && level === 4 && <button type="button" className="ag-btn ag-primary" onClick={onHome}>شوف نجومك على الخريطة</button>}
        <button type="button" className="ag-btn ag-secondary" onClick={onRetry}>العب المرحلة تاني</button>
        <button type="button" className="ag-btn ag-secondary" onClick={onHome}>الخريطة</button>
    </div>;
}

export function App() {
    return <FxProvider><DragProvider><Game /></DragProvider></FxProvider>;
}
