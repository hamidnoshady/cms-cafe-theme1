import * as React from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { ModifierGroup, ModifierSelection, ThemeStrings } from './types';

interface ModifierPickerProps {
  groups: ModifierGroup[];
  selection: ModifierSelection;
  onSelectionChange: (next: ModifierSelection) => void;
  strings: ThemeStrings;
  locale: string;
}

function formatCount(value: number, locale: string): string {
  return new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : locale).format(value);
}

export function ModifierPicker({
  groups,
  selection,
  onSelectionChange,
  strings,
  locale,
}: ModifierPickerProps) {
  const isRtl = locale === 'fa';

  const handleToggle = (group: ModifierGroup, optionId: string, single: boolean) => {
    const current = selection[group.sourceId] ?? [];
    let nextIds: string[];

    if (single) {
      nextIds = [optionId];
    } else if (current.includes(optionId)) {
      nextIds = current.filter((id) => id !== optionId);
    } else {
      if (group.maxSelections === 1) {
        nextIds = [optionId];
      } else if (current.length >= group.maxSelections) {
        return;
      } else {
        nextIds = [...current, optionId];
      }
    }

    onSelectionChange({
      ...selection,
      [group.sourceId]: nextIds,
    });
  };

  if (!groups.length) return null;

  return (
    <div
      className="espresso-surface flex w-full flex-col gap-3.5"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {groups.map((group) => {
        const selectedIds = selection[group.sourceId] ?? [];
        const selectedCount = selectedIds.length;
        const single = group.maxSelections === 1 && group.minSelections >= 1;
        const isRequired = group.minSelections > 0;
        const isSatisfied = selectedCount >= group.minSelections;
        const reachedMax = !single && group.maxSelections > 1 && selectedCount >= group.maxSelections;
        const useTwoColumns = group.options.length >= 4;

        const hintText =
          group.maxSelections === 1
            ? strings.chooseOne || (isRtl ? 'یکی را انتخاب کنید' : 'Choose one')
            : group.maxSelections < group.options.length
              ? isRtl
                ? `حداکثر ${formatCount(group.maxSelections, locale)} انتخاب`
                : `Up to ${formatCount(group.maxSelections, locale)}`
              : strings.chooseAny || (isRtl ? 'هر تعداد که بخواهید' : 'Choose any');

        return (
          <Card
            key={group.sourceId}
            data-group={group.sourceId}
            className={cn(
              'modifier-card gap-0 overflow-hidden rounded-xl border p-0 shadow-none transition-colors',
              'bg-[#2b1a10]/85 text-[#fbf2e3]',
              isRequired && !isSatisfied
                ? 'border-[#e6a465]/45'
                : 'border-[#e6bd8a]/20',
            )}
          >
            <fieldset className="m-0 min-w-0 border-0 p-0" data-group={group.sourceId}>
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <legend className="m-0 flex items-center gap-2 p-0 text-sm font-bold text-[#fff8eb]">
                  <span>{group.label}</span>
                  {isRequired ? (
                    <Badge
                      variant="secondary"
                      className={cn(
                        'rounded-md border px-2 py-0.5 text-[11px] font-semibold',
                        isSatisfied
                          ? 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200'
                          : 'border-[#e6bd8a]/40 bg-[#e6bd8a]/15 text-[#f6d6a8]',
                      )}
                    >
                      {!isSatisfied && <AlertCircle className="size-3" aria-hidden="true" />}
                      {strings.required || (isRtl ? 'الزامی' : 'Required')}
                    </Badge>
                  ) : null}
                </legend>

                <div className="flex items-center gap-2 text-xs text-[#cbb59a]">
                  <span>{hintText}</span>
                  {selectedCount > 0 ? (
                    <span className="inline-flex items-center gap-1.5 font-semibold text-[#f3ca91] tabular-nums">
                      <span aria-hidden="true">•</span>
                      <span>
                        {formatCount(selectedCount, locale)} {isRtl ? 'انتخاب' : 'selected'}
                      </span>
                    </span>
                  ) : null}
                </div>
              </div>

              <Separator className="bg-[#e6bd8a]/14" />

              <div
                className={cn(
                  'grid gap-2 p-3',
                  useTwoColumns ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1',
                )}
              >
                {group.options.map((option) => {
                  const checked = selectedIds.includes(option.sourceId);
                  const disabled = !checked && reachedMax;
                  const inputId = `mod-${group.sourceId}-${option.sourceId}`;

                  return (
                    <label
                      key={option.sourceId}
                      htmlFor={inputId}
                      className={cn(
                        'group relative flex min-h-[46px] cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm transition-all select-none',
                        checked
                          ? 'border-[#e6bd8a] bg-[#e6bd8a]/16 text-[#fff9ee] shadow-[inset_0_0_0_1px_rgba(230,189,138,0.28)]'
                          : 'border-[#f5dec0]/14 bg-[#fff8ea]/[0.04] text-[#f5e7d3] hover:border-[#e6bd8a]/45 hover:bg-[#fff8ea]/[0.09]',
                        disabled && 'cursor-not-allowed opacity-45 hover:border-[#f5dec0]/14 hover:bg-[#fff8ea]/[0.04]',
                      )}
                    >
                      <input
                        id={inputId}
                        type={single ? 'radio' : 'checkbox'}
                        name={`modifier-${group.sourceId}`}
                        value={option.sourceId}
                        checked={checked}
                        disabled={disabled}
                        onChange={() => handleToggle(group, option.sourceId, single)}
                        className="peer absolute inset-0 z-10 m-0 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
                      />

                      <span className="pointer-events-none flex min-w-0 items-center gap-2.5">
                        <span
                          aria-hidden="true"
                          className={cn(
                            'flex size-[18px] shrink-0 items-center justify-center border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#f5d9b2]',
                            single ? 'rounded-full' : 'rounded-[5px]',
                            checked
                              ? 'border-[#f0c98d] bg-[#e6bd8a] text-[#24140b]'
                              : 'border-[#e8cfa9]/45 bg-transparent group-hover:border-[#e6bd8a]',
                          )}
                        >
                          {checked ? (
                            single ? (
                              <span className="size-2 rounded-full bg-[#24140b]" />
                            ) : (
                              <Check className="size-3 stroke-[3]" />
                            )
                          ) : null}
                        </span>
                        <span className="truncate font-medium leading-snug">
                          {option.label}
                        </span>
                      </span>

                      {option.priceLabel ? (
                        <span
                          className={cn(
                            'shrink-0 text-xs font-semibold tabular-nums',
                            checked ? 'text-[#fde2b8]' : 'text-[#dfba86]',
                          )}
                        >
                          {option.priceLabel}
                        </span>
                      ) : single ? (
                        <span className="shrink-0 text-[11px] text-[#b89f82]">
                          {isRtl ? 'بدون هزینه' : 'Included'}
                        </span>
                      ) : null}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </Card>
        );
      })}
    </div>
  );
}
