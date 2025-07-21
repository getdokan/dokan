import { Card } from '@getdokan/dokan-ui';
import { File } from 'lucide-react';
import { __ } from '@wordpress/i18n';
import { twMerge } from 'tailwind-merge';
interface NoInformationProps {
    icon?: JSX.Element;
    title?: string;
    description?: string;
    className?: string;
    contentClassName?: string;
    textContentClassName?: string;
    iconClassName?: string;
    titleClassName?: string;
    descriptionClassName?: string;
}

function NoInformation( props: NoInformationProps ) {
    return (
        <Card
            className={ twMerge(
                'flex flex-col items-center justify-center space-y-4 min-h-[500px] w-full bg-white shadow',
                props?.className ?? ''
            ) }
        >
            <div
                className={ twMerge(
                    'flex flex-col items-center space-y-4',
                    props?.contentClassName ?? ''
                ) }
            >
                <div
                    className={ twMerge(
                        'w-16 h-16 bg-[#EFEAFF] rounded-full flex items-center justify-center text-[#7047EB]',
                        props?.iconClassName ?? ''
                    ) }
                >
                    { props.icon ?? <File /> }
                </div>

                <div
                    className={ twMerge(
                        '!m-0 flex flex-col justify-center',
                        props?.textContentClassName ?? ''
                    ) }
                >
                    <h3
                        className={ twMerge(
                            'text-lg font-semibold text-gray-900 mt-6',
                            props?.titleClassName ?? ''
                        ) }
                    >
                        { props.title ??
                            __( 'No Information Available', 'dokan-lite' ) }
                    </h3>

                    <span
                        className={ twMerge(
                            'text-gray-500 text-center max-w-xs !m-0',
                            props?.descriptionClassName ?? ''
                        ) }
                    >
                        { props.description ??
                            __(
                                'Information needs to be updated',
                                'dokan-lite'
                            ) }
                    </span>
                </div>
            </div>
        </Card>
    );
}

export default NoInformation;
