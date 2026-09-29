/** Conversion functions and the default value for one filter. */
export interface FilterField<T> {
  defaultValue: T;
  encode: (value: T, defaultValue: T) => string | null;
  decode: (raw: string, defaultValue: T) => T;
}

export type FilterSchema<T extends Record<string, any>> = {
  [K in keyof T]: FilterField<T[K]>;
};

/**
 * Stringifies filter values into a URL-safe query string format.
 * Filters out null and undefined values to keep URLs clean.
 *
 * @param values - The current filter values object
 * @param schema - Conversion functions and default values for each filter
 * @returns URL-encoded query string of non-default filter values
 */
export function encode<T extends Record<string, any>>(
  values: T,
  schema: FilterSchema<T>
): string {
  const params = new URLSearchParams();
  for (const key of Object.keys(schema)) {
    const field = schema[key];
    const raw = field.encode(values[key], field.defaultValue);
    if (raw != null) params.set(key, raw);
  }
  return params.toString();
}

/**
 * Parses a query string into filter values object.
 * Uses each filter's parse method to convert string values back to their proper types.
 *
 * @param encoded - The URL query string to parse
 * @param schema - Conversion functions and default values for each filter
 * @returns Parsed filter values object
 */
export function decode<T extends Record<string, any>>(
  encoded: string,
  schema: FilterSchema<T>
): T {
  const params = new URLSearchParams(encoded);
  return Object.fromEntries(
    Object.keys(schema).map((key) => {
      const field = schema[key];
      return [key, field.decode(params.get(key) ?? '', field.defaultValue)];
    })
  ) as T;
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
