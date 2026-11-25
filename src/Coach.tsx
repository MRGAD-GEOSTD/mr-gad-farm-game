import React, { useEffect, useState } from 'react';
import { Farmer, type Mood } from './art';

export type Note = { id: number; ok: boolean; title: string; text: string };

/**
 * The farmer at the bottom of a level. He reacts to the latest answer
 * (happy or sad for a moment) and explains it in a speech bubble.
 */
export function Coach({ note, idle }: { note: Note | null; idle: string }) {
    const [calm, setCalm] = useState(true);
    useEffect(() => {
        if (!note) return;
        setCalm(false);
        const t = window.setTimeout(() => setCalm(true), 1700);
        return () => window.clearTimeout(t);
    }, [note?.id]);
    const mood: Mood = !note || calm ? 'idle' : note.ok ? 'happy' : 'sad';
    return <div className="ag-coach">
        <Farmer mood={mood} size={58} />
        <div key={note?.id ?? 0} className={`ag-bubble ${note ? (note.ok ? 'ag-bubble-ok' : 'ag-bubble-no') : ''}`} role="status">
            {note ? <><strong>{note.title}</strong><p>{note.text}</p></> : <p>{idle}</p>}
        </div>
    </div>;
}
