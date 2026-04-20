import { DokanTooltip as Tooltip } from '@src/components';
import { Info } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface SectionProps {
    title: string;
    sectionHeader?: JSX.Element;
    children?: JSX.Element;
    tooltip?: string;
    className?: string;
}
function Section( {
    title,
    sectionHeader,
    children,
    tooltip = '',
    className = '',
}: SectionProps ) {
    return (
        <div className={ twMerge( 'mt-8', className ) }>
            <div className="flex justify-between mb-3">
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
