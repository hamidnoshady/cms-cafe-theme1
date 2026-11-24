import * as React from 'react';
import { Heart, Search, UtensilsCrossed, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { ThemeData } from './types';

interface MenuToolbarProps {
  data: ThemeData;
}

const ALL_CATEGORY = '__all__';

function normalizeSearch(value: string): string {
  return value
    .replace(/[\u064A\u0649]/g, '\u06CC')
    .replace(/\u0643/g, '\u06A9')
    .replace(/\u0629/g, '\u0647')
    .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627')
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06F0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u200C\u200D\s]+/g, ' ')
    .trim()
    .toLowerCase();
}

function readFavouriteIds(siteKey: string): Set<string> {
  try {
    const raw = JSON.parse(localStorage.getItem(`coffee-poster:favourites:${siteKey}`) || '[]');
    if (Array.isArray(raw)) return new Set(raw.filter((v): v is string => typeof v === 'string'));
  } catch {
    // Private browsing fallback
  }
  return new Set();
}

export function MenuToolbar({ data }: MenuToolbarProps) {
  const isFa = data.locale === 'fa';
  const [activeCategory, setActiveCategory] = React.useState<string>(ALL_CATEGORY);
  const [query, setQuery] = React.useState<string>('');
  const [onlyFavs, setOnlyFavs] = React.useState<boolean>(false);
  const [favCount, setFavCount] = React.useState<number>(() => readFavouriteIds(data.siteKey).size);
  const [visibleCount, setVisibleCount] = React.useState<number>(data.products.length);

  const categories = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const p of data.products) {
      const cat = (p.category || '').trim();
      if (!cat) continue;
      map.set(cat, (map.get(cat) || 0) + 1);
    }
    return [...map.entries()].map(([name, count]) => ({ name, count }));
  }, [data.products]);

  const isFlexibleStorefront = data.cafe || data.products.length !== 8;
  const showTabs = isFlexibleStorefront && data.settings?.showCategoryTabs !== false && categories.length >= 2;
  const showSearch = isFlexibleStorefront && data.settings?.showSearch !== false;
  const showFavFilter = isFlexibleStorefront && data.settings?.showFavorites !== false;
  const showTableNotice = Boolean(data.cafe && data.tableToken);

  const formatNum = React.useCallback(
    (n: number) => new Intl.NumberFormat(isFa ? 'fa-IR' : data.locale).format(n),
    [isFa, data.locale],
  );

  const applyFilter = React.useCallback(() => {
    const favs = readFavouriteIds(data.siteKey);
    setFavCount(favs.size);
    const normalizedQuery = normalizeSearch(query);
    const cells = document.querySelectorAll<HTMLElement>('.poster .menu-grid > .cell');
    let shown = 0;

    cells.forEach((cell) => {
      const idx = Number(cell.dataset.productIndex);
      const product = data.products[idx];
      if (!product) return;

      const matchesCategory =
        activeCategory === ALL_CATEGORY || (product.category || '').trim() === activeCategory;
      const matchesFav = !onlyFavs || favs.has(product.id);
      const matchesQuery =
        !normalizedQuery ||
        normalizeSearch(product.title).includes(normalizedQuery) ||
        normalizeSearch(product.summary || '').includes(normalizedQuery) ||
        normalizeSearch(product.category || '').includes(normalizedQuery);

      const visible = matchesCategory && matchesFav && matchesQuery;
      cell.hidden = !visible;
      if (visible) shown += 1;
    });

    setVisibleCount(shown);
  }, [activeCategory, data.products, data.siteKey, onlyFavs, query]);

  React.useEffect(() => {
    applyFilter();
  }, [applyFilter]);

  React.useEffect(() => {
    const onFavChange = () => applyFilter();
    window.addEventListener('eshobe:favourites-changed', onFavChange);
    return () => window.removeEventListener('eshobe:favourites-changed', onFavChange);
  }, [applyFilter]);

  if (!showTabs && !showSearch && !showFavFilter && !showTableNotice) {
    return null;
  }

  const hasActiveFilter = activeCategory !== ALL_CATEGORY || query.trim() !== '' || onlyFavs;

  const resetFilters = () => {
    setActiveCategory(ALL_CATEGORY);
    setQuery('');
    setOnlyFavs(false);
  };

  return (
    <div
      className="menu-toolbar mb-5 flex w-full flex-col gap-3"
      dir={isFa ? 'rtl' : 'ltr'}
    >
      {(showSearch || showFavFilter || showTableNotice) && (
        <div className="flex flex-wrap items-center gap-2.5">
          {showSearch && (
            <div className="relative min-w-[200px] flex-1">
              <Search
                aria-hidden="true"
                className={cn(
                  'pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 text-muted-foreground',
                  isFa ? 'right-3' : 'left-3',
                )}
              />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isFa ? 'جست‌وجو در منو…' : 'Search menu…'}
                aria-label={isFa ? 'جست‌وجو در منو' : 'Search menu'}
                className={cn(
                  'h-10 rounded-lg border-border bg-[#fffdf7] text-sm text-foreground shadow-none placeholder:text-muted-foreground',
                  isFa ? 'pr-9 pl-9' : 'pl-9 pr-9',
                )}
              />
              {query && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setQuery('')}
                  aria-label={isFa ? 'پاک کردن جست‌وجو' : 'Clear search'}
                  className={cn(
                    'absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground',
                    isFa ? 'left-2' : 'right-2',
                  )}
                >
                  <X className="size-3.5" />
                </Button>
              )}
            </div>
          )}

          {showFavFilter && (
            <Button
              type="button"
              variant={onlyFavs ? 'default' : 'outline'}
              size="default"
              onClick={() => setOnlyFavs((v) => !v)}
              aria-pressed={onlyFavs}
              className={cn(
                'h-10 gap-2 rounded-lg border-border px-3.5 text-xs font-semibold shadow-none',
                !onlyFavs && 'bg-[#fffdf7] text-foreground hover:bg-secondary',
              )}
            >
              <Heart className={cn('size-3.5', onlyFavs && 'fill-current')} />
              <span>{isFa ? 'علاقه‌مندی‌ها' : 'Favourites'}</span>
              {favCount > 0 && (
                <span className="tabular-nums opacity-80">({formatNum(favCount)})</span>
              )}
            </Button>
          )}

          {showTableNotice && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
              <UtensilsCrossed className="size-3.5 shrink-0" aria-hidden="true" />
              <span>{isFa ? 'سفارش سر میز فعال است' : 'Table dine-in active'}</span>
            </div>
          )}
        </div>
      )}

      {showTabs && (
        <Tabs
          value={activeCategory}
          onValueChange={setActiveCategory}
          dir={isFa ? 'rtl' : 'ltr'}
          className="w-full"
        >
          <div className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <TabsList className="inline-flex h-auto min-h-10 w-max justify-start gap-1 rounded-xl border border-border/80 bg-[#ebe2d1]/80 p-1">
              <TabsTrigger
                value={ALL_CATEGORY}
                className="flex-none rounded-lg px-3.5 py-1.5 text-xs font-semibold text-muted-foreground data-[state=active]:bg-[#fffdf7] data-[state=active]:text-foreground data-[state=active]:shadow-xs"
              >
                <span>{isFa ? 'همه' : 'All'}</span>
                <span className="text-[11px] opacity-70 tabular-nums">
                  ({formatNum(data.products.length)})
                </span>
              </TabsTrigger>
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat.name}
                  value={cat.name}
                  className="flex-none rounded-lg px-3.5 py-1.5 text-xs font-semibold text-muted-foreground data-[state=active]:bg-[#fffdf7] data-[state=active]:text-foreground data-[state=active]:shadow-xs"
                >
                  <span>{cat.name}</span>
                  <span className="text-[11px] opacity-70 tabular-nums">
                    ({formatNum(cat.count)})
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>
      )}

      {hasActiveFilter && visibleCount === 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-[#fffdf7] px-4 py-3 text-sm text-muted-foreground">
          <span>
            {isFa
              ? 'موردی با این فیلتر در منو پیدا نشد.'
              : 'No menu items match the current filter.'}
          </span>
          <Button type="button" variant="outline" size="sm" onClick={resetFilters}>
            {isFa ? 'نمایش همه منو' : 'Show all items'}
          </Button>
        </div>
      )}
    </div>
  );
}
