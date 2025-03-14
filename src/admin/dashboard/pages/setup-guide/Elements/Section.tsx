import { SettingsElement } from '../StepSettings';
import SettingsParser from './SettingsParser';

const Section = ( { element }: { element: SettingsElement } ): JSX.Element => {
    if ( ! element.display ) {
        return <></>;
    }
    return (
        <section
            aria-labelledby="settings-section-heading md:grid-col-12"
            key={ element.id }
        >
            <div className="bg-white sm:rounded-md">
                <div className={ `mb-4` }>
                    <h2
                        id={ element.hook_key }
                        className="text-3xl font-bold text-gray-900 leading-5"
                    >
                        { element.title }
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 leading-5">
                        { element.description }
                    </p>
                </div>

                { element.children.map( ( child ) => {
                    return (
                        <SettingsParser
                            element={ child }
                            key={
                                element.hook_key + '-' + child.id + '-parser'
                            }
                        />
                    );
                } ) }
            </div>
        </section>
    );
};

export default Section;
