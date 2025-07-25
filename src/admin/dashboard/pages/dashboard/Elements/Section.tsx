import { Tooltip } from '@getdokan/dokan-ui';
import { twMerge } from 'tailwind-merge';
import { Info } from 'lucide-react';

interface SectionProps {
    title: string;
    sectionHeader?: JSX.Element;
    children?: JSX.Element;
    tooltip?: string;
}
function Section( {
    title,
    sectionHeader,
    children,
    tooltip = '',
}: SectionProps ) {
    return (
        <div className="mt-8">
            <div className="flex justify-between mb-2">
                <div className="flex flex-row items-end">
                    <div className={ `flex items-center` }>
                        <h3 className="font-semibold text-base text-black">
                            { title }
                        </h3>
                        { tooltip && (
                            <Tooltip content={ tooltip }>
                                <Info
                                    size="18"
                                    className="text-[#9EA3A8] ml-2"
                                />
                            </Tooltip>
                        ) }
                    </div>
                </div>
                { sectionHeader && <div>{ sectionHeader }</div> }
            </div>
            <div>{ children }</div>
        </div>
    );
}

export default Section;
