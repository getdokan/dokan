import { AsyncSearchableSelect, ReactSelect } from '@getdokan/dokan-ui';

function DokanAsyncSelect( props ) {
    const Control = ( controlProps: any ) => {
        const { children, selectProps } = controlProps;
        const { components } = ReactSelect;
        return (
            <components.Control { ...controlProps }>
                { selectProps.leftIcon ? (
                    <span
                        style={ {
                            display: 'flex',
                            alignItems: 'center',
                            marginLeft: 15,
                        } }
                    >
                        { selectProps.leftIcon }
                    </span>
                ) : null }
                <div
                    style={ {
                        marginLeft: selectProps.leftIcon ? 6 : 0,
                        flex: 1,
                        display: 'flex',
                    } }
                >
                    { children }
                </div>
            </components.Control>
        );
    };

    const styles = {
        control: ( base: any ) => ( {
            ...base,
            borderRadius: '0.40rem',
            minHeight: '2.5rem',
            boxShadow: 'none',
            marginTop: -1,
        } ),
        placeholder: ( base: any ) => ( {
            ...base,
            fontSize: 14,
            lineHeight: '22px',
        } ),
        singleValue: ( base: any ) => ( {
            ...base,
            fontSize: 14,
            lineHeight: '22px',
        } ),
        input: ( base: any ) => ( {
            ...base,
            fontSize: 14,
            lineHeight: '22px',
            marginTop: 1,
            marginBottom: 1,
        } ),
        valueContainer: ( base: any ) => ( { ...base, paddingLeft: 4 } ),
        indicatorsContainer: ( base: any ) => ( {
            ...base,
            cursor: 'pointer',
        } ),
        menuList: ( base: any ) => ( {
            ...base,
            cursor: 'default',
        } ),
        option: ( base: any ) => {
            return {
                ...base,
                cursor: 'pointer',
            };
        },
    } as const;

    return (
        <AsyncSearchableSelect
            // @ts-ignore
            components={ {
                Control,
                // @ts-ignore
                ...( props?.components ? props.components : {} ),
            } }
            styles={ styles }
            className="shadow-none"
            { ...props }
        />
    );
}

export default DokanAsyncSelect;
