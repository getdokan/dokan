import { RouterProps } from '../../../../definitions/RouterProps';

const VendorsSingle = ( { params }: RouterProps ) => {
    const { id: vendorId } = params;

    return (
        <div className="bg-[#F6F7FB] min-h-screen px-0 py-10">
            { /* Header */ }
            <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-[0_4px_24px_0_rgba(31,41,55,0.06)] px-10 py-8 flex items-center gap-8 mb-10">
                <div className="relative">
                    <img
                        src="https://randomuser.me/api/portraits/men/32.jpg"
                        alt="Vendor Avatar"
                        className="w-28 h-28 rounded-full border-[6px] border-[#F6F7FB] object-cover shadow"
                    />
                    <span className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-4">
                        <h1 className="text-[28px] font-bold text-gray-900 leading-tight">
                            John Doe
                        </h1>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                            Active
                        </span>
                    </div>
                    <div className="text-gray-500 mt-2 text-base font-medium">
                        johndoe@email.com
                    </div>
                    <div className="text-gray-400 text-sm mt-1 font-normal">
                        Vendor ID: { vendorId }
                    </div>
                </div>
                <button className="ml-auto px-7 py-2.5 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition text-base">
                    Edit Vendor
                </button>
            </div>

            { /* Stats */ }
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-7 mb-10">
                <div className="bg-white rounded-2xl shadow-[0_2px_12px_0_rgba(31,41,55,0.04)] p-7 flex items-center gap-5">
                    <div className="bg-blue-100 text-blue-600 rounded-xl p-3">
                        <svg
                            width="28"
                            height="28"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path
                                d="M5 12h14M12 5v14"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>
                    <div>
                        <div className="text-gray-400 text-xs font-semibold mb-1 tracking-wide">
                            Total Sales
                        </div>
                        <div className="text-2xl font-extrabold text-gray-900">
                            $12,340
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-[0_2px_12px_0_rgba(31,41,55,0.04)] p-7 flex items-center gap-5">
                    <div className="bg-orange-100 text-orange-500 rounded-xl p-3">
                        <svg
                            width="28"
                            height="28"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path
                                d="M3 12h18M12 3v18"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>
                    <div>
                        <div className="text-gray-400 text-xs font-semibold mb-1 tracking-wide">
                            Orders
                        </div>
                        <div className="text-2xl font-extrabold text-gray-900">
                            234
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-[0_2px_12px_0_rgba(31,41,55,0.04)] p-7 flex items-center gap-5">
                    <div className="bg-green-100 text-green-600 rounded-xl p-3">
                        <svg
                            width="28"
                            height="28"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <rect
                                x="4"
                                y="4"
                                width="16"
                                height="16"
                                rx="4"
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                        </svg>
                    </div>
                    <div>
                        <div className="text-gray-400 text-xs font-semibold mb-1 tracking-wide">
                            Products
                        </div>
                        <div className="text-2xl font-extrabold text-gray-900">
                            18
                        </div>
                    </div>
                </div>
            </div>

            { /* Tabs */ }
            <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-[0_2px_12px_0_rgba(31,41,55,0.04)] px-8 pt-2 pb-8">
                <div className="flex gap-2 border-b border-gray-100 mb-6">
                    <button className="py-3 px-6 text-blue-600 font-semibold border-b-2 border-blue-600 bg-blue-50 rounded-t-lg transition">
                        Overview
                    </button>
                    <button className="py-3 px-6 text-gray-500 font-semibold hover:text-blue-600 border-b-2 border-transparent hover:border-blue-200 transition">
                        Orders
                    </button>
                    <button className="py-3 px-6 text-gray-500 font-semibold hover:text-blue-600 border-b-2 border-transparent hover:border-blue-200 transition">
                        Products
                    </button>
                    <button className="py-3 px-6 text-gray-500 font-semibold hover:text-blue-600 border-b-2 border-transparent hover:border-blue-200 transition">
                        Payments
                    </button>
                </div>
                <div className="pt-2">
                    { /* Tab content placeholder */ }
                    <div className="text-gray-500 text-base">
                        Overview content goes here.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorsSingle;
