import { type ReactElement } from 'react';
import Spinner from './assets/spinner.svg';

interface FilterFooterProps {
  disableResetButton: boolean;
  disableApplyButton: boolean;
  isApplyLoading: boolean;
  resetAllButtonTitle: string;
  applyFiltersButtonTitle: string;
  onReset: () => void;
  onApply: () => void;
  classNames?: {
    filterFooter?: string;
    resetAll?: (isDisabled: boolean) => string;
    applyButton?: string;
  };
}

export function FilterFooter({
  disableResetButton,
  disableApplyButton,
  isApplyLoading,
  resetAllButtonTitle,
  applyFiltersButtonTitle,
  onReset,
  onApply,
  classNames = {},
}: FilterFooterProps): ReactElement {
  return (
    <div className={classNames.filterFooter}>
      <button
        className={classNames.resetAll ? classNames.resetAll(disableResetButton) : ''} 
        disabled={disableResetButton}
        onClick={onReset}
      >
        {resetAllButtonTitle}
      </button>
      <button
        type="button"
        className={classNames.applyButton}
        disabled={disableApplyButton}
        onClick={onApply}
      >
        {isApplyLoading && <Spinner className="animate-spin"/>}
        {!isApplyLoading ? applyFiltersButtonTitle : ''}
      </button>
    </div>
  );
}
