import { Popover, PopoverButton } from '@headlessui/react';

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
}

export function GenericFilter<T extends Record<string, any>>({
  onChange: propOnChange,
  value,
  filterers,
  order,
  onApply,
  onFiltererSelect,
  handleRef,
  setAreFiltersApplied,
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
        <div className="flex overflow-hidden">
          <div className="flex items-center gap-4 overflow-x-auto">
            <PopoverButton className="flex items-center justify-center gap-1 rounded-lg border border-gray-200 p-1 shadow-filter-button focus:outline-none">
              <FilterBtnIcon />
              <span className="text-sm font-medium text-gray-900">
                Filter
              </span>
              <FilterDownArrow />
            </PopoverButton>
            <div className="flex gap-3 overflow-hidden overflow-x-auto [&::-webkit-scrollbar]:hidden [&>*]:shrink-0 [&>*]:basis-[max-content]">
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
            <div className="flex items-center justify-end ps-12">
              <button
                onClick={async () => {
                  void onChange(defaultValues);
                  void handleApply(defaultValues);
                }}
                className="flex-shrink-0 text-sm font-medium text-blue-400"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
        <Popover.Panel className="absolute z-[99] mt-1 grid h-[520px] w-11/12 grid-cols-3 grid-rows-[auto,1fr] flex-col overflow-hidden rounded-xl bg-white shadow-popup lg:w-2/3 2xl:w-1/2">
          {({ close }) => (
            <>
              <div className="col-span-4 flex h-fit items-center justify-between border-b p-4">
                <p className="text-sm font-normal text-gray-900">
                Filters
                </p>
                <button
                  type="button"
                  className="h-7 w-7 rounded-lg border border-gray-400 bg-gray-100 align-middle hover:bg-gray-200"
                  data-testid="filter-drawer-close-btn"
                  onClick={() => {
                    close();
                  }}
                >
                  <CloseIcon className="inline-block stroke-gray-800" />
                </button>
              </div>
              <ul className="col-span-1 flex flex-col gap-2 border-e border-gray-300 bg-gray-25 px-2 pt-3">
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
                        className={`flex h-9 w-full items-center justify-start text-nowrap hover:rounded-lg hover:bg-blue-50 hover:text-blue-400 ${
                          key === active
                            ? 'rounded-lg bg-blue-50 font-medium text-blue-400'
                            : 'font-normal'
                        }`}
                      >
                        <div className="flex w-full items-center justify-start">
                          <div className="flex w-1/2 items-start justify-start">
                            <span className="px-4 text-sm">{title}</span>
                          </div>

                          <div className="flex w-1/3 items-end">
                            <div className="flex w-full items-end justify-end">
                              {!!badgeCount && (
                                <div className="flex w-full items-end justify-end px-1 py-2">
                                  <span className="flex h-6 w-6 flex-col justify-center rounded-full bg-blue-400 text-xs text-white">
                                    {badgeCount}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="w-1/12">
                            {key === active && (
                              <div className="flex items-center justify-center rtl:rotate-180">
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
              <div className="col-span-3 flex h-full flex-col gap-5 overflow-hidden">
                <activeFilterer.FilterComponent
                  title={activeFilterer.title}
                  value={value[active]}
                  onChange={async (filterValue) =>
                    onChange({ ...value, [active]: filterValue })
                  }
                  {...activeFilterer.extraProps}
                />
              </div>
              <div className="col-span-4 flex h-14 items-center justify-end gap-5 border-t px-5">
                <button
                  className={`text-sm font-semibold ${
                    disableResetButton ? 'text-gray-500' : 'text-blue-400'
                  } `}
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
                  className='bg-blue-400 hover:bg-blue-500 text-white disabled:text-gray-500 active:bg-blue-600 disabled:bg-gray-200 disabled:cursor-not-allowed h-10 px-3 py-2'
                  disabled={disableApplyFilterButton}
                  // isLoading={isApplyLoading}
                  onClick={async () => {
                    await handleApply(value);
                    close();
                  }}
                >
                 Apply 
                </button>
              </div>
            </>
          )}
        </Popover.Panel>
      </Popover>
    </FilterContext.Provider>
  );
}
