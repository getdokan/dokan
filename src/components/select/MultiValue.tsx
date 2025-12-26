import { ReactSelect } from '@getdokan/dokan-ui';

// Hide multi-value chips entirely
const MultiValue = ( multiProps: any ) => {
    const { components } = ReactSelect;
    const isMulti = Boolean( multiProps?.selectProps?.isMulti );

    // Hide chips entirely for multi-select to avoid duplicate text next to summary
    if ( isMulti ) {
        return null;
    }
    return <components.MultiValue { ...multiProps } />;
};

export default MultiValue;
