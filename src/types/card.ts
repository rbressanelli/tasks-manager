export interface CardMetadata {
    title: string;
    description: string;
}

export interface DragDropState {
    lists: Record<string, string[]>;
    cardsMetadata: Record<string, CardMetadata>;
    nextId: number;
}
