import { useState } from '@wordpress/element';
import type { ChangeEvent } from 'react';
import { __ } from '@wordpress/i18n';
import {
    useSettings,
    Input,
    Textarea,
    LabeledCheckbox,
    Button,
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
    type SettingsElement,
} from '@wedevs/plugin-ui';
import { ChevronDown } from 'lucide-react';
import { RequiredBadge } from '@src/dashboard/settings/store/fields/shared';
import type { GatewayConfig, GatewayFieldConfig } from './types';

type GatewayValues = Record< string, Record< string, string | boolean > >;

// `payment_methods` variant — the accordion is driven entirely by `element.gateways`, so Pro adds methods without shipping React here.
const PaymentMethodsField = ( { element }: { element: SettingsElement } ) => {
    const { updateValue } = useSettings();
    const fieldKey = ( element.dependency_key as string ) || element.id;
    const gateways = ( element.gateways as GatewayConfig[] ) || [];
    const value = ( element.value as GatewayValues ) || {};

    const [ open, setOpen ] = useState< Record< string, boolean > >( {} );

    const toggle = ( id: string ) =>
        setOpen( ( prev ) => ( { ...prev, [ id ]: ! prev[ id ] } ) );

    const update = (
        gatewayId: string,
        key: string,
        fieldValue: string | boolean
    ) => {
        updateValue( fieldKey, {
            ...value,
            [ gatewayId ]: {
                ...( value[ gatewayId ] || {} ),
                [ key ]: fieldValue,
            },
        } );
    };

    const renderControl = (
        gateway: GatewayConfig,
        field: GatewayFieldConfig,
        id: string,
        current: string
    ) => {
        if ( 'select' === field.input ) {
            const options = field.options || [];

            return (
                <Select
                    items={ options }
                    value={ current || null }
                    onValueChange={ ( selected: string | null ) =>
                        update( gateway.id, field.key, selected ?? '' )
                    }
                >
                    <SelectTrigger id={ id } className="w-full bg-white">
                        <SelectValue
                            placeholder={ __( 'Select', 'dokan-lite' ) }
                        />
                    </SelectTrigger>
                    <SelectContent>
                        { options.map( ( option ) => (
                            <SelectItem
                                key={ option.value }
                                value={ option.value }
                            >
                                { option.label }
                            </SelectItem>
                        ) ) }
                    </SelectContent>
                </Select>
            );
        }

        if ( 'textarea' === field.input ) {
            return (
                <Textarea
                    id={ id }
                    className="min-h-[64px] bg-white"
                    placeholder={ field.placeholder }
                    value={ current }
                    onChange={ ( event: ChangeEvent< HTMLTextAreaElement > ) =>
                        update( gateway.id, field.key, event.target.value )
                    }
                />
            );
        }

        return (
            <Input
                id={ id }
                placeholder={ field.placeholder }
                value={ current }
                onChange={ ( event ) =>
                    update( gateway.id, field.key, event.target.value )
                }
            />
        );
    };

    const renderField = (
        gateway: GatewayConfig,
        field: GatewayFieldConfig
    ) => {
        const current = String( value[ gateway.id ]?.[ field.key ] ?? '' );
        const id = `${ fieldKey }-${ gateway.id }-${ field.key }`;

        return (
            <label
                key={ field.key }
                htmlFor={ id }
                className="flex flex-col gap-1.5 text-sm font-medium text-gray-700"
            >
                <span className="flex items-center gap-1">
                    { field.label }
                    { /* Marked, not enforced: a withdrawal needs it, onboarding lets the vendor come back for it. */ }
                    { field.required && <RequiredBadge /> }
                </span>
                { renderControl( gateway, field, id, current ) }
            </label>
        );
    };

    return (
        // No card chrome of its own — the engine's section card is the frame.
        <div className="flex w-full flex-col">
            { gateways.map( ( gateway, index ) => (
                <div
                    key={ gateway.id }
                    className={
                        index > 0 ? 'border-t border-gray-200' : undefined
                    }
                >
                    <button
                        type="button"
                        className="flex w-full cursor-pointer items-center justify-between gap-3 border-0 bg-transparent px-4 py-3"
                        aria-expanded={ !! open[ gateway.id ] }
                        onClick={ () => toggle( gateway.id ) }
                    >
                        <span className="flex items-center gap-3">
                            { gateway.logo && (
                                // The admin Withdraw icon set draws its own tinted rounded square.
                                <img
                                    src={ gateway.logo }
                                    alt=""
                                    className="h-8 w-8 rounded-md object-contain"
                                />
                            ) }
                            <span className="text-sm font-medium text-gray-900">
                                { gateway.title }
                            </span>
                        </span>
                        <ChevronDown
                            size={ 16 }
                            aria-hidden="true"
                            className={ `fill-none text-gray-400 transition-transform ${
                                open[ gateway.id ] ? 'rotate-180' : ''
                            }` }
                        />
                    </button>

                    { open[ gateway.id ] && (
                        <div className="flex flex-col gap-3.5 px-4 pb-4">
                            { ( gateway.fields || [] ).map( ( field ) =>
                                renderField( gateway, field )
                            ) }

                            { gateway.connect && (
                                <div className="flex flex-col items-start gap-2">
                                    { gateway.connect.description && (
                                        <p className="m-0 text-sm text-gray-500">
                                            { gateway.connect.description }
                                        </p>
                                    ) }
                                    <Button
                                        variant="outline"
                                        className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                        render={
                                            <a
                                                href={ gateway.connect.url }
                                                target={
                                                    gateway.connect.newTab
                                                        ? '_blank'
                                                        : undefined
                                                }
                                                rel={
                                                    gateway.connect.newTab
                                                        ? 'noopener noreferrer'
                                                        : undefined
                                                }
                                            >
                                                { gateway.connect.label }
                                            </a>
                                        }
                                    />
                                </div>
                            ) }

                            { gateway.image && (
                                <img
                                    src={ gateway.image }
                                    alt=""
                                    className="max-w-[240px]"
                                />
                            ) }

                            { gateway.declaration && (
                                <LabeledCheckbox
                                    label={ gateway.declaration }
                                    checked={
                                        true ===
                                        value[ gateway.id ]?.declaration
                                    }
                                    onCheckedChange={ ( checked: boolean ) =>
                                        update(
                                            gateway.id,
                                            'declaration',
                                            true === checked
                                        )
                                    }
                                />
                            ) }

                            { gateway.note && (
                                <div className="rounded-md border-l-2 border-violet-600 bg-violet-50 px-4 py-3 text-sm leading-5 text-gray-700">
                                    { gateway.note }
                                </div>
                            ) }
                        </div>
                    ) }
                </div>
            ) ) }

            { element.validationError && (
                <p
                    className="m-0 border-t border-gray-200 px-4 py-3 text-sm whitespace-pre-line text-red-500"
                    role="alert"
                >
                    { element.validationError }
                </p>
            ) }
        </div>
    );
};

export default PaymentMethodsField;
