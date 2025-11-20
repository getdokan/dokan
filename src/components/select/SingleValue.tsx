import { ReactSelect } from '@getdokan/dokan-ui';

const SingleValue = ( singleValueProps: any ) => {
    const { components } = ReactSelect;
    const { selectProps, data } = singleValueProps as {
        selectProps: {
            selectedTitle?: string | ( ( option: any ) => string );
            isMulti?: boolean;
        };
        data: { label?: string };
    };

    const isMulti = Boolean( selectProps?.isMulti );
    const selectedTitle = selectProps?.selectedTitle;

    let content = singleValueProps.children as React.ReactNode;

    if ( ! isMulti && selectedTitle && data ) {
        const prefix =
            typeof selectedTitle === 'function'
                ? selectedTitle( data as any )
                : selectedTitle;
        const label: any = ( data as any )?.label ?? content;
        content = prefix ? (
            <span title={ `${ prefix }: ${ label }` }>
                { prefix }: { label }
            </span>
        ) : (
            <span title={ `${ label }` }>{ label }</span>
        );
    }

    return (
        <components.SingleValue { ...singleValueProps }>
            { content }
        </components.SingleValue>
    );
};

export default SingleValue;
