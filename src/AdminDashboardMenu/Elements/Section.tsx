import { Tooltip } from '@getdokan/dokan-ui';
import { CircleAlert } from 'lucide-react';

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
        <div className="mt-4">
            <div className="flex justify-between mb-2">
                <div className="flex flex-row items-end">
                    <h3 className="font-semibold text-md text-black">
                        { title }
                    </h3>
                    { tooltip && (
                        <Tooltip content={ tooltip }>
                            <CircleAlert
                                size="18"
                                className="text-[#9EA3A8] ml-2"
                            />
                        </Tooltip>
                    ) }
                </div>
                { sectionHeader && <div>{ sectionHeader }</div> }
            </div>
            <div>{ children }</div>
        </div>
    );
}

export default Section;
