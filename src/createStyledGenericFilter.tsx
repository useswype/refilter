import { GenericFilter, type GenericFilterClassNames, type GenericFilterProps } from './GenericFilter';

export function createStyledGenericFilter(
  styles: GenericFilterClassNames
): typeof GenericFilter {
  return function GenericFilterWithStyles<T extends Record<string, any>>(
    props: GenericFilterProps<T>
  ) {
    return <GenericFilter {...props} classNames={styles} />;
  };
}
