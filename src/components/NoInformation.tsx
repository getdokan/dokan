import { Card } from '@getdokan/dokan-ui';
import { File } from 'lucide-react';
import { __ } from '@wordpress/i18n';
interface NoInformationProps {
    icon?: JSX.Element;
    title?: string;
    description?: string;
}

function NoInformation( props: NoInformationProps ) {
    return (
        <Card className="flex flex-col items-center justify-center min-h-[500px] w-full bg-white shadow">
            <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-[#EFEAFF] rounded-full flex items-center justify-center text-[#7047EB]">
                    { props.icon ?? <File /> }
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mt-6">
                    { props.title ??
                        __( 'No Information Available', 'dokan-lite' ) }
                </h3>

                <span className="text-gray-500 text-center max-w-xs !m-0">
                    { props.description ??
                        __( 'Information needs to be updated', 'dokan-lite' ) }
                </span>
            </div>
        </Card>
    );
}

export default NoInformation;
