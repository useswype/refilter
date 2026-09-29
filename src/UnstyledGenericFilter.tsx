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

import { FilterContext } from './FilterContext';
import {
  encodeFilters,
  decodeFilters,
  type FilterSchema,
  type FilterKey,
  type InferFilterValues,
} from './utils';

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
  extraProps?: any;
}

export interface GenericFilterHandleRef<T extends Record<string, any>> {
  resetFilter: () => void;
  apply: (value: T) => void;
  encode: (value: T) => string;
  decode: (string: string) => T;
}

export interface GenericFilterProps<
  S extends FilterSchema,
  F extends FilterKey<S> = FilterKey<S>,
  K extends F = F,
> {
  schema: S;
  initialValue?: Partial<Pick<InferFilterValues<NoInfer<S>>, NoInfer<K>>>;
  onChange?: (value: Pick<InferFilterValues<S>, K>) => void | Promise<void>;
  filterers: {
    [P in F]: Filterer<InferFilterValues<NoInfer<S>>, P>;
  };
  order?: readonly K[];
  onApply: (value: Pick<InferFilterValues<S>, K>) => boolean | Promise<boolean>;
  onFiltererSelect?: (key: K) => void;
  handleRef?: (
    ref: GenericFilterHandleRef<Pick<InferFilterValues<S>, K>>
  ) => void;
  setAreFiltersApplied?: (value: boolean) => void;
  classNames?: GenericFilterClassNames;
  filterBtnTitle?: string;
  filterHeaderTitle?: string;
  resetFiltersShortcuts?: string;
  resetAllButtonTitle?: string;
  applyFiltersButtonTitle?: string;
}

export function UnStyledGenericFilter<
  S extends FilterSchema,
  F extends FilterKey<S> = FilterKey<S>,
  K extends F = F,
>({
  schema,
  initialValue,
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
}: GenericFilterProps<S, F, K>) {
  type T = Pick<InferFilterValues<S>, K>;

  const keys = useMemo(
    () => order ?? (Object.keys(filterers) as K[]),
    [order, filterers]
  );
  const filterItemArray = useMemo(
    () => keys.map((key) => [key, filterers[key]] as const),
    [keys, filterers]
  );
  const defaultValues = useMemo(
    () =>
      Object.fromEntries(
        keys.map((key) => [key, schema[key].defaultValue])
      ) as T,
    [keys, schema]
  );

  const [value, setValue] = useState<T>(
    () =>
      Object.fromEntries(
        keys.map((key) => [
          key,
          initialValue?.[key] === undefined
            ? schema[key].defaultValue
            : initialValue[key],
        ])
      ) as T
  );
  const [appliedFilterValue, setAppliedFilterValue] = useState<T>(value);

  const haveFiltersChanged = !filterItemArray.every(([key, filterer]) => {
    const result = filterer.FilterComponent.comparator(
      value[key],
      appliedFilterValue[key]
    );
    return result;
  });

  const areFiltersDefault = useMemo(() => {
    return !filterItemArray.every(([key, filterer]) => {
      const result = filterer.FilterComponent.comparator(
        value[key],
        defaultValues[key]
      );
      return result;
    });
  }, [filterItemArray, value, defaultValues]);

  const areAppliedFiltersDefault = useMemo(() => {
    return !filterItemArray.every(([key, filterer]) => {
      const result = filterer.FilterComponent.comparator(
        appliedFilterValue[key],
        defaultValues[key]
      );
      return result;
    });
  }, [filterItemArray, appliedFilterValue, defaultValues]);

  const [isApplyLoading, setIsApplyLoading] = useState(false);

  const onChange = useCallback(
    (value: T): void | Promise<void> => {
      setValue(value);
      if (propOnChange) {
        void propOnChange(value);
      }
    },
    [propOnChange]
  );

  const [active, setActive] = useState<K | undefined>(keys[0]);

  const activeKey =
    active !== undefined && keys.includes(active) ? active : keys[0];
  const activeFilterer =
    activeKey === undefined ? undefined : filterers[activeKey];

  async function handleApply(newValue: T): Promise<void> {
    setIsApplyLoading(true);

    const filtersApplied = await onApply(newValue);

    if (filtersApplied) {
      setAppliedFilterValue(newValue);
    }
    setIsApplyLoading(false);
  }

  const refApply = useCallback((value: T) => {
    setValue(value);
    setAppliedFilterValue(value);
  }, []);

  const filterHandleRef = useMemo(
    () => ({
      resetFilter: () => {
        setAppliedFilterValue(defaultValues);
        void onChange(defaultValues);
      },
      apply: refApply,
      encode: (value: T): string => {
        return encodeFilters<S, K>(value, schema, { keys });
      },
      decode: (string: string): T => {
        return decodeFilters<S, K>(string, schema, { keys });
      },
    }),
    [defaultValues, refApply, schema, keys, onChange]
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
              <span className={classNames.filterButtonTitle}>
                {filterBtnTitle}
              </span>
              <FilterDownArrow />
            </PopoverButton>
            <div className={classNames.filterItemsContainer}>
              {filterItemArray.map(([key, filterItem]) => {
                const { FilterComponent, title } = filterItem;
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
                    onChange={async (filterValue) => {
                      const newValue = {
                        ...appliedFilterValue,
                        [key]: filterValue,
                      };
                      void onChange(newValue);
                      void handleApply(newValue);
                    }}
                    defaultValue={schema[key].defaultValue}
                  />
                );
              })}
            </div>
          </div>
          {areAppliedFiltersDefault && (
            <div className={classNames.resetFilterContainer}>
              <button
                onClick={async () => {
                  void onChange(defaultValues);
                  void handleApply(defaultValues);
                }}
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
                <p className={classNames.filterHeaderTitle}>
                  {filterHeaderTitle}
                </p>
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
                      isActive={key === activeKey}
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
                {activeFilterer && activeKey !== undefined && (
                  <activeFilterer.FilterComponent
                    title={activeFilterer.title}
                    value={value[activeKey]}
                    onChange={async (filterValue) =>
                      onChange({ ...value, [activeKey]: filterValue })
                    }
                    {...activeFilterer.extraProps}
                  />
                )}
              </div>
              <FilterFooter
                disableResetButton={disableResetButton}
                disableApplyButton={disableApplyFilterButton}
                isApplyLoading={isApplyLoading}
                resetAllButtonTitle={resetAllButtonTitle}
                applyFiltersButtonTitle={applyFiltersButtonTitle}
                onReset={async () => {
                  void onChange(defaultValues);
                  void handleApply(defaultValues);
                }}
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
