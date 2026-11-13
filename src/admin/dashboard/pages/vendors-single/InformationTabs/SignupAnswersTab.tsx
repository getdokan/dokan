import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import {
    Card,
    SimpleCheckbox,
    SimpleInput,
    SimpleSelect,
    TextArea,
    useToast,
} from '@getdokan/dokan-ui';
import { ClipboardList } from 'lucide-react';
import { DokanAlert, DokanButton } from '@dokan/components';
import { Vendor } from '@dokan/definitions/dokan-vendors';

interface AnswerField {
    key: string;
    label: string;
    type: string;
    required: boolean;
    help: string;
    placeholder: string;
    options: { label: string; value: string }[];
    value: string | string[];
    display: string;
}

interface AnswerSection {
    id: string;
    title: string;
    fields: AnswerField[];
}

interface Answers {
    vendor_id: number;
    page: { id: number; title: string; url: string } | null;
    sections: AnswerSection[];
}

type Values = Record< string, string | string[] >;

const INPUT_TYPES: Record< string, string > = {
    email: 'email',
    url: 'url',
    phone: 'tel',
    number: 'number',
    date: 'date',
};

const valuesOf = ( answers: Answers ): Values => {
    const values: Values = {};

    answers.sections.forEach( ( section ) =>
        section.fields.forEach( ( field ) => {
            values[ field.key ] = field.value;
        } )
    );

    return values;
};

const toList = ( value: string | string[] | undefined ): string[] =>
    Array.isArray( value ) ? value : [];

interface FieldProps {
    field: AnswerField;
    value: string | string[] | undefined;
    onChange: ( value: string | string[] ) => void;
}

// One answer, drawn like the sign-up form drew it; empty ones read "Not answered yet".
const AnswerInput = ( { field, value, onChange }: FieldProps ) => {
    const notAnswered = __( 'Not answered yet', 'dokan-lite' );
    const text = Array.isArray( value ) ? '' : value || '';

    if ( 'checkbox' === field.type ) {
        return (
            <SimpleCheckbox
                label={ field.label }
                checked={ 'yes' === text }
                input={ { id: `dokan-vreg-answer-${ field.key }` } }
                onChange={ ( event ) =>
                    onChange( event.target.checked ? 'yes' : 'no' )
                }
            />
        );
    }

    if ( 'multiselect' === field.type ) {
        const chosen = toList( value );

        return (
            <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-700">
                    { field.label }
                </span>
                { ! chosen.length && (
                    <span className="text-xs text-gray-500">
                        { notAnswered }
                    </span>
                ) }
                { field.options.map( ( option ) => (
                    <SimpleCheckbox
                        key={ option.value }
                        label={ option.label }
                        checked={ chosen.includes( option.value ) }
                        input={ {
                            id: `dokan-vreg-answer-${ field.key }-${ option.value }`,
                        } }
                        onChange={ ( event ) =>
                            onChange(
                                event.target.checked
                                    ? [ ...chosen, option.value ]
                                    : chosen.filter(
                                          ( item ) => item !== option.value
                                      )
                            )
                        }
                    />
                ) ) }
            </div>
        );
    }

    if ( 'select' === field.type || 'radio' === field.type ) {
        return (
            <SimpleSelect
                label={ field.label }
                value={ text }
                placeholder={ notAnswered }
                options={ field.options }
                helpText={ field.help }
                onChange={ ( event ) => onChange( event.target.value ) }
            />
        );
    }

    if ( 'textarea' === field.type ) {
        return (
            <TextArea
                label={ field.label }
                value={ text }
                helpText={ field.help }
                input={ {
                    id: `dokan-vreg-answer-${ field.key }`,
                    placeholder: notAnswered,
                    rows: 3,
                } }
                onChange={ ( event ) => onChange( event.target.value ) }
            />
        );
    }

    return (
        <SimpleInput
            label={ field.label }
            value={ text }
            helpText={ field.help }
            input={ {
                id: `dokan-vreg-answer-${ field.key }`,
                type: INPUT_TYPES[ field.type ] || 'text',
                placeholder: notAnswered,
            } }
            onChange={ ( event ) => onChange( event.target.value ) }
        />
    );
};

