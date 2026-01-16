import { twMerge } from 'tailwind-merge';
import  DokanTooltip from '../DokanTooltip';
import { RawHTML } from '@wordpress/element';
import { Info, TriangleAlert } from 'lucide-react';

interface InputLabelProps {
    title: string;
    titleFontWeight?: 'light' | 'bold';
    tooltip?: string;
    suffix?: string;
    icon?: string;
    helperText?: string;
    htmlFor?: string;
    wrapperClassNames?: string;
    labelClassName?: string;
    imageUrl?: string;
    fieldType?: string;
}

const DokanBaseFieldLabel = ( {
    title,
    titleFontWeight = 'bold',
    tooltip,
    suffix,
    helperText,
    htmlFor,
    wrapperClassNames,
    labelClassName = '',
    imageUrl,
    fieldType,
}: InputLabelProps ) => {
    return (
        <div
            className={ twMerge(
                `flex gap-4 max-w-3xl`,
                imageUrl ? 'items-center' : 'items-start',
                wrapperClassNames
            ) }
        >
            { imageUrl && (
                <img src={ imageUrl } alt={ title } className="max-w-20" />
            ) }
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-4">
                    <label
                        htmlFor={ htmlFor }
                        className={ twMerge(
                            `text-sm ${
                                titleFontWeight === 'bold'
                                    ? 'font-bold'
                                    : 'font-light'
                            } `,
                            labelClassName,
                            fieldType === 'error' &&
                                'text-[#9F2225] flex gap-2.5 items-center'
                        ) }
                    >
                        { typeof title === 'string' ? (
                            <RawHTML>{ title }</RawHTML>
                        ) : (
                            title
                        ) }
                        { fieldType === 'error' && (
                            <TriangleAlert size={ 16 } color={ '#E6455E' } />
                        ) }
                    </label>
                    { tooltip && (
                        <span className="flex items-center">
                            <DokanTooltip
                                content={ <RawHTML>{ tooltip }</RawHTML> }
                            >
                                <Info size={ '1rem' } />
                            </DokanTooltip>
                        </span>
                    ) }
                    { suffix && <span>{ suffix }</span> }
                </div>
                { helperText && (
                    <div>
                        { typeof helperText === 'string' ? (
                            <p
                                className={ twMerge(
                                    'text-sm font-light',
                                    fieldType === 'error' && 'text-[#9F2225]'
                                ) }
                            >
                                <RawHTML>{ helperText }</RawHTML>
                            </p>
                        ) : null }
                    </div>
                ) }
            </div>
        </div>
    );
};

export default DokanBaseFieldLabel;
