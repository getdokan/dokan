import { ReactSelect } from '@getdokan/dokan-ui';

// Render a single-line summary for multi-select instead of chips
const ValueContainer = ( valueProps: any ) => {
    const { components } = ReactSelect;
    const { selectProps, hasValue } = valueProps as any;
    const isMulti = Boolean( selectProps?.isMulti );
    if ( ! isMulti ) {
        return <components.ValueContainer { ...valueProps } />;
    }
    const values: any[] = ( selectProps?.value as any[] ) || [];
    const labels = values.map( ( v ) => v?.label ?? '' );

    const titlePrefix = selectProps?.selectedTitle;
    const summary = labels.join( ', ' );
    // Keep the input so user can type; hide chips via MultiValue override
    return (
        <components.ValueContainer { ...valueProps }>
            { hasValue ? (
                <div className="break-all text-[14px] leading-[22px] text-gray-700">
                    { titlePrefix ? (
                        <span className="font-normal">
                            { `${ String( titlePrefix ) }: ` }
                        </span>
                    ) : null }
                    <span className="align-middle" title={ summary }>
                        { summary }
                    </span>
                </div>
            ) : null }
            { valueProps.children }
        </components.ValueContainer>
    );
};

export default ValueContainer;
