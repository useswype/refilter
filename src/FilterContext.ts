import { createContext, useContext } from 'react';

interface FilterData<T> {
  value: T;
  onChange: (value: T) => void;
}

export const FilterContext = createContext({});

export function useFilter<T>(): FilterData<T> {
  return useContext(FilterContext) as FilterData<T>;
}
