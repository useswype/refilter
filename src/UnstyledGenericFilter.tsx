import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
} from 'react';

import { ShortcutSkeleton } from './ShortcutSkeleton';
import { FilterItem } from './FilterItem';
import { FilterFooter } from './FilterFooter';

import { FilterContext } from './utils';

import CloseIcon from './assets/close.svg';
import FilterBtnIcon from './assets/filter_btn_icon.svg';
import FilterDownArrow from './assets/filter_down_arrow.svg';

export interface GenericFilterClassNames {
  filterContainer?: string;
  filterContent?: string;
  filterButton?: string;
  filterButtonTitle?: string;
  filterItemsContainer?: string;
  resetFilterContainer?: string;
  resetFilterTitle?: string;
  filterModalContainer?: string;
  filterHeader?: string;
  filterHeaderTitle?: string;
  closeButton?: string;
  filterItemsList?: string;
  filterItem?: (isActive: boolean) => string;
  filterItemContent?: string;
  filterItemTitle?: string;
  badge?: string;
  badgeContainer?: string;
  badgeTitleContainer?: string;
  badgeTitle?: string;
  filterItemArrowContainer?: string;
  filterItemArrow?: string;
  filterComponentContainer?: string;
  applyButton?: string;
  resetAll?: (isDisabled: boolean) => string;
  filterFooter?: string;
}

export interface FilterComponentProps<V> {
  title: string;
  value: V;
  onChange: (value: V) => void | Promise<void>;
}

export interface ShortcutComponentProps<V> {
  title: string;
  value: V;
  onChange: (value: V) => void;
  defaultValue: V;
}

export interface Filterer<T extends Record<string, any>, K extends keyof T> {
  title: string;
  FilterComponent: ComponentType<FilterComponentProps<T[K]>> & {
    Shortcut: ComponentType<ShortcutComponentProps<T[K]>>;
    comparator: (a: T[K], b: T[K]) => boolean;
    getBadgeCount?: (value: T[K]) => number;
  };
  defaultValue: T[K];
  extraProps?: any;
}

export interface GenericFilterHandleRef<T extends Record<string, any>> {
  resetFilter: () => void;
  apply: (value: T) => void;
}

export interface GenericFilterProps<T extends Record<string, any>> {
  value: T | null;
  onChange?: (value: T) => void | Promise<void>;
  filterers: {
    [K in keyof T]: Filterer<T, K>;
  };
  order?: Array<keyof T>;
  onApply: (value: T) => boolean | void | Promise<boolean | void>;
  onFiltererSelect?: (key: keyof T) => void;
  handleRef?: (ref: GenericFilterHandleRef<T>) => void;
  setAreFiltersApplied?: (value: boolean) => void;
  classNames?: GenericFilterClassNames;
  filterBtnTitle?: string;
  filterHeaderTitle?: string;
  resetFiltersShortcuts?: string;
  resetAllButtonTitle?: string;
  applyFiltersButtonTitle?: string;
}

