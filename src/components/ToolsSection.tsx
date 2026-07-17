import DokanButton from './Button';
import { twMerge } from 'tailwind-merge';

export type ToolSectionType = {
    id: string;
    name: string;
    desc: string;
    button: string;
    [ key: string ]: unknown;
};

// A single section ("card row") on the admin Tools page. Shared from Dokan Lite
// so Dokan Pro can render its injected tool sections with the same look & feel as
// the free ones (consumed via `@dokan/components`).
function ToolsSection( {
    type,
    onClick,
    loading,
    disabled = false,
    showProgress = false,
    progressValue = 0,
    className = '',
    children = null,
}: {
    type: ToolSectionType;
    onClick: ( type: ToolSectionType ) => void;
    loading?: boolean;
    disabled?: boolean;
    showProgress?: boolean;
    progressValue?: number;
    className?: string;
    children?: React.ReactNode;
} ) {
    return (
        <div className={ twMerge( 'p-[24px]', className ) } id={ type?.id }>
            <div className="flex flex-col gap-[24px]">
                <div>
                    <h2 className="font-[700] text-[18px] text-[#25252D] mb-[10px]">
                        { type?.name }
                    </h2>
                    <p className="font-[400] text-[14px] text-[#828282]">
                        { type?.desc }
                    </p>
                </div>
                { showProgress && (
                    <div className="flex flex-row gap-[16px] items-center my-[4px]">
                        <progress
                            className="w-full h-[8px] [&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-value]:rounded-lg [&::-webkit-progress-bar]:bg-[#EFEAFF] [&::-webkit-progress-value]:bg-[#7047EB] [&::-moz-progress-bar]:bg-[#7047EB]"
                            value={ progressValue }
                            max={ 100 }
                        ></progress>
                        <span>{ progressValue }%</span>
                    </div>
                ) }
                { children }
                <div>
                    <DokanButton
                        disabled={ disabled || !! loading }
                        loading={ loading }
                        onClick={ () => onClick( type ) }
                        label={ type?.button }
                        className="!h-[28px] !font-[500] !text-[12px] !leading-[16px]"
                    />
                </div>
            </div>
        </div>
    );
}

export default ToolsSection;
