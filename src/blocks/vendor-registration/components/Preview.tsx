import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import { useEditorContext } from '../context';
import { isRowShown } from '../visibility';
import type { ReactNode } from 'react';
import type { LoginSettings, Row, Section, Setup, View } from '../types';

interface PreviewStep {
    id: string;
    title: string;
    sections: Section[];
}

// Mirror of FormRenderer::get_render_steps(): visible sections grouped by step, empty steps skipped.
export const previewSteps = (
    setup: Setup,
    keep: ( row: Row ) => boolean
): PreviewStep[] => {
    const sections = setup.sections
        .map( ( section ) => ( {
            ...section,
            rows: section.rows.filter( keep ),
        } ) )
        .filter( ( section ) => ! section.hidden && section.rows.length );

    if ( ! setup.splitSteps || ! setup.steps.length ) {
        return [ { id: 'all', title: '', sections } ];
    }

    const steps = setup.steps
        .map( ( step ) => ( {
            ...step,
            sections: sections.filter(
                ( section ) => section.step === step.id
            ),
        } ) )
        .filter( ( step ) => step.sections.length );

    return steps.length ? steps : [ { id: 'all', title: '', sections } ];
};

const Label = ( { row }: { row: Row } ) => (
    <span className="dokan-vreg__label">
        { row.label } { row.required && <span className="required">*</span> }
    </span>
);

const Help = ( { text }: { text?: string } ) =>
    text ? <small className="dokan-vreg__help">{ text }</small> : null;

function PreviewRow( { row, view }: { row: Row; view: View } ) {
    const { data } = useEditorContext();
    const input = ( type = 'text' ) => (
        <input
            className="input-text dokan-vreg__input"
            type={ type }
            placeholder={ row.placeholder }
            readOnly
            tabIndex={ -1 }
        />
    );

    // Rows Dokan settings switch on (EU fields, subscription packs) show where their fields will appear.
    if (
        row.registry?.hook ||
        ( row.registry && 'core' !== row.registry.source && ! row.custom )
    ) {
        return (
            <div className="dokan-vreg__row dokan-vreg__row--placeholder">
                <strong>{ row.label }</strong>
                <span>
                    { __(
                        'Fields from Dokan settings appear here.',
                        'dokan-lite'
                    ) }
                </span>
            </div>
        );
    }

    if ( 'terms' === row.id ) {
        return (
            <p className="dokan-vreg__row dokan-vreg__row--checkbox">
                <input type="checkbox" readOnly tabIndex={ -1 } />{ ' ' }
                <span className="dokan-vreg__label dokan-vreg__label--inline">
                    { row.label }
                </span>{ ' ' }
                { row.required && <span className="required">*</span> }
            </p>
        );
    }

    if ( row.custom && 'checkbox' === row.type ) {
        return (
            <p className="dokan-vreg__row dokan-vreg__row--checkbox">
                <input type="checkbox" readOnly tabIndex={ -1 } />{ ' ' }
                <span className="dokan-vreg__label dokan-vreg__label--inline">
                    { row.label }
                </span>
                { row.required && <span className="required"> *</span> }
                <Help text={ row.help } />
            </p>
        );
    }

    if ( row.custom && 'radio' === row.type ) {
        return (
            <fieldset className="dokan-vreg__row dokan-vreg__choices">
                <legend className="dokan-vreg__label">
                    { row.label }{ ' ' }
                    { row.required && <span className="required">*</span> }
                </legend>
                { row.options.map( ( option ) => (
                    <span
                        className="dokan-vreg__choice"
                        key={ option.value || option.label }
                    >
                        <input type="radio" readOnly tabIndex={ -1 } />{ ' ' }
                        { option.label }
                    </span>
                ) ) }
                <Help text={ row.help } />
            </fieldset>
        );
    }

    let field: ReactNode;

    if ( row.custom && [ 'select', 'multiselect' ].includes( row.type ) ) {
        field = (
            <select
                className="dokan-vreg__input"
                multiple={ 'multiselect' === row.type }
                tabIndex={ -1 }
                value={ [] }
                onChange={ () => undefined }
            >
                { 'select' === row.type && (
                    <option>
                        { row.placeholder || __( 'Select…', 'dokan-lite' ) }
                    </option>
                ) }
                { row.options.map( ( option ) => (
                    <option key={ option.value || option.label }>
                        { option.label }
                    </option>
                ) ) }
            </select>
        );
    } else if ( row.custom && 'textarea' === row.type ) {
        field = (
            <textarea
                className="input-text dokan-vreg__input"
                rows={ 3 }
                placeholder={ row.placeholder }
                readOnly
                tabIndex={ -1 }
            />
        );
    } else if ( 'country' === row.id ) {
        field = (
            <select className="dokan-vreg__input" tabIndex={ -1 }>
                <option>
                    { __( 'Select a country / region…', 'dokan-lite' ) }
                </option>
            </select>
        );
    } else {
        const types: Record< string, string > = {
            email: 'email',
            password: 'password',
            phone: 'tel',
            number: 'number',
            url: 'url',
            date: 'date',
        };
        field = input(
            types[ row.custom ? row.type : row.registry?.type || '' ] || 'text'
        );
    }

    let note = row.help;

    if (
        'email' === row.id &&
        'visitor' === view &&
        data.woocommerce.generatePassword
    ) {
        note = [
            __( 'We’ll email you a link to set your password.', 'dokan-lite' ),
            row.help,
        ]
            .filter( Boolean )
            .join( ' ' );
    }

    return (
        <div className="form-row dokan-vreg__row">
            <Label row={ row } />
            { field }
            { 'shop_url' === row.id && (
                <small className="dokan-vreg__help dokan-vreg__url-preview">
                    { data.dokan.storeUrlBase }
                </small>
            ) }
            <Help text={ note } />
        </div>
    );
}

