/** Application-owned conversion functions and the default for one filter. */
export interface FilterField<T> {
  defaultValue: T;
  encode: (value: T, defaultValue: T) => string | null;
  decode: (raw: string, defaultValue: T) => T;
}

// Each field has its own value type; consumers retain it through the schema.
export type FilterSchema = Record<string, FilterField<any>>;
export type FilterKey<S extends FilterSchema> = Extract<keyof S, string>;
export type InferFilterValues<S extends FilterSchema> = {
  [K in keyof S]: ReturnType<S[K]['decode']>;
};

/** Infer values from the functions, checking defaults without narrowing them. */
export function defineFilterSchema<T extends Record<string, unknown>>(schema: {
  [K in keyof T]: {
    defaultValue: NoInfer<T[K]>;
    encode: (value: T[K], defaultValue: NoInfer<T[K]>) => string | null;
    decode: (raw: string, defaultValue: NoInfer<T[K]>) => T[K];
  };
}): { [K in keyof T]: FilterField<T[K]> } {
  return schema;
}

export interface FilterOptions<K extends string> {
  keys?: readonly K[];
}

/** Encode selected fields using the application's functions and URLSearchParams. */
export function encodeFilters<
  S extends FilterSchema,
  K extends FilterKey<S> = FilterKey<S>,
>(
  values: Pick<InferFilterValues<NoInfer<S>>, NoInfer<K>>,
  schema: S,
  options?: FilterOptions<K>
): string {
  const params = new URLSearchParams();
  for (const key of options?.keys ?? Object.keys(schema)) {
    const field = schema[key];
    const raw = field.encode(values[key as K], field.defaultValue);
    if (raw !== null) params.set(key, raw);
  }
  return params.toString();
}

/** Decode each selected field independently, falling back if its decoder throws. */
export function decodeFilters<
  S extends FilterSchema,
  K extends FilterKey<S> = FilterKey<S>,
>(
  encoded: string,
  schema: S,
  options?: FilterOptions<K>
): Pick<InferFilterValues<S>, K> {
  const params = new URLSearchParams(encoded);
  return Object.fromEntries(
    (options?.keys ?? Object.keys(schema)).map((key) => {
      const field = schema[key];
      try {
        return [key, field.decode(params.get(key) ?? '', field.defaultValue)];
      } catch {
        return [key, field.defaultValue];
      }
    })
  ) as Pick<InferFilterValues<S>, K>;
}
