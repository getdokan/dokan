// Reusable selector card component
import MarkedChecked from '../../components/icons/MarkedChecked';
import UnMarkedChecked from '../../components/icons/UnMarkedChecked';

const SelectorCard = ( { value, title, selected = false, onChange, icon } ) => {
    const handleClick = () => {
        if ( onChange ) {
            onChange( value );
        }
    };
    return (
        <button
            className={ `relative border rounded-md p-3 flex flex-col gap-3  items-start  w-36  ${
                selected ? 'border-[#7047EB] ' : 'border-[#E9E9E9]'
            }` }
            onClick={ handleClick }
        >
            <div
                className={ `p-3  border  rounded-lg flex items-center justify-center ${
                    selected
                        ? 'bg-[#F1EDFD] border-[#E5E0F2]'
                        : 'bg-[#F8F9F8] border-[#E9E9E9]'
                }` }
            >
                { icon }
            </div>
            <span className="text-sm font-semibold text-[#25252D]">
                { title || value }
            </span>
            <div className="absolute top-1 right-1 text-purple-600">
                { selected ? <MarkedChecked /> : <UnMarkedChecked /> }
            </div>
        </button>
    );
};

export default SelectorCard;
