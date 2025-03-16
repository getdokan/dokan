import { SettingsProps } from '../StepSettings';
import SettingsParser from './SettingsParser';

const Section = ( { element, onValueChange }: SettingsProps ): JSX.Element => {
    if ( ! element.display ) {
        return <></>;
    }
    return (
        <section aria-labelledby="settings-section-heading" key={ element.id }>
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
                <div
                    className={
                        'flex flex-col  divide-y border border-[#E9E9E9] divide-gray-200'
                    }
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