export function UnStyledGenericFilter<T extends Record<string, any>>({
  value: controlledValue,
  onChange: propOnChange,
  filterers,
  order,
  onApply,
  onFiltererSelect,
  handleRef,
  setAreFiltersApplied,
  classNames = {},
  filterBtnTitle = 'Filters',
  filterHeaderTitle = 'Filters',
  resetFiltersShortcuts = 'Reset Filters',
  resetAllButtonTitle = 'Reset All',
  applyFiltersButtonTitle = 'Apply Filters',
}: GenericFilterProps<T>) {

  const allFilterItems = useMemo(
    () =>
      (Object.keys(filterers) as Array<keyof T>).map(
        (key) => [key, filterers[key]] as const
      ),
    [filterers]
  );
  const filterItemArray = useMemo(
    () => order?.map((key) => [key, filterers[key]] as const) ?? allFilterItems,
    [order, filterers, allFilterItems]
  );
  const defaultValues = useMemo(() => {
    return Object.fromEntries(
      allFilterItems.map(([key, filterer]) => [key, filterer.defaultValue])
    ) as T;
  }, [allFilterItems]);

  const appliedFilterValue = controlledValue ?? defaultValues;
  const [draft, setDraft] = useState<{ source: T | null; value: T } | null>(null);
  const value =
    draft?.source === controlledValue ? draft.value : appliedFilterValue;

  if (draft && draft.source !== controlledValue) {
    setDraft(null);
  }

  const haveFiltersChanged = !allFilterItems.every(([key, filterer]) => {
    const result = filterer.FilterComponent.comparator(
      value[key],
      appliedFilterValue[key]
    );
    return result;
  });

  const areFiltersDefault = useMemo(() => {
    return !allFilterItems.every(([key, filterer]) => {
      const result = filterer.FilterComponent.comparator(
        value[key],
        defaultValues[key]
      );
      return result;
    });
  }, [allFilterItems, value, defaultValues]);

  const areAppliedFiltersDefault = useMemo(() => {
    return !allFilterItems.every(([key, filterer]) => {
      const result = filterer.FilterComponent.comparator(
        appliedFilterValue[key],
        defaultValues[key]
      );
      return result;
    });
  }, [allFilterItems, appliedFilterValue, defaultValues]);

  const [isApplyLoading, setIsApplyLoading] = useState(false);

  const onChange = useCallback(
    (value: T): void => {
      setDraft({ source: controlledValue, value });
      void propOnChange?.(value);
    },
    [controlledValue, propOnChange]
  );

  const [active, setActive] = useState(filterItemArray[0][0]);

  const activeFilterer = filterers[active];

  const handleApply = useCallback(
    async (newValue: T): Promise<void> => {
      setIsApplyLoading(true);

      try {
        await onApply(newValue);
      } finally {
        setIsApplyLoading(false);
      }
    },
    [onApply]
  );

  const changeAndApply = useCallback(
    (value: T) => {
      onChange(value);
      void handleApply(value);
    },
    [handleApply, onChange]
  );

  const resetFilter = useCallback(() => {
    changeAndApply(defaultValues);
  }, [changeAndApply, defaultValues]);

  const filterHandleRef = useMemo(
    () => ({
      resetFilter,
      apply: changeAndApply,
    }),
    [changeAndApply, resetFilter]
  );

  const checkAppliedFilter = useCallback(() => {
    if (setAreFiltersApplied !== undefined) {
      setAreFiltersApplied(areAppliedFiltersDefault);
    }
  }, [areAppliedFiltersDefault, setAreFiltersApplied]);

  useEffect(() => {
    checkAppliedFilter();
  }, [checkAppliedFilter]);

  useEffect(() => {
    if (handleRef) {
      handleRef(filterHandleRef);
    }
  }, [filterHandleRef, handleRef]);

  const disableResetButton = !areFiltersDefault || isApplyLoading;
  const disableApplyFilterButton = !haveFiltersChanged || isApplyLoading;

  return (
    <FilterContext.Provider value={{ value, onChange }}>
      <Popover>
        <div className={classNames.filterContainer}>
          <div className={classNames.filterContent}>
            <PopoverButton className={classNames.filterButton}>
              <FilterBtnIcon />
              <span className={classNames.filterButtonTitle}>{filterBtnTitle}</span>
              <FilterDownArrow />
            </PopoverButton>
            <div className={classNames.filterItemsContainer}>
              {filterItemArray.map(([key, filterItem]) => {
                const { FilterComponent, defaultValue, title } = filterItem;
                if (isApplyLoading) {
                  return (
                    <div key={`shortcut-loading-${key.toString()}`}>
                      <ShortcutSkeleton />
                    </div>
                  );
                }

                return (
                  <FilterComponent.Shortcut
                    title={title}
                    key={`shortcut-${key.toString()}`}
                    value={appliedFilterValue[key]}
                    onChange={(filterValue) => {
                      changeAndApply({
                        ...appliedFilterValue,
                        [key]: filterValue,
                      });
                    }}
                    defaultValue={defaultValue}
                  />
                );
              })}
            </div>
          </div>
          {areAppliedFiltersDefault && (
            <div className={classNames.resetFilterContainer}>
              <button
                onClick={resetFilter}
                className={classNames.resetFilterTitle}
              >
               {resetFiltersShortcuts}
              </button>
            </div>
          )}
        </div>
        <PopoverPanel className={classNames.filterModalContainer}>
          {({ close }) => (
            <>
              <div className={classNames.filterHeader}>
                <p className={classNames.filterHeaderTitle}>{filterHeaderTitle}</p>
                <button
                  type="button"
                  className={classNames.closeButton}
                  data-testid="filter-drawer-close-btn"
                  onClick={() => {
                    close();
                  }}
                >
                  <CloseIcon className="inline-block stroke-gray-800" />
                </button>
              </div>
              <ul className={classNames.filterItemsList}>
                {filterItemArray.map(([key, filterItem]) => {
                  const {
                    title,
                    FilterComponent: { getBadgeCount },
                  } = filterItem;
                  const badgeCount = getBadgeCount
                    ? getBadgeCount(value[key])
                    : 0;
                  return (
                    <FilterItem
                      key={`filter-button-${key.toString()}`}
                      itemKey={key}
                      title={title}
                      badgeCount={badgeCount}
                      isActive={key === active}
                      onSelect={(selectedKey) => {
                        onFiltererSelect?.(selectedKey);
                        setActive(selectedKey);
                      }}
                      classNames={classNames}
                    />
                  );
                })}
              </ul>
              <div className={classNames.filterComponentContainer}>
                <activeFilterer.FilterComponent
                  title={activeFilterer.title}
                  value={value[active]}
                  onChange={async (filterValue) =>
                    onChange({ ...value, [active]: filterValue })
                  }
                  {...activeFilterer.extraProps}
                />
              </div>
              <FilterFooter
                disableResetButton={disableResetButton}
                disableApplyButton={disableApplyFilterButton}
                isApplyLoading={isApplyLoading}
                resetAllButtonTitle={resetAllButtonTitle}
                applyFiltersButtonTitle={applyFiltersButtonTitle}
                onReset={resetFilter}
                onApply={async () => {
                  await handleApply(value);
                  close();
                }}
                classNames={classNames}
              />
            </>
          )}
        </PopoverPanel>
      </Popover>
    </FilterContext.Provider>
  );
}