function LoginPreview( { login }: { login: LoginSettings } ) {
    const context = useEditorContext();
    return (
        <div className="dokan-vreg__login">
            { 'link' !== login.position && (
                <h2 className="dokan-vreg__heading">{ login.heading }</h2>
            ) }
            <div className="dokan-vreg__row">
                <span className="dokan-vreg__label">
                    { login.usernameLabel } <span className="required">*</span>
                </span>
                <input className="dokan-vreg__input" readOnly tabIndex={ -1 } />
            </div>
            <div className="dokan-vreg__row">
                <span className="dokan-vreg__label">
                    { login.passwordLabel } <span className="required">*</span>
                </span>
                <input
                    className="dokan-vreg__input"
                    type="password"
                    readOnly
                    tabIndex={ -1 }
                />
            </div>
            { login.showRemember && (
                <p className="dokan-vreg__row">
                    <input type="checkbox" readOnly tabIndex={ -1 } />{ ' ' }
                    { __( 'Remember me', 'dokan-lite' ) }
                </p>
            ) }
            <div className="dokan-vreg__actions dokan-vreg__actions--login">
                <span className="dokan-vreg__login-submit">
                    { login.buttonText }
                </span>
            </div>
            { login.showLostPassword && (
                <p className="dokan-vreg__lost-password">
                    { __( 'Lost your password?', 'dokan-lite' ) }
                </p>
            ) }
            {
                applyFilters(
                    'dokan_vendor_registration_preview_after_login',
                    null,
                    context
                ) as ReactNode
            }
        </div>
    );
}

// Like the server, a text left blank shows its default.
const withDefaults = < T extends object >(
    defaults: T,
    saved: Partial< T > | undefined
): T => {
    const merged = { ...defaults };

    Object.entries( saved || {} ).forEach( ( [ key, value ] ) => {
        if ( 'string' !== typeof value || value.trim() ) {
            ( merged as Record< string, unknown > )[ key ] = value;
        }
    } );

    return merged;
};

