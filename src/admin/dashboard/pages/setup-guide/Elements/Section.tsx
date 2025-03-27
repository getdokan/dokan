import { SettingsElement, SettingsProps } from '../StepSettings';
import SettingsParser from './SettingsParser';

const Section = ( { element, onValueChange }: SettingsProps ): JSX.Element => {
    if ( ! element.display ) {
        return <></>;
    }
    return (
        <section aria-labelledby="payment-details-heading" key={ element.id }>
            <div className="bg-white shadow sm:rounded-md">
                <div className="py-6 px-4 sm:p-6">
                    <div>
                        <h2
                            id={ element.hook_key }
                            className="text-lg leading-6 font-medium text-gray-900"
                        >
                            { element.title }
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            { element.description }
                        </p>
                    </div>

                    <div className="mt-6 grid grid-cols-4 gap-6">
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
            </div>
        </section>
    );
};

export default Section;
