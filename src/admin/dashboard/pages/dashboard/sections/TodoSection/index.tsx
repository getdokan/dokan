import { __, sprintf } from '@wordpress/i18n';
import Section from '../../Elements/Section';
import MiniCard from '../../Elements/MiniCard';
import DynamicIcon from '../../components/DynamicIcon';
import { useDashboardApiData } from '../../hooks/useDashboardApiData';
import { fetchTodoData } from '../../utils/api';
import { TodoData } from '../../types';
import TodoSectionSkeleton from './Skeleton';

const TodoSection = () => {
    const { data, loading, error } = useDashboardApiData< TodoData >( {
        fetchFunction: fetchTodoData,
    } );

    if ( loading ) {
        return <TodoSectionSkeleton />;
    }

    return (
        <Section title={ __( 'To-Do', 'dokan-lite' ) }>
            { ! error ? (
                <div className="grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    { data &&
                        Object.entries( data ).map( ( [ key, item ] ) => (
                            <MiniCard
                                key={ key }
                                icon={ <DynamicIcon iconName={ item.icon } /> }
                                text={ item.title }
                                count={ item.count }
                                countType={
                                    item.count > 0 ? 'primary' : 'secondary'
                                }
                            />
                        ) ) }
                </div>
            ) : (
                <div className="text-red-500 p-4 bg-red-50 rounded-lg">
                    { sprintf(
                        /* translators: %s is the error message */
                        __( 'Error fetching to-do data: %s', 'dokan-lite' ),
                        error
                    ) }
                </div>
            ) }
        </Section>
    );
};

// @ts-ignore
export default TodoSection;
