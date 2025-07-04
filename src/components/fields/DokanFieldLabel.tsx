import { twMerge } from 'tailwind-merge';
import DokanTooltip from './DokanTooltip';

interface InputLabelProps {
    title: string;
    titleFontWeight: 'light' | 'bold';
    tooltip?: React.ReactNode;
    suffix?: React.ReactNode;
    icon?: React.ReactNode;
    helperText?: React.ReactNode | string;
    htmlFor?: string;
    wrapperClassNames?: string;
    labelClassName?: string;
}

const DokanFieldLabel = ( {
    title,
    titleFontWeight = 'light',
    tooltip,
    suffix,
    icon,
    helperText,
    htmlFor,
    wrapperClassNames,
    labelClassName = '',
}: InputLabelProps ) => {
    return (
        <div className={ `flex  gap-4 ${ wrapperClassNames }` }>
            { icon && <div className="flex items-center">{ icon }</div> }
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                    <label
                        htmlFor={ htmlFor }
                        className={ twMerge(
                            ` text-sm ${
                                titleFontWeight === 'bold'
                                    ? 'font-bold'
                                    : 'font-light'
                            } `,
                            labelClassName
                        ) }
                    >
                        { title }
                    </label>
                    { tooltip && (
                        <span className="flex items-center">
                            <DokanTooltip message={ tooltip } />
                        </span>
                    ) }
                    { suffix && <span>{ suffix }</span> }
                </div>
                { helperText && (
                    <div>
                        { typeof helperText === 'string' ? (
                            <p className="text-sm ">{ helperText }</p>
                        ) : (
                            helperText
                        ) }
                    </div>
                ) }
            </div>
        </div>
    );
};

export default DokanFieldLabel;
