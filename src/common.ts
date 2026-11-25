/** Small helpers shared by every level. */
export type Result = { stars: number; score: number; total: number; timeout?: boolean };

/** Western digits to Arabic-Indic digits, so scores read naturally in Arabic. */
export const AR = (n: number) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);

export function shuffle<T>(list: T[]): T[] {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

export const wait = (ms: number, fn: () => void) => window.setTimeout(fn, ms);
