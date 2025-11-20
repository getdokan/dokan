import { Card, DokanToaster } from "@getdokan/dokan-ui";
import { __ } from "@wordpress/i18n";
import HeaderImage from "admin/dashboard/pages/dummy-data/HeaderImage";
import Importer from "admin/dashboard/pages/dummy-data/Importer";
import Result from "admin/dashboard/pages/dummy-data/Result";

function Index(props) {
    return (
        <div className="w-full md:w-[658px] m-auto">
            <h2 className="ont-bold font-[700] text-[24px] text-[#25252D] mb-[24px]">
                { __( 'Dummy data', 'dokan-lite' ) }
            </h2>
            <Card className="bg-white rounded-[6px] border border-[#E9E9E9]">
                <div className="p-[24px] flex items-start justify-between border-b border-[#E9E9E9]">
                    <div className="w-1/2">
                        <h2 className="font-[700] text-[18px] text-[#25252D] mb-[10px]">
                            { __(
                                'Import dummy vendors and products',
                                'dokan-lite'
                            ) }
                        </h2>
                        <p className="font-[400] text-[14px] text-[#828282]">
                            { __(
                                'This tool allows you to import vendor and some products for vendors to your marketplace.',
                                'dokan-lite'
                            ) }
                        </p>
                    </div>
                    <div>
                        <HeaderImage />
                    </div>
                </div>

                {/*{ sections.map( ( section ) => {*/}
                {/*    const Component = section.component;*/}
                {/*    return <div className="border-b border-[#E9E9E9]" key={ section.id }><Component key={ section.id } { ...props } /></div>;*/}
                {/*} ) }*/}

                {/*<Importer />*/}
                <Result />

                { /* Distance Matrix API Test UI can be implemented later; omitted for minimal viable migration */ }
            </Card>

            <DokanToaster />
        </div>
    );
}

export default Index;
