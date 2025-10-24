// ISO 2859-1 Z1.4 single sampling plan for General Level II
const LOT_TO_CODE = [
  { min: 2, max: 8, code: 'A' },
  { min: 9, max: 15, code: 'B' },
  { min: 16, max: 25, code: 'C' },
  { min: 26, max: 50, code: 'D' },
  { min: 51, max: 90, code: 'E' },
  { min: 91, max: 150, code: 'F' },
  { min: 151, max: 280, code: 'G' },
  { min: 281, max: 500, code: 'H' },
  { min: 501, max: 1200, code: 'J' },
  { min: 1201, max: 3200, code: 'K' },
  { min: 3201, max: 10000, code: 'L' },
  { min: 10001, max: 35000, code: 'M' },
  { min: 35001, max: 150000, code: 'N' },
  { min: 150001, max: 500000, code: 'P' },
  { min: 500001, max: Infinity, code: 'Q' },
];

const PLAN = {
  '1.0%': {
    A: { n: 2, Ac: 0, Re: 1 }, B: { n: 3, Ac: 0, Re: 1 }, C: { n: 5, Ac: 0, Re: 1 },
    D: { n: 8, Ac: 0, Re: 1 }, E: { n: 13, Ac: 0, Re: 1 }, F: { n: 20, Ac: 0, Re: 1 },
    G: { n: 32, Ac: 1, Re: 2 }, H: { n: 50, Ac: 1, Re: 2 }, J: { n: 80, Ac: 2, Re: 3 },
    K: { n: 125, Ac: 3, Re: 4 }, L: { n: 200, Ac: 5, Re: 6 }, M: { n: 315, Ac: 7, Re: 8 },
    N: { n: 500, Ac: 10, Re: 11 }, P: { n: 800, Ac: 14, Re: 15 }, Q: { n: 1250, Ac: 21, Re: 22 },
  },
  '2.5%': {
    A: { n: 2, Ac: 0, Re: 1 }, B: { n: 3, Ac: 0, Re: 1 }, C: { n: 5, Ac: 0, Re: 1 },
    D: { n: 8, Ac: 0, Re: 1 }, E: { n: 13, Ac: 1, Re: 2 }, F: { n: 20, Ac: 1, Re: 2 },
    G: { n: 32, Ac: 2, Re: 3 }, H: { n: 50, Ac: 3, Re: 4 }, J: { n: 80, Ac: 5, Re: 6 },
    K: { n: 125, Ac: 7, Re: 8 }, L: { n: 200, Ac: 10, Re: 11 }, M: { n: 315, Ac: 14, Re: 15 },
    N: { n: 500, Ac: 21, Re: 22 }, P: { n: 800, Ac: 21, Re: 22 }, Q: { n: 1250, Ac: 21, Re: 22 },
  },
  '4.0%': {
    A: { n: 2, Ac: 0, Re: 1 }, B: { n: 3, Ac: 0, Re: 1 }, C: { n: 5, Ac: 0, Re: 1 },
    D: { n: 8, Ac: 1, Re: 2 }, E: { n: 13, Ac: 1, Re: 2 }, F: { n: 20, Ac: 2, Re: 3 },
    G: { n: 32, Ac: 3, Re: 4 }, H: { n: 50, Ac: 5, Re: 6 }, J: { n: 80, Ac: 7, Re: 8 },
    K: { n: 125, Ac: 10, Re: 11 }, L: { n: 200, Ac: 14, Re: 15 }, M: { n: 315, Ac: 21, Re: 22 },
    N: { n: 500, Ac: 21, Re: 22 }, P: { n: 800, Ac: 21, Re: 22 }, Q: { n: 1250, Ac: 21, Re: 22 },
  }
};

export function getCodeLetter(lot) {
  const n = Number(lot);
  if (!Number.isFinite(n) || n < 2) return null;
  const row = LOT_TO_CODE.find(r => n >= r.min && n <= r.max);
  return row?.code || null;
}

export function getPlan(code, aql) {
  return PLAN[aql]?.[code] || null;
}

export function decide(found, Ac, Re) {
  const f = Number(found);
  if (isNaN(f)) return '';
  if (f <= Ac) return 'ACCEPT';
  if (f >= Re) return 'REJECT';
  return 'REVIEW';
}

export function needsFullInspection(n, lot) {
  return Number(n) >= Number(lot);
}

export function computeLotSize({ boxes, pcsPerBox }) {
  const b = parseInt(boxes, 10);
  const p = parseInt(pcsPerBox, 10);
  if (!Number.isFinite(b) || !Number.isFinite(p) || b <= 0 || p <= 0) return null;
  return b * p;
}