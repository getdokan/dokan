import { ReactSelect } from "@getdokan/dokan-ui";
import { ChevronDown } from "lucide-react";

const DropdownIndicator = ( indicatorProps: any ) => {
    const { components } = ReactSelect;

    return (
        <components.DropdownIndicator { ...indicatorProps }>
            <div className="text-gray-400">
                <ChevronDown size={ 16 } />
            </div>
        </components.DropdownIndicator>
    );
};

export default DropdownIndicator;
