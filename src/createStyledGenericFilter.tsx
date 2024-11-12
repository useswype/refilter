import { 
  UnStyledGenericFilter, 
  type GenericFilterClassNames,
  type GenericFilterProps 
} from './UnstyledGenericFilter';
  
const defaultStyles: GenericFilterClassNames = {
  filterContainer: 'flex overflow-hidden',
  filterContent: 'flex items-center gap-4 overflow-x-auto',
  filterButton:
    'flex items-center justify-center gap-1 rounded-lg border border-gray-200 p-1 shadow-filter-button focus:outline-none',
  filterItemsContainer:
    'flex gap-3 overflow-hidden overflow-x-auto [&::-webkit-scrollbar]:hidden [&>*]:shrink-0 [&>*]:basis-[max-content]',
  filterButtonTitle: 'text-sm font-medium text-gray-900',
  resetFilterContainer: 'flex items-center justify-end ps-12',
  resetFilterTitle: 'flex-shrink-0 text-sm font-medium text-blue-400',
  filterModalContainer:
    'absolute z-[99] mt-1 grid h-[520px] w-11/12 grid-cols-3 grid-rows-[auto,1fr] flex-col overflow-hidden rounded-xl bg-white shadow-popup lg:w-2/3 2xl:w-1/2',
  filterHeader:
    'col-span-4 flex h-fit items-center justify-between border-b p-4',
  filterHeaderTitle: 'text-sm font-normal text-gray-900',
  closeButton:
    'h-7 w-7 rounded-lg border border-gray-400 bg-gray-100 align-middle hover:bg-gray-200',
  filterItemsList:
    'col-span-1 flex flex-col gap-2 border-e border-gray-300 bg-gray-25 px-2 pt-3',
  resetAll: (isDisabled) =>
    `text-sm font-semibold  ${isDisabled ? 'text-gray-500' : 'text-blue-400'} `,

  applyButton:
    'bg-blue-400 hover:bg-blue-500 text-white disabled:text-gray-500 active:bg-blue-600 disabled:bg-gray-200 disabled:cursor-not-allowed h-10 px-3 py-2',

  filterFooter:
    'col-span-4 flex h-14 items-center justify-end gap-5 border-t px-5',
  filterItem: (isActive) =>
    `flex h-9 w-full items-center justify-start text-nowrap hover:rounded-lg hover:bg-blue-50 
      hover:text-blue-400 ${isActive === true ? 'rounded-lg bg-blue-50 font-medium text-blue-400' : 'font-normal'}`,
  filterItemContent: 'flex w-full items-center justify-start',
  filterItemTitle: 'flex w-1/2 items-start justify-start',
  badge: 'flex w-1/3 items-end',
  badgeContainer: 'flex w-full items-end justify-end',
  badgeTitleContainer: 'flex w-full items-end justify-end px-1 py-2',
  badgeTitle:
    'flex h-6 w-6 flex-col justify-center rounded-full bg-blue-400 text-xs text-white',
  filterItemArrowContainer: 'w-1/12',
  filterItemArrow: 'flex items-center justify-center rtl:rotate-180',
  filterComponentContainer:
    'col-span-3 flex h-full flex-col gap-5 overflow-hidden',
};

export function createStyledGenericFilter(
  styles: GenericFilterClassNames
): typeof UnStyledGenericFilter {
  return function GenericFilterWithStyles<T extends Record<string, any>>(
    props: GenericFilterProps<T>
  ) {
    return <UnStyledGenericFilter {...props} classNames={{...defaultStyles, ...styles}} />;
  };
}