export default function Preview() {
    const context = useEditorContext();
    const { data, attributes, setup, view, hasTermsPage } = context;
    const [ current, setCurrent ] = useState( 0 );
    const texts = withDefaults( data.texts, attributes.texts );
    const login = withDefaults( data.login, attributes.login ) as LoginSettings;
    const steps = previewSteps( setup, ( row ) =>
        isRowShown( row, view, data, hasTermsPage )
    );
    const step = steps[ Math.min( current, steps.length - 1 ) ];
    const isLast = step === steps[ steps.length - 1 ];
    const showLogin = login.enabled && 'visitor' === view;

    useEffect( () => {
        if ( current >= steps.length ) {
            setCurrent( 0 );
        }
    }, [ current, steps.length ] );

    const headings: Record< View, string > = {
        visitor: texts.visitorHeading,
        social: texts.socialHeading,
        customer: texts.customerHeading,
    };
    const buttons: Record< View, string > = {
        visitor: texts.visitorButton,
        social: texts.socialButton,
        customer: texts.customerButton,
    };

    const main = (
        <div className="dokan-vreg__main">
            <h2 className="dokan-vreg__heading">{ headings[ view ] }</h2>
            { 'social' === view && (
                <p className="dokan-vreg__note">
                    { texts.socialNote.replace( '{platform}', 'Google' ) }
                </p>
            ) }
            {
                applyFilters(
                    'dokan_vendor_registration_preview_before_form',
                    null,
                    context
                ) as ReactNode
            }
            <div className="dokan-vreg__form">
                { steps.length > 1 && (
                    <ol className="dokan-vreg__step-bar">
                        { steps.map( ( item, index ) => (
                            <li
                                key={ item.id }
                                className={
                                    'dokan-vreg__step-item' +
                                    ( index === current ? ' is-active' : '' ) +
                                    ( index < current ? ' is-done' : '' )
                                }
                                onClick={ () => setCurrent( index ) }
                                role="presentation"
                            >
                                <span className="dokan-vreg__step-number">
                                    { index + 1 }
                                </span>
                                <span className="dokan-vreg__step-title">
                                    { item.title }
                                </span>
                            </li>
                        ) ) }
                    </ol>
                ) }
                { steps.length > 1 && (
                    <p className="dokan-vreg__step-note">
                        { sprintf(
                            /* translators: 1: current step number, 2: number of steps, 3: step title */
                            __( 'Step %1$d of %2$d: %3$s', 'dokan-lite' ),
                            current + 1,
                            steps.length,
                            step.title
                        ) }
                    </p>
                ) }
                { step.sections.map( ( section, index ) => (
                    <div className="dokan-vreg__section" key={ section.id }>
                        { ! ( steps.length > 1 && 0 === index ) &&
                            section.title &&
                            ! [ 'account', 'store' ].includes( section.id ) && (
                                <h3 className="dokan-vreg__section-title">
                                    { section.title }
                                </h3>
                            ) }
                        { section.rows.map( ( row ) => (
                            <PreviewRow
                                key={ row.id }
                                row={ row }
                                view={ view }
                            />
                        ) ) }
                    </div>
                ) ) }
                <div className="dokan-vreg__actions">
                    { current > 0 && (
                        <span
                            className="dokan-vreg__back"
                            onClick={ () => setCurrent( current - 1 ) }
                            role="presentation"
                        >
                            { texts.backButton }
                        </span>
                    ) }
                    { isLast ? (
                        <span className="dokan-vreg__submit">
                            { buttons[ view ] }
                        </span>
                    ) : (
                        <span
                            className="dokan-vreg__next"
                            onClick={ () => setCurrent( current + 1 ) }
                            role="presentation"
                        >
                            { texts.nextButton }
                        </span>
                    ) }
                </div>
            </div>
            {
                applyFilters(
                    'dokan_vendor_registration_preview_after_form',
                    null,
                    context
                ) as ReactNode
            }
        </div>
    );

    if ( ! showLogin ) {
        return main;
    }

    if ( 'link' === login.position ) {
        return (
            <>
                <p className="dokan-vreg__login-link">
                    <span className="dokan-vreg__login-toggle">
                        { login.linkText }
                    </span>
                </p>
                { main }
            </>
        );
    }

    return (
        <div className="dokan-vreg__columns">
            { 'left' === login.position && <LoginPreview login={ login } /> }
            { main }
            { 'right' === login.position && <LoginPreview login={ login } /> }
        </div>
    );
}
