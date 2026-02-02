import { createContext, useContext } from 'react';
import { Filterer } from './UnstyledGenericFilter';

interface FilterData<T> {
  value: T;
  onChange: (value: T) => void;
}

export const FilterContext = createContext({});

export function useFilter<T>(): FilterData<T> {
  return useContext(FilterContext) as FilterData<T>;
}


/**
 * Stringifies filter values into a URL-safe query string format.
 * Filters out null and undefined values to keep URLs clean.
 *
 * @param value - The current filter values object
 * @param filterItemArray - Array of filter item entries with their configurations
 * @param defaultValues - Default values for each filter
 * @returns URL-encoded query string of non-default filter values
 */
export function encodeFilters<T extends Record<string, any>>(
  value: T,
  filterItemArray: ReadonlyArray<readonly [keyof T, Filterer<T, keyof T>]>,
  defaultValues: T
): string {
  const filterEntries = filterItemArray
    .map(([key, filter]) => [
      key,
      filter.FilterComponent.encode(value[key], defaultValues[key]),
    ])
    .filter(([, stringValue]) => stringValue != null);

  const params = new URLSearchParams();
  filterEntries.forEach(([key, stringValue]) => {
    params.set(key as string, stringValue as string);
  });

  return params.toString();
}

/**
 * Parses a query string into filter values object.
 * Uses each filter's parse method to convert string values back to their proper types.
 *
 * @param queryString - The URL query string to parse
 * @param filterItemArray - Array of filter item entries with their configurations
 * @param defaultValues - Default values to use when parsing fails or values are missing
 * @returns Parsed filter values object
 */
export function decodeFilters<T extends Record<string, any>>(
  queryString: string,
  filterItemArray: ReadonlyArray<readonly [keyof T, Filterer<T, keyof T>]>,
  defaultValues: T
): T {
  const params = new URLSearchParams(queryString);

  const filterEntries = filterItemArray.map(([key, filter]) => [
    key,
    filter.FilterComponent.decode(
      params.get(key as string) ?? '',
      defaultValues[key]
    ),
  ]);

  return Object.fromEntries(filterEntries) as T;
}

/**
 * Resets all filters to their default values.
 *
 * @param defaultValues - The default values for all filters
 * @param setAppliedFilterValue - State setter for applied filter values
 * @param onChange - Callback to notify parent component of filter changes
 */
export function resetFilters<T extends Record<string, any>>(
  defaultValues: T,
  setAppliedFilterValue: (value: T) => void,
  onChange: (value: T) => void | Promise<void>
): void {
  setAppliedFilterValue(defaultValues);
  void onChange(defaultValues);
}

/**
 * Applies filter values without triggering the onApply callback.
 * Used for programmatic filter application (e.g., from URL parameters).
 *
 * @param value - The filter values to apply
 * @param setValue - State setter for current filter values
 * @param setAppliedFilterValue - State setter for applied filter values
 */
export function applyFilters<T extends Record<string, any>>(
  value: T,
  setValue: (value: T) => void,
  setAppliedFilterValue: (value: T) => void
): void {
  setValue(value);
  setAppliedFilterValue(value);
}
