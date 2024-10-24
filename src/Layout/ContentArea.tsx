import Sidebar from './Sidebar';
import {Slot} from "@wordpress/components";

const ContentArea = ( { children } ) => {
    return (
        <>
            <Sidebar />
            <div className="dokan-layout-content-area">
                <Slot name="dokan-layout-content-area-before" />
                { children }
                <Slot name="dokan-layout-content-area-after" />
            </div>
        </>
    );
};

export default ContentArea;
