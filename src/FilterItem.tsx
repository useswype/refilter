import { type ReactElement } from 'react';
import FilterItemArrow from './assets/filter_item_arrow.svg';

interface FilterItemProps<K> {
  itemKey: K;
  title: string;
  badgeCount: number;
  isActive: boolean;
  onSelect: (key: K) => void;
  classNames: {
    filterItem?: (isActive: boolean) => string;
    filterItemContent?: string;
    filterItemTitle?: string;
    badge?: string;
    badgeContainer?: string;
    badgeTitleContainer?: string;
    badgeTitle?: string;
    filterItemArrowContainer?: string;
    filterItemArrow?: string;
  };
}

export function FilterItem<K>({
  itemKey,
  title,
  badgeCount,
  isActive,
  onSelect,
  classNames,
}: FilterItemProps<K>): ReactElement {
  return (
    <div key={`filter-button-${String(itemKey)}`}>
      <button
        onClick={() => onSelect(itemKey)}
        className={classNames.filterItem ? classNames.filterItem(isActive) : ''}
      >
        <div className={classNames.filterItemContent}>
          <div className={classNames.filterItemTitle}>
            <span className="px-4 text-sm">{title}</span>
          </div>

          <div className={classNames.badge}>
            <div className={classNames.badgeContainer}>
              {!!badgeCount && (
                <div className={classNames.badgeTitleContainer}>
                  <span className={classNames.badgeTitle}>
                    {badgeCount}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className={classNames.filterItemArrowContainer}>
            {isActive && (
              <div className={classNames.filterItemArrow}>
                <FilterItemArrow />
              </div>
            )}
          </div>
        </div>
      </button>
    </div>
  );
}
