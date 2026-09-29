/**
 * Layout rules shared by the Social Proof ribbon in the CMS list and its live preview.
 *
 * The preview must match what the public website renders, so both use this module rather
 * than keeping their own column and separator math.
 */

export type Breakpoint = '' | 'sm:' | 'md:';

export interface RibbonLayout {
  /** Tailwind grid columns for the ribbon container. */
  gridClass: string;
  /** Columns at the default (mobile-first) breakpoint. */
  baseCols: number;
  /** Columns from `wideBp` upwards. */
  wideCols: number;
  /** Breakpoint prefix that introduces `wideCols`. */
  wideBp: Breakpoint;
}

/**
 * 1 metric takes the full width, 2 split it, 3 take a third each and 4 use the normal
 * quarter grid. Anything above four keeps the four column grid so cells stay readable.
 */
export const RIBBON_LAYOUT_BY_COUNT: Record<number, RibbonLayout> = {
  1: { gridClass: 'grid-cols-1', baseCols: 1, wideCols: 1, wideBp: 'md:' },
  2: { gridClass: 'grid-cols-2', baseCols: 2, wideCols: 2, wideBp: 'md:' },
  3: { gridClass: 'grid-cols-2 sm:grid-cols-3', baseCols: 2, wideCols: 3, wideBp: 'sm:' },
  4: { gridClass: 'grid-cols-2 md:grid-cols-4', baseCols: 2, wideCols: 4, wideBp: 'md:' },
};

export const MAX_RIBBON_CARDS = 4;

/**
 * Border utilities are listed as complete literals on purpose.
 *
 * Tailwind scans source text for whole class names, so a class assembled at runtime from
 * a breakpoint prefix (`${bp}border-r`) never reaches the stylesheet and silently does
 * nothing. Every variant used here is therefore spelled out in full below.
 */
const BORDER_R_ON: Record<Breakpoint, string> = {
  '': 'border-r',
  'sm:': 'sm:border-r',
  'md:': 'md:border-r',
};

const BORDER_R_OFF: Record<Breakpoint, string> = {
  '': 'border-r-0',
  'sm:': 'sm:border-r-0',
  'md:': 'md:border-r-0',
};

const BORDER_B_ON: Record<Breakpoint, string> = {
  '': 'border-b',
  'sm:': 'sm:border-b',
  'md:': 'md:border-b',
};

const BORDER_B_OFF: Record<Breakpoint, string> = {
  '': 'border-b-0',
  'sm:': 'sm:border-b-0',
  'md:': 'md:border-b-0',
};

export function getRibbonLayout(count: number): RibbonLayout {
  return RIBBON_LAYOUT_BY_COUNT[count] ?? RIBBON_LAYOUT_BY_COUNT[MAX_RIBBON_CARDS]!;
}

/**
 * Builds the separator borders for one cell at a given breakpoint.
 *
 * A cell keeps a right border only when another cell actually sits beside it, and a bottom
 * border only when a row follows it. The final row is accounted for so the lone card in a
 * short row does not pick up a border against the container edge.
 */
export function getRibbonSeparator(
  index: number,
  count: number,
  cols: number,
  bp: Breakpoint,
  dividerClass = 'border-white/10'
): string {
  const rowStart = Math.floor(index / cols) * cols;
  const positionInRow = index - rowStart;
  const cellsInRow = Math.min(cols, count - rowStart);
  const isLastInRow = positionInRow >= cellsInRow - 1;
  // Based on the row, not the cell: when the final row is short (3 cards on a 2 column
  // grid) every cell of the row above still needs the separator.
  const hasRowBelow = rowStart + cols < count;

  return [
    isLastInRow ? BORDER_R_OFF[bp] : `${BORDER_R_ON[bp]} ${dividerClass}`,
    hasRowBelow ? `${BORDER_B_ON[bp]} ${dividerClass}` : BORDER_B_OFF[bp],
  ].join(' ');
}
