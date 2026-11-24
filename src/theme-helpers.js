/**
 * Pure presentation and menu-filtering helpers decoupled from SSR and browser DOM.
 */

const ENGLISH_MANIFEST_DEFAULTS = Object.freeze({
  menuTitle: 'MENU & PRICE LIST',
  tagline: 'BREWED FOR THE BOLD',
  brandDescription: 'A perfect cup of coffee, made just for you. Energize your morning and fuel your day with our premium blends.',
  slogan: 'BREWED\nFOR COMFORT,\nCRAFTED\nFOR YOU',
});

const PERSIAN_DEFAULTS = Object.freeze({
  menuTitle: 'منو و قیمت‌ها',
  tagline: 'تازه‌دم و دست‌ساز',
  brandDescription: 'یک فنجان آرامش، با دانه‌های تازه‌برشته و عطر دلنشین برای شروع روز یا مکثی کوتاه.',
  slogan: 'دم‌کشیده\nبا حوصله،\nساخته‌شده\nبرای شما',
});

/**
 * When a Persian (`fa`) store has not customized a manifest setting yet,
 * `settingsFor(site)` falls back to the English manifest default. Substitute
 * natural Persian copy in that case while always preserving any explicit value
 * the tenant configured in Eshobe CMS.
 */
export function localizeDefaultSetting(key, value, locale) {
  if (locale !== 'fa') return value;
  const trimmed = typeof value === 'string' ? value.trim() : '';
  if (!trimmed) return PERSIAN_DEFAULTS[key] ?? value;
  if (ENGLISH_MANIFEST_DEFAULTS[key] && trimmed === ENGLISH_MANIFEST_DEFAULTS[key]) {
    return PERSIAN_DEFAULTS[key];
  }
  return value;
}

/**
 * Ordered unique categories from product view models, preserving POS/CMS order.
 */
export function extractCategories(products = []) {
  const counts = new Map();
  for (const product of products) {
    const name = typeof product?.category === 'string' ? product.category.trim() : '';
    if (!name) continue;
    counts.set(name, (counts.get(name) || 0) + 1);
  }
  return [...counts.entries()].map(([name, count]) => ({ name, count }));
}

/**
 * Pure modifier-group validation & rule summary shared by tests and UI.
 */
export function modifierGroupSummary(group, selectedIds = [], strings = {}) {
  const selectedCount = Array.isArray(selectedIds) ? selectedIds.length : 0;
  const min = Math.max(0, Number(group?.minSelections) || 0);
  const optionCount = Array.isArray(group?.options) ? group.options.length : 0;
  const max = Math.min(Math.max(1, Number(group?.maxSelections) || 1), Math.max(1, optionCount));
  const required = min > 0;
  const satisfied = selectedCount >= min && selectedCount <= max;
  const isSingle = max === 1 && min >= 1;
  const ruleLabel = max === 1
    ? (strings.chooseOne || 'Choose one')
    : (strings.chooseAny || 'Choose any');
  return {
    required,
    satisfied,
    selectedCount,
    minSelections: min,
    maxSelections: max,
    isSingle,
    ruleLabel,
  };
}

const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/**
 * Normalize Persian/Arabic keyboard variants (ي/ى -> ی, ك -> ک, آ/أ/إ -> ا,
 * ة -> ه, Persian/Arabic digits -> Latin digits, ZWNJ/whitespace collapsed,
 * diacritics stripped) so Persian menu search matches regardless of keyboard.
 */
export function normalizeSearchText(value) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u064A\u0649]/g, '\u06CC')
    .replace(/\u0643/g, '\u06A9')
    .replace(/\u0629/g, '\u0647')
    .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627')
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d)))
    .replace(/[\u200C\u200D\s]+/g, ' ')
    .trim()
    .toLowerCase();
}
