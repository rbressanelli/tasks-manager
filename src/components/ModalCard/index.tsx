interface ModalCardProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children?: React.ReactNode;
    footer?: React.ReactNode;
}

const ModalCard = ({ isOpen, onClose, title, children, footer }: ModalCardProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/40 backdrop-blur-sm transition-all duration-300">
            {/* Modal Container */}
            <div
                className="relative w-full max-w-lg rounded-3xl bg-surface-container-lowest p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-surface-variant pb-4 mb-4">
                    <h2 className="text-2xl font-headline font-semibold text-primary">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-variant transition-colors text-on-surface-variant"
                    >
                        <span className="material-symbols-outlined cursor-pointer">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="text-on-surface font-body">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="mt-6 flex items-center justify-end gap-3 border-t border-surface-variant pt-4">
                        {footer}
                    </div>
                )}
            </div>

            {/* Backdrop click to close */}
            <div className="absolute inset-0 -z-10" onClick={onClose} />
        </div>
    );
};

export default ModalCard;
