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
                           divide-y border border-[#E9E9E9] mb-8 divide-gray-200'
                    ` }
            >
                <PageHeading
                    title={ element.title }
                    description={ element.description }
                    className={ 'p-5 mb-0' }
                />
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