interface SignupAnswersTabProps {
    vendor: Vendor;
}

const SignupAnswersTab = ( { vendor }: SignupAnswersTabProps ) => {
    const toast = useToast();
    const [ answers, setAnswers ] = useState< Answers | null >( null );
    const [ values, setValues ] = useState< Values >( {} );
    const [ errors, setErrors ] = useState< string[] >( [] );
    const [ loading, setLoading ] = useState( true );
    const [ failed, setFailed ] = useState( false );
    const [ saving, setSaving ] = useState( false );

    const path = `/dokan/v1/vendor-registration/answers/${ vendor.id }`;

    useEffect( () => {
        setLoading( true );
        apiFetch< Answers >( { path } )
            .then( ( data ) => {
                setAnswers( data );
                setValues( valuesOf( data ) );
                setFailed( false );
            } )
            .catch( () => setFailed( true ) )
            .finally( () => setLoading( false ) );
    }, [ path ] );

    const save = () => {
        setSaving( true );
        setErrors( [] );
        apiFetch< Answers >( {
            path,
            method: 'PUT',
            data: { answers: values },
        } )
            .then( ( data ) => {
                setAnswers( data );
                setValues( valuesOf( data ) );
                toast( {
                    type: 'success',
                    title: __( 'Sign-up answers saved.', 'dokan-lite' ),
                } );
            } )
            .catch( ( error ) => {
                // Every rejected answer comes back as its own message.
                const messages = error?.additional_errors?.length
                    ? [
                          error.message,
                          ...error.additional_errors.map(
                              ( item: { message: string } ) => item.message
                          ),
                      ]
                    : [
                          error?.message ||
                              __( 'Something went wrong.', 'dokan-lite' ),
                      ];
                setErrors( messages );
            } )
            .finally( () => setSaving( false ) );
    };

    if ( loading ) {
        return <Card className="bg-white shadow p-6 animate-pulse h-40" />;
    }

    if ( failed || ! answers ) {
        return (
            <DokanAlert
                variant="danger"
                label={ __(
                    'The sign-up answers could not be loaded.',
                    'dokan-lite'
                ) }
            />
        );
    }

    if ( ! answers.sections.length ) {
        return (
            <DokanAlert
                variant="info"
                label={ __(
                    'The sign-up form this vendor used has no custom fields.',
                    'dokan-lite'
                ) }
            />
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="text-black bg-[#dadada] w-fit rounded-full pt-1 pb-1 pl-2 pr-2 flex justify-center items-center text-sm">
                <ClipboardList size="12" strokeWidth="3" />
                <span className="ml-1">
                    { __( 'Sign-up answers', 'dokan-lite' ) }
                </span>
            </div>

            { answers.page && (
                <p className="text-sm text-gray-500">
                    { __( 'From the form on', 'dokan-lite' ) }{ ' ' }
                    <a
                        href={ answers.page.url }
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#7047EB] underline"
                    >
                        { answers.page.title }
                    </a>
                </p>
            ) }

            { errors.length > 0 && (
                <DokanAlert variant="danger" label={ errors.join( ' ' ) } />
            ) }

            { answers.sections.map( ( section ) => (
                <Card key={ section.id } className="bg-white shadow p-6">
                    <h3 className="text-neutral-700 text-base font-semibold mb-4">
                        { section.title }
                    </h3>
                    <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6">
                        { section.fields.map( ( field ) => (
                            <div
                                key={ field.key }
                                className="flex flex-col gap-1"
                            >
                                <AnswerInput
                                    field={ field }
                                    value={ values[ field.key ] }
                                    onChange={ ( value ) =>
                                        setValues( {
                                            ...values,
                                            [ field.key ]: value,
                                        } )
                                    }
                                />
                                <code className="text-xs text-gray-400">
                                    { field.key }
                                </code>
                            </div>
                        ) ) }
                    </div>
                </Card>
            ) ) }

            <div>
                <DokanButton
                    onClick={ save }
                    disabled={ saving }
                    loading={ saving }
                >
                    { __( 'Save answers', 'dokan-lite' ) }
                </DokanButton>
            </div>
        </div>
    );
};

export default SignupAnswersTab;
