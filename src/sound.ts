import { useSyncExternalStore } from 'react';

/**
 * Tiny sound engine built on the Web Audio API: no audio files, every effect
 * is a few oscillator notes. The on/off choice is remembered on the device.
 */
export type SoundName = 'ok' | 'bad' | 'pop' | 'win' | 'lose' | 'tick' | 'coin' | 'whoosh' | 'combo';

const KEY = 'ag-sound';
const listeners = new Set<() => void>();
let ctx: AudioContext | null = null;
let enabled = readPref();

function readPref(): boolean {
    try { return localStorage.getItem(KEY) !== 'off'; } catch { return true; }
}

function audio(): AudioContext | null {
    if (!ctx) {
        const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Ctor) return null;
        ctx = new Ctor();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
}

/** One note: frequency, start time (s), length (s), wave shape, volume, optional glide target. */
function note(c: AudioContext, freq: number, at: number, len: number, type: OscillatorType = 'sine', vol = 0.09, glideTo?: number) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, at);
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, at + len);
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(vol, at + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + len);
    osc.connect(gain).connect(c.destination);
    osc.start(at);
    osc.stop(at + len + 0.02);
}

const RECIPES: Record<SoundName, (c: AudioContext, t: number) => void> = {
    ok: (c, t) => { note(c, 660, t, 0.12, 'triangle'); note(c, 880, t + 0.08, 0.18, 'triangle'); },
    bad: (c, t) => { note(c, 220, t, 0.25, 'sawtooth', 0.07, 130); },
    pop: (c, t) => { note(c, 520, t, 0.09, 'sine', 0.08, 780); },
    tick: (c, t) => { note(c, 1000, t, 0.04, 'square', 0.03); },
    coin: (c, t) => { note(c, 988, t, 0.08, 'square', 0.05); note(c, 1319, t + 0.07, 0.25, 'square', 0.05); },
    whoosh: (c, t) => { note(c, 300, t, 0.2, 'sine', 0.05, 900); },
    combo: (c, t) => { [523, 659, 784, 1047].forEach((f, i) => note(c, f, t + i * 0.06, 0.16, 'triangle', 0.08)); },
    win: (c, t) => { [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => note(c, f, t + i * 0.11, 0.22, 'triangle', 0.09)); },
    lose: (c, t) => { [392, 349, 311, 262].forEach((f, i) => note(c, f, t + i * 0.16, 0.26, 'sine', 0.09)); },
};

export const sound = {
    get enabled() { return enabled; },
    play(name: SoundName) {
        if (!enabled) return;
        const c = audio();
        if (c) RECIPES[name](c, c.currentTime);
    },
    toggle() {
        enabled = !enabled;
        try { localStorage.setItem(KEY, enabled ? 'on' : 'off'); } catch { /* private mode */ }
        listeners.forEach((l) => l());
        if (enabled) sound.play('pop');
    },
    subscribe(l: () => void) { listeners.add(l); return () => { listeners.delete(l); }; },
};

export const useSoundOn = () => useSyncExternalStore(sound.subscribe, () => enabled);
