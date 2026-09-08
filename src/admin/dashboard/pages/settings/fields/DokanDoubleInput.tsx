import { Input, useSettings, type SettingsElement } from '@wedevs/plugin-ui';
import { twMerge } from 'tailwind-merge';

type DoubleInputValue = {
    first?: string | number;
    second?: string | number;
};

type Props = {
    element: SettingsElement;
};

export default function DokanDoubleInput( { element }: Props ) {
    const { updateValue } = useSettings();

    const value: DoubleInputValue =
        ( element.value as DoubleInputValue ) ||
        ( element.default as DoubleInputValue ) ||
        {};

    const firstValue = value.first ?? element.firstValue ?? '';
    const secondValue = value.second ?? element.secondValue ?? '';

    const setPart = ( part: 'first' | 'second', val: string ): void => {
        // No guard needed: `id` is always present on field elements.
        updateValue( element.id, {
            ...value,
            [ part ]: val,
        } );
    };

    return (
        <div
            className={ twMerge(
                'flex justify-between p-4 items-center gap-4',
                element.className as string
            ) }
        >
            <div className="flex flex-col gap-1">
                { ( element.label || element.title ) && (
                    <span className="text-sm font-semibold text-foreground">
                        { element.label || element.title }
                    </span>
                ) }
                { element.description && (
                    <span className="text-xs text-muted-foreground leading-relaxed">
                        { element.description }
                    </span>
                ) }
            </div>
            <div className="flex gap-3 shrink-0">
                <Input
                    type={
                        ( element.firstValueType as string | undefined ) ||
                        'text'
                    }
                    value={ String( firstValue ) }
                    onChange={ ( e ) => setPart( 'first', e.target.value ) }
                    placeholder={
                        element.firstPrefix
                            ? String( element.firstPrefix )
                            : undefined
                    }
                    className="max-w-32"
                />
                <Input
                    type={
                        ( element.secondValueType as string | undefined ) ||
                        'text'
                    }
                    value={ String( secondValue ) }
                    onChange={ ( e ) => setPart( 'second', e.target.value ) }
                    placeholder={
                        element.secondPrefix
                            ? String( element.secondPrefix )
                            : undefined
                    }
                    className="max-w-32"
                />
            </div>
        </div>
    );
}
