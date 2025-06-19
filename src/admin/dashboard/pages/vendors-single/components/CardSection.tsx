import SectionHeading from './SectionHeading';
import StatCard from './StatCard';
import { twMerge } from 'tailwind-merge';

interface CardSectionProps {
    heading: string;
    cards: Array< {
        title: string;
        icon: JSX.Element;
        data: string | number;
        helpText?: string;
    } >;
    className?: string;
}

const CardSection = ( {
    heading,
    cards,
    className = '',
}: CardSectionProps ) => (
    <section className="space-y-4">
        <SectionHeading title={ heading } />
        <div
            className={ twMerge(
                'grid @xs:grid-cols-1 @md:grid-cols-2 @lg:grid-cols-4 gap-6',
                className
            ) }
        >
            { cards.map( ( card, index ) => (
                <StatCard
                    key={ `${ heading
                        .toLowerCase()
                        .replace( ' ', '-' ) }-${ index }` }
                    title={ card.title }
                    icon={ card.icon }
                    data={ card.data }
                    helpText={ card.helpText }
                />
            ) ) }
        </div>
    </section>
);

export default CardSection;
