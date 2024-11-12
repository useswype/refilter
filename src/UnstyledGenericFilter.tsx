import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
} from 'react';

import { ShortcutSkeleton } from './ShortcutSkeleton';

import { FilterContext } from './utils';

import CloseIcon from './assets/close.svg';
import FilterBtnIcon from './assets/filter_btn_icon.svg';
import FilterDownArrow from './assets/filter_down_arrow.svg';
import FilterItemArrow from './assets/filter_item_arrow.svg';
import Spinner from './assets/spinner.svg';
import { twMerge } from 'tailwind-merge'

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

export interface GenericFilterProps<T extends Record<string, any>> {
  value: T;
  onChange: (value: T) => void | Promise<void>;
  filterers: {
    [K in keyof T]: Filterer<T, K>;
  };
  order?: Array<keyof T>;
  onApply: (value: T) => boolean | Promise<boolean>;
  onFiltererSelect?: (key: keyof T) => void;
  handleRef?: (ref: { resetFilter: () => void }) => void;
  setAreFiltersApplied?: (value: boolean) => void;
  classNames?: GenericFilterClassNames;
}

export function UnStyledGenericFilter<T extends Record<string, any>>({
  onChange: propOnChange,
  value,
  filterers,
  order,
  onApply,
  onFiltererSelect,
  handleRef,
  setAreFiltersApplied,
  classNames = {},
}: GenericFilterProps<T>) {
  const [appliedFilterValue, setAppliedFilterValue] = useState<T>(value);

  const filterItemArray = useMemo(() => {
    const orderedFilterItems =
      order !== undefined ? order : (Object.keys(filterers) as Array<keyof T>);
    return orderedFilterItems.map((item) => [item, filterers[item]] as const);
  }, [order, filterers]);

  const haveFiltersChanged = !filterItemArray.every(([key, filterer]) => {
    const result = filterer.FilterComponent.comparator(
      value[key],
      appliedFilterValue[key]
    );
    return result;
  });

  const defaultValues = useMemo(() => {
    return Object.fromEntries(
      filterItemArray.map(([key, filterer]) => [key, filterer.defaultValue])
    ) as T;
  }, [filterItemArray]);

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
      void propOnChange(value);
    },
    [propOnChange]
  );

  const [active, setActive] = useState(filterItemArray[0][0]);

  const activeFilterer = filterers[active];

  async function handleApply(newValue: T): Promise<void> {
    setIsApplyLoading(true);

    const filtersApplied = await onApply(newValue);

    if (filtersApplied) {
      setAppliedFilterValue(newValue);
    }
    setIsApplyLoading(false);
  }

  const ref = useMemo(
    () => ({
      resetFilter: () => {
        setAppliedFilterValue(defaultValues);
        void onChange(defaultValues);
      },
    }),
    [defaultValues, onChange]
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
      handleRef(ref);
    }
  }, [ref, handleRef]);

  const disableResetButton = !areFiltersDefault || isApplyLoading;
  const disableApplyFilterButton = !haveFiltersChanged || isApplyLoading;

  return (
    <FilterContext.Provider value={{ value, onChange }}>
      <Popover>
        <div className={twMerge(classNames.filterContainer)}>
          <div className={twMerge(classNames.filterContent)}>
            <PopoverButton className={twMerge(classNames.filterButton)}>
              <FilterBtnIcon />
              <span className={twMerge(classNames.filterButtonTitle)}>Filter</span>
              <FilterDownArrow />
            </PopoverButton>
            <div className={twMerge(classNames.filterItemsContainer)}>
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
                    onChange={async (filterValue) => {
                      const newValue = {
                        ...appliedFilterValue,
                        [key]: filterValue,
                      };
                      void onChange(newValue);
                      void handleApply(newValue);
                    }}
                    defaultValue={defaultValue}
                  />
                );
              })}
            </div>
          </div>
          {areAppliedFiltersDefault && (
            <div className={twMerge(classNames.resetFilterContainer)}>
              <button
                onClick={async () => {
                  void onChange(defaultValues);
                  void handleApply(defaultValues);
                }}
                className={twMerge(classNames.resetFilterTitle)}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
        <PopoverPanel className={twMerge(classNames.filterModalContainer)}>
          {({ close }) => (
            <>
              <div className={twMerge(classNames.filterHeader)}>
                <p className={twMerge(classNames.filterHeaderTitle)}>Filters</p>
                <button
                  type="button"
                  className={twMerge(classNames.closeButton)}
                  data-testid="filter-drawer-close-btn"
                  onClick={() => {
                    close();
                  }}
                >
                  <CloseIcon className="inline-block stroke-gray-800" />
                </button>
              </div>
              <ul className={twMerge(classNames.filterItemsList)}>
                {filterItemArray.map(([key, filterItem]) => {
                  const {
                    title,
                    FilterComponent: { getBadgeCount },
                  } = filterItem;
                  const badgeCount = getBadgeCount
                    ? getBadgeCount(value[key])
                    : 0;
                  return (
                    <div key={`filter-button-${key.toString()}`}>
                      <button
                        onClick={() => {
                          onFiltererSelect?.(key);
                          setActive(key);
                        }}
                        className={classNames.filterItem ? classNames.filterItem(key === active) : ''}
                      >
                        <div className={twMerge(classNames.filterItemContent)}>
                          <div className={twMerge(classNames.filterItemTitle)}>
                            <span className="px-4 text-sm">{title}</span>
                          </div>

                          <div className={twMerge(classNames.badge)}>
                            <div className={twMerge(classNames.badgeContainer)}>
                              {!!badgeCount && (
                                <div className={twMerge(classNames.badgeTitleContainer)}>
                                  <span className={twMerge(classNames.badgeTitle)}>
                                    {badgeCount}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className={twMerge(classNames.filterItemArrowContainer)}>
                            {key === active && (
                              <div className={twMerge(classNames.filterItemArrow)}>
                                <FilterItemArrow />
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    </div>
                  );
                })}
              </ul>
              <div className={twMerge(classNames.filterComponentContainer)}>
                <activeFilterer.FilterComponent
                  title={activeFilterer.title}
                  value={value[active]}
                  onChange={async (filterValue) =>
                    onChange({ ...value, [active]: filterValue })
                  }
                  {...activeFilterer.extraProps}
                />
              </div>
              <div className={twMerge(classNames.filterFooter)}>
                <button
                  className={classNames.resetAll ? classNames.resetAll(disableResetButton) : ''} 
                  disabled={disableResetButton}
                  onClick={async () => {
                    void onChange(defaultValues);
                    void handleApply(defaultValues);
                  }}
                >
                  Reset All
                </button>
                <button
                  type="button"
                  className={twMerge(classNames.applyButton)}
                  disabled={disableApplyFilterButton}
                  onClick={async () => {
                    await handleApply(value);
                    close();
                  }}
                >
                  {isApplyLoading && <Spinner />}
                  Apply
                </button>
              </div>
            </>
          )}
        </PopoverPanel>
      </Popover>
    </FilterContext.Provider>
  );
}
