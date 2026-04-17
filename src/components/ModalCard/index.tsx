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
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="text-on-surface font-body">
                    {children ? (
                        children
                    ) : (
                        <div className="space-y-4">
                            <p className="text-on-surface-variant">Preencha os dados abaixo para criar uma nova tarefa no board.</p>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-primary">Título</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Refatorar componente X"
                                    className="w-full px-4 py-2 rounded-xl border border-outline focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-primary">Descrição</label>
                                <textarea
                                    placeholder="Dê mais detalhes sobre a tarefa..."
                                    className="w-full px-4 py-2 rounded-xl border border-outline focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[100px]"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {footer ? (
                    <div className="mt-6 flex items-center justify-end gap-3 border-t border-surface-variant pt-4">
                        {footer}
                    </div>
                ) : (
                    <div className="mt-6 flex items-center justify-end gap-3 border-t border-surface-variant pt-4">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 rounded-full border border-outline text-primary font-label hover:bg-primary/5 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            className="px-6 py-2 rounded-full bg-primary text-on-primary font-label hover:shadow-lg transition-all"
                        >
                            Salvar
                        </button>
                    </div>
                )}
            </div>

            {/* Backdrop click to close */}
            <div className="absolute inset-0 -z-10" onClick={onClose} />
        </div>
    );
};

export default ModalCard;
