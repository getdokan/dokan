import { SimpleCheckboxGroup } from '@getdokan/dokan-ui';

const CheckboxGroup = ( {
    options = [],
    defaultValue = [],
    name = 'checkboxGroup',
    onChange = () => {},
    title = 'Checkbox Group',
    description = 'Select options from the list',
} ) => {
    return (
        <div className="border bor-[#E9E9E9] flex justify-between flex-col items-start  p-4 w-full ">
            <div className="flex flex-col">
                <h2 className="text-base leading-6 font-semibold text-gray-900">
                    { title }
                </h2>
                <p className="mt-1.5 text-sm text-[#828282] mb-2">
                    { description }
                </p>
            </div>
            <SimpleCheckboxGroup
                defaultValue={ defaultValue }
                name={ name }
                onChange={ onChange }
                options={ options }
                className="focus:outline-noneoutline-none"
            />
        </div>
    );
};

export default CheckboxGroup;
