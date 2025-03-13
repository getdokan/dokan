import { SimpleCheckboxGroup } from '@getdokan/dokan-ui';

const DokanCheckboxGroup = ( {
    options = [],
    defaultValue = [],
    name = 'checkboxGroup',
    label = 'Checkbox Group',
    onChange = () => {},
} ) => {
    return (
        <SimpleCheckboxGroup
            defaultValue={ defaultValue }
            name={ name }
            onChange={ onChange }
            options={ options }
            label={ label }
        />
    );
};

export default DokanCheckboxGroup;
