// Reusable toggle switch component
import { ToggleSwitch } from '@getdokan/dokan-ui';

const DokanToggleSwitch = ( {
    enabled,
    onChange,
    label = 'Enabled',
    title,
    description,
} ) => {
    return (
        <div className="border bor-[#E9E9E9] flex justify-between items-center  p-4 w-full ">
            <div className="flex flex-col">
                <h2 className="text-base leading-6 font-semibold text-gray-900">
                    { title }
                </h2>
                <p className="mt-1.5 text-sm text-[#828282] mb-2">
                    { description }
                </p>
            </div>
            <ToggleSwitch
                checked={ enabled }
                onChange={ onChange }
                label={ label }
                color="primary"
            />
        </div>
    );
};

export default DokanToggleSwitch;
