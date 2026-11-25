import React, { useState } from 'react';
import { DragProvider } from './drag';
import { SortGame, AR, type Bucket, type Chip, type Result } from './SortGame';
import { CropGame } from './CropGame';
import { FarmGame } from './FarmGame';
import { Cane, Cotton, Leaf, Lock, Plot, Rain, River, Star, Underground, Warn, Wheat, Worker } from './icons';

const WATER_BUCKETS: Bucket[] = [
    { id: 'river', label: 'أنهار', icon: <River size={40} />, color: '#2a8fd0' },
    { id: 'ground', label: 'مياه جوفية', icon: <Underground size={40} />, color: '#b07a2b' },
    { id: 'rain', label: 'أمطار', icon: <Rain size={40} />, color: '#6a7f99' },
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
    { id: 'nat', label: 'مقومات طبيعية', icon: <Leaf size={40} />, color: '#2f8f4e' },
    { id: 'hum', label: 'مقومات بشرية', icon: <Worker size={40} />, color: '#d9822b' },
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

const LEVELS = [
    { id: 1, title: 'مصادر المياه', sub: 'وزّع الأماكن على مصدر مياهها', icon: <River size={46} /> },
    { id: 2, title: 'مقومات الزراعة', sub: 'طبيعية ولا بشرية؟ ومعاك ٥٠ ثانية', icon: <Leaf size={46} /> },
    { id: 3, title: 'سوق المحاصيل', sub: 'كروت نازلة بسرعة، صنفها قبل الأرض', icon: <Wheat size={46} /> },
    { id: 4, title: 'مزرعة المشكلات', sub: 'اختار الحل وانقذ المحصول', icon: <Warn size={46} /> },
];

export function App() {
    const [level, setLevel] = useState<number | null>(null);
    const [attempt, setAttempt] = useState(0);
    const [stars, setStars] = useState<Record<number, number>>({});
    const [res, setRes] = useState<Result | null>(null);

    const unlocked = (id: number) => id === 1 || (stars[id - 1] ?? 0) >= 1;
    const total = Object.values(stars).reduce((a, b) => a + b, 0);
    const open = (id: number) => { setRes(null); setAttempt((a) => a + 1); setLevel(id); };
    const done = (r: Result) => { setRes(r); setStars((s) => ({ ...s, [level!]: Math.max(s[level!] ?? 0, r.stars) })); };
    const home = () => { setLevel(null); setRes(null); };

    return <div className="ag-card">
        <DragProvider>
            <div dir="rtl" className="ag-root">
                {level === null && <div>
                    <div className="ag-hero">
                        <div className="ag-hero-plants"><Plot state={3} size={64} /><Plot state={3} size={64} /><Plot state={2} size={64} /></div>
                        <h1>مزرعة مستر جاد</h1>
                        <p>النشاط الزراعي في وطننا العربي: ٤ مراحل، العب واكسب نجوم</p>
                        <div className="ag-total"><Star size={26} /> {AR(total)} من {AR(12)}</div>
                    </div>
                    <div className="ag-levels">
                        {LEVELS.map((l) => {
                            const ok = unlocked(l.id);
                            return <button type="button" key={l.id} disabled={!ok} className={`ag-level${ok ? '' : ' ag-locked'}`} onClick={() => open(l.id)}>
                                {ok ? l.icon : <Lock size={46} />}
                                <span className="ag-ltxt"><b>المرحلة {AR(l.id)}: {l.title}</b><small>{ok ? l.sub : 'خد نجمة في المرحلة السابقة عشان تفتحها'}</small></span>
                                <span className="ag-lstars">{[0, 1, 2].map((k) => <Star key={k} on={k < (stars[l.id] ?? 0)} size={20} />)}</span>
                            </button>;
                        })}
                    </div>
                    <p className="ag-small">إعداد أ. محمد جمال جاد، مهندس الدراسات الاجتماعية</p>
                </div>}

                {level !== null && <div>
                    <div className="ag-nav"><button type="button" className="ag-back" onClick={home}>القائمة</button><b>المرحلة {AR(level)}: {LEVELS[level - 1].title}</b></div>
                    {!res && <div key={`${level}-${attempt}`}>
                        {level === 1 && <SortGame intro="اسحب كل مكان إلى مصدر المياه اللي بتعتمد عليه الزراعة فيه." buckets={WATER_BUCKETS} chips={WATER_CHIPS} onDone={done} />}
                        {level === 2 && <SortGame intro="كل عنصر إما مقوم طبيعي أو بشري. الوقت بيعد!" buckets={REQ_BUCKETS} chips={REQ_CHIPS} seconds={50} onDone={done} />}
                        {level === 3 && <CropGame onDone={done} />}
                        {level === 4 && <FarmGame onDone={done} />}
                    </div>}
                    {res && <div className="ag-center ag-result">
                        <div className="ag-stars">{[0, 1, 2].map((k) => <Star key={k} on={k < res.stars} size={60} />)}</div>
                        <h2 className="ag-score">{res.timeout ? 'الوقت خلص' : res.stars === 0 ? 'محتاج محاولة تانية' : res.stars === 3 ? 'ممتاز يا مزارع!' : 'كويس، تقدر تحصل على أحسن'}</h2>
                        <p className="ag-msg">{AR(res.score)} من {AR(res.total)}</p>
                        {res.stars >= 1 && level < 4 && <button type="button" className="ag-btn ag-primary" onClick={() => open(level + 1)}>المرحلة التالية</button>}
                        {res.stars >= 1 && level === 4 && <button type="button" className="ag-btn ag-primary" onClick={home}>شوف نجومك</button>}
                        <button type="button" className="ag-btn ag-secondary" onClick={() => open(level)}>العب المرحلة تاني</button>
                        <button type="button" className="ag-btn ag-secondary" onClick={home}>القائمة</button>
                    </div>}
                </div>}
            </div>
        </DragProvider>
    </div>;
}
