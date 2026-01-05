import { ReactSelect } from '@getdokan/dokan-ui';
import { Check } from 'lucide-react';

// Add a checkbox in options list
const Option = ( optionProps: any ) => {
    const { components } = ReactSelect;
    const { isSelected, isDisabled } = optionProps;

    if ( ! optionProps.isMulti ) {
        return <components.Option { ...optionProps } />;
    }
    return (
        <components.Option { ...optionProps }>
            <div className="dokan-layout">
                <div className="flex items-center gap-2">
                    <span
                        className={
                            'inline-flex h-4 w-4 items-center justify-center rounded border ' +
                            ( isSelected
                                ? '!bg-dokan-btn !border-dokan-btn'
                                : '!bg-white !border-gray-300' ) +
                            ( isDisabled ? ' opacity-50' : '' )
                        }
                    >
                        <Check size={ 16 } color="white" />
                    </span>
                    <span>{ optionProps.label }</span>
                </div>
            </div>
        </components.Option>
    );
};

export default Option;
