
function ConfirmationModal({ message, onConfirm, onCancel, title }) {
    return (
        <div className="fixed inset-0  flex items-center justify-cente bg-opacity-10 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-auto">
                {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
                <p className="text-sm text-gray-700 mb-6">{message}</p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                        Không
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-medium text-white bg-custom-blue rounded-md hover:bg-custom-bluehover2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Có
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmationModal;