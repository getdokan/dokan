const RadioCard = ({ label, checked, onChange }) => {
    return (
        <div
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                checked ? 'border-indigo-600 bg-white' : 'border-gray-300 bg-white'
            }`}
            onClick={onChange}
        >
            <div className='flex items-center justify-between mb-1'>
                <span className='font-medium'>{label}</span>
                {checked && (
                    <div className='bg-indigo-600 text-white rounded-full p-1'>
                        <span className='dashicons dashicons-yes-alt h-4 w-4'></span>
                    </div>
                )}
            </div>
        </div>
    )
}

export default RadioCard;
