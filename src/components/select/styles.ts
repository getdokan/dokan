const styles = {
    control: ( base: any ) => ( {
        ...base,
        borderRadius: '0.40rem',
        minHeight: '2.5rem',
        boxShadow: 'none',
        marginTop: -1,
        outline: 'none',
        ':focus': { outline: 'none' },
        ':focus-within': { outline: 'none' },
        borderColor: base.borderColor,
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
    menuPortal: ( base: any ) => ( {
        ...base,
        zIndex: 9999,
        wordBreak: 'break-all',
        minWidth: '18.75rem',
    } ),
    menu: ( base: any ) => ( {
        ...base,
        zIndex: 9999,
        wordBreak: 'break-all',
    } ),
    menuList: ( base: any ) => ( {
        ...base,
        cursor: 'default',
    } ),
    option: ( base: any, state: any ) => {
        return {
            ...base,
            cursor: state.isDisabled ? 'not-allowed' : 'pointer',
            backgroundColor: state.isSelected
                ? 'var(--colors-primary-50)'
                : base.backgroundColor,
            ':active': {
                ...base[ ':active' ],
                backgroundColor: state.isSelected
                    ? 'var(--colors-primary-100)'
                    : base[ ':active' ]?.backgroundColor,
            },
            ':hover': {
                ...base[ ':hover' ],
                backgroundColor: state.isSelected
                    ? 'var(--colors-primary-200)'
                    : base[ ':hover' ]?.backgroundColor,
            },
            color: state.isSelected ? 'var(--colors-primary-800)' : base.color,
        };
    },
} as const;

export default styles;
