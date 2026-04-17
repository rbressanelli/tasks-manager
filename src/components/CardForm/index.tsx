import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { CardMetadata } from '../../types/card';
import { useEffect } from 'react';

const cardSchema = z.object({
    title: z.string().min(1, 'O título é obrigatório').max(50, 'Título muito longo'),
    description: z.string().max(200, 'A descrição deve ter no máximo 200 caracteres'),
});

type CardFormData = z.infer<typeof cardSchema>;

interface CardFormProps {
    initialValues?: CardMetadata;
    onSubmit: (data: CardMetadata) => void;
    onCancel: () => void;
}

const CardForm = ({ initialValues, onSubmit, onCancel }: CardFormProps) => {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<CardFormData>({
        resolver: zodResolver(cardSchema),
        defaultValues: {
            title: initialValues?.title || 'Nova Tarefa',
            description: initialValues?.description || '',
        },
    });

    const descriptionValue = watch('description');

    // Effect to "block" writing beyond 200 chars if somehow pasted or forced
    useEffect(() => {
        if (descriptionValue && descriptionValue.length > 200) {
            setValue('description', descriptionValue.substring(0, 200));
        }
    }, [descriptionValue, setValue]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-primary">Título</label>
                <input
                    {...register('title')}
                    type="text"
                    placeholder="Ex: Refatorar componente X"
                    className={`w-full px-4 py-2 rounded-xl border ${
                        errors.title ? 'border-error' : 'border-outline'
                    } focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
                />
                {errors.title && (
                    <span className="text-xs text-error">{errors.title.message}</span>
                )}
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-primary">Descrição</label>
                    <span className={`text-xs ${descriptionValue?.length >= 200 ? 'text-error font-bold' : 'text-on-surface-variant'}`}>
                        {descriptionValue?.length || 0}/200
                    </span>
                </div>
                <textarea
                    {...register('description', {
                        onChange: (e) => {
                            if (e.target.value.length > 200) {
                                e.target.value = e.target.value.substring(0, 200);
                            }
                        }
                    })}
                    placeholder="Dê mais detalhes sobre a tarefa..."
                    className={`w-full px-4 py-2 rounded-xl border ${
                        errors.description ? 'border-error' : 'border-outline'
                    } focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[120px] resize-none`}
                />
                {errors.description && (
                    <span className="text-xs text-error">{errors.description.message}</span>
                )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-variant">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2 rounded-full border border-outline text-primary font-label hover:bg-primary/5 transition-colors"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="px-6 py-2 rounded-full bg-primary text-on-primary font-label hover:shadow-lg transition-all"
                >
                    Salvar
                </button>
            </div>
        </form>
    );
};

export default CardForm;
