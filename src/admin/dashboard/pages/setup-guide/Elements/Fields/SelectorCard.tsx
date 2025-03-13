// Reusable selector card component
import MarkedChecked from '../../components/icons/MarkedChecked';
import UnMarkedChecked from '../../components/icons/UnMarkedChecked';

const SelectorCard = ( { type, value, selected, onChange, icon } ) => {
    return (
        <button
            className={ `relative border rounded-md p-3 flex flex-col gap-3 items-start  w-40 h-28 ${
                selected ? 'border-[#7047EB] ' : 'border-[#E9E9E9]'
            }` }
            onClick={ () => onChange( type, value ) }
        >
            <div
                className={ `p-4  border  rounded-lg flex items-center justify-center ${
                    selected
                        ? 'bg-[#F1EDFD] border-[#E5E0F2]'
                        : 'bg-[#F8F9F8] border-[#E9E9E9]'
                }` }
            >
                { icon }
            </div>
            <span className="text-sm font-semibold text-[#25252D]">
                { value === 'admin' ? 'Admin' : 'Vendor' }
            </span>
            <div className="absolute top-1 right-1 text-purple-600">
                { selected ? <MarkedChecked /> : <UnMarkedChecked /> }
            </div>
        </button>
    );
};

export default SelectorCard;
