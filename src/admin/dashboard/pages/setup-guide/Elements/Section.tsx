import { SettingsProps } from '../StepSettings';
import SettingsParser from './SettingsParser';
import { RawHTML } from '@wordpress/element';

const Section = ( { element, onValueChange }: SettingsProps ): JSX.Element => {
    if ( ! element.display ) {
        return <></>;
    }

    const isAllChildrenFields = element?.children?.every( ( child ) => {
        return child?.type === 'field';
    } );
    return (
        <section aria-labelledby="settings-section-heading" key={ element.id }>
            <div className="bg-white sm:rounded-md">
                <div className={ `mb-8` }>
                    <h2
                        id={ element.hook_key }
                        className="text-3xl font-bold text-gray-900 leading-5"
                    >
                        <RawHTML>{ element.title }</RawHTML>
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 leading-5">
                        <RawHTML>{ element.description }</RawHTML>
                    </p>
                </div>
                <div
                    className={ `flex flex-col ${
                        isAllChildrenFields
                            ? 'divide-y border border-[#E9E9E9] mb-8 divide-gray-200'
                            : ''
                    }` }
                >
                    { element.children.map( ( child ) => {
                        return (
                            <SettingsParser
                                element={ child }
                                key={
                                    element.hook_key +
                                    '-' +
                                    child.id +
                                    '-parser'
                                }
                                onValueChange={ onValueChange }
                            />
                        );
                    } ) }
                </div>
            </div>
        </section>
    );
};

export default Section;
