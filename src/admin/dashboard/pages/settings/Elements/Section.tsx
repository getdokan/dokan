import SettingsParser from './SettingsParser';
import { SettingsProps } from '../types';
import PageHeading from './PageHeading';

const Section = ( {
    element,
    getSetting,
    onValueChange,
}: SettingsProps ): JSX.Element => {
    if ( ! element.display ) {
        return <></>;
    }

    return (
        <section aria-labelledby="settings-section-heading" key={ element.id }>
            <div
                className={ `flex flex-col
                           divide-y border border-[#E9E9E9]  divide-gray-200'
                    ` }
            >
                { element.title && (
                    <PageHeading
                        title={ element.title }
                        description={ element.description }
                        className={ 'p-5 mb-0 gap-2 ' }
                        titleClassName={ 'text-base font-semibold  ' }
                        descriptionClassName={ 'text-sm text-[#828282]' }
                        id={ `settings-section-heading-${ element.hook_key }` }
                        documentationLink={ element.documentationLink }
                    />
                ) }
                { element.children.length === 0 && (
                    <div className="p-4 text-gray-500">
                        No settings available in this section.
                    </div>
                ) }
                { element.children.map( ( child ) => {
                    return (
                        <SettingsParser
                            element={ child }
                            key={
                                element.hook_key + '-' + child.id + '-parser'
                            }
                            onValueChange={ onValueChange }
                            getSetting={ getSetting }
                        />
                    );
                } ) }
            </div>
        </section>
    );
};

export default Section;
