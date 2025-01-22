import {Slot} from "@wordpress/components";
import {useNavigate} from "react-router-dom";

const Header = ( { title = '' } ) => {
    const navigate = useNavigate();

    return (
        <div className="flex items-center sm:flex-wrap md:flex-nowrap mb-4">
            <Slot name="dokan-before-header" />
            <div className="dokan-header-title flex-1">
                { title && (<h1 className="text-3xl font-semibold text-gray-800 dark:text-white md:text-4xl lg:text-4xl">{title}</h1>)}
            </div>
            <div className="dokan-header-actions flex flex-1 gap-2.5 md:justify-end">
                <Slot name="dokan-header-actions" fillProps={ { navigate } }/>
            </div>
            <Slot name="dokan-after-header"/>
        </div>
    );
};

export default Header;
