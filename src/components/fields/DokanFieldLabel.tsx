import { twMerge } from 'tailwind-merge';
import DokanTooltip from './DokanTooltip';
import { RawHTML } from '@wordpress/element';
import parse from 'html-react-parser';

interface InputLabelProps {
    title: string;
    titleFontWeight?: 'light' | 'bold';
    tooltip?: React.ReactNode | string;
    suffix?: React.ReactNode;
    icon?: React.ReactNode;
    helperText?: React.ReactNode | string;
    htmlFor?: string;
    wrapperClassNames?: string;
    labelClassName?: string;
}

const DokanBaseFieldLabel = ( {
    title,
    titleFontWeight = 'bold',
    tooltip,
    suffix,
    icon,
    helperText,
    htmlFor,
    wrapperClassNames,
    labelClassName = '',
}: InputLabelProps ) => {
    return (
        <div
            className={ twMerge(
                `flex items-start gap-2 `,
                wrapperClassNames
            ) }
        >
            { icon && (
                <div className="flex items-center ">{ parse( icon ) }</div>
            ) }
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-4">
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
                        <RawHTML> { title } </RawHTML>
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
                            <p className="text-sm font-light">
                                <RawHTML>{ helperText }</RawHTML>
                            </p>
                        ) : (
                            helperText
                        ) }
                    </div>
                ) }
            </div>
        </div>
    );
};

export default DokanBaseFieldLabel;
