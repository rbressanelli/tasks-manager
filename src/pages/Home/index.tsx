import { useState, useEffect, useRef } from 'react';
import Card from '../../components/Card';
import { DragDropProvider, useDroppable } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Helper to move items within the same array
function arrayMove<T>(array: T[], from: number, to: number): T[] {
    const newArray = array.slice();
    newArray.splice(to < 0 ? newArray.length + to : to, 0, newArray.splice(from, 1)[0]);
    return newArray;
}

function SortableCard({ id, index, group }: { id: string; index: number; group: string }) {
    // Configures the card as a sortable element
    const { ref } = useSortable({
        id,
        index,
        group,
    });

    return (
        <Card ref={ref}>Card {id}</Card>
    );
}

function DroppableZone({ id, children, horizontal }: { id: string; children: React.ReactNode, horizontal?: boolean }) {
    // Makes the container react to drops so you can drop back into empty areas
    const { ref } = useDroppable({
        id,
    });

    return (
        <div ref={ref} style={{
            width: horizontal ? '100%' : 300,
            minHeight: horizontal ? 140 : 300,
            border: horizontal ? '2px dashed #ccc' : '2px solid #ccc',
            display: 'flex',
            flexDirection: horizontal ? 'row' : 'column',
            gap: '10px',
            padding: '10px',
            alignItems: 'center',
            boxSizing: 'border-box',
            marginBottom: horizontal ? '40px' : '0',
            flexWrap: horizontal ? 'wrap' : 'nowrap'
        }}>
            {children}
        </div>
    );
}


const Home = () => {
    const { logout } = useAuth();
    const targets = ['A', 'B', 'C'];

    // Track cards per group explicitly to maintain strict ordering
    // 'outside' is the top pool area
    const [lists, setLists] = useState<Record<string, string[]>>({
        'outside': ['1'],
        'A': [],
        'B': [],
        'C': []
    });
    const [nextId, setNextId] = useState(2);

    const isInitialMount = useRef(true);
    const hasLoaded = useRef(false);

    useEffect(() => {
        const fetchState = async () => {
            try {
                const docRef = doc(db, 'app_state', 'main');
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setLists(data.lists);
                    setNextId(data.nextId);
                } else {
                    // Add default config if it doesn't exist
                    await setDoc(docRef, { lists, nextId });
                }
            } catch (err) {
                console.error("Failed to load state from Firebase", err);
            } finally {
                hasLoaded.current = true;
            }
        };
        fetchState();
    }, []);

    useEffect(() => {
        if (!hasLoaded.current) return;
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        const timeoutId = setTimeout(async () => {
            try {
                const docRef = doc(db, 'app_state', 'main');
                await setDoc(docRef, { lists, nextId }, { merge: true });
            } catch (err) {
                console.error("Failed to save state to Firebase", err);
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [lists, nextId]);

    const handleAddCard = () => {
        const newId = String(nextId);
        setNextId(n => n + 1);
        setLists(prev => ({ ...prev, 'outside': [...prev['outside'], newId] }));
    };

    const handleDragEvent = (event: any) => {
        if (event.canceled) return;

        const sourceId = event.operation?.source?.id as string;
        const targetId = event.operation?.target?.id as string | undefined;

        if (!sourceId || !targetId) return;

        // 1. Locate the source list and index of the dragged card
        let sourceGroup = '';
        let sourceIndex = -1;
        for (const [groupName, cards] of Object.entries(lists)) {
            const idx = cards.indexOf(sourceId);
            if (idx !== -1) {
                sourceGroup = groupName;
                sourceIndex = idx;
                break;
            }
        }

        if (!sourceGroup) return;

        // 2. Locate the target destination
        let targetGroup = '';
        let targetIndex = -1;

        // First check if targetId matches an empty Droppable zone identifier
        if (lists[targetId] !== undefined) {
            targetGroup = targetId;
            targetIndex = lists[targetId].length; // push to the end
        } else {
            // Unlikely to drop on background, usually drops on another card
            for (const [groupName, cards] of Object.entries(lists)) {
                const idx = cards.indexOf(targetId);
                if (idx !== -1) {
                    targetGroup = groupName;
                    targetIndex = idx;
                    break;
                }
            }
        }

        if (!targetGroup) return;

        // Optimization: Skip state updates if nothing moved
        if (sourceGroup === targetGroup && sourceIndex === targetIndex) {
            return;
        }

        // 3. Apply the movement to our arrays
        setLists(prev => {
            const newLists = { ...prev };

            if (sourceGroup === targetGroup) {
                // Reorder within the same list
                newLists[sourceGroup] = arrayMove(newLists[sourceGroup], sourceIndex, targetIndex);
            } else {
                // Move from source list into target list exactly between cards
                const sourceClone = [...newLists[sourceGroup]];
                const targetClone = [...newLists[targetGroup]];

                sourceClone.splice(sourceIndex, 1);
                targetClone.splice(targetIndex, 0, sourceId);

                newLists[sourceGroup] = sourceClone;
                newLists[targetGroup] = targetClone;
            }
            return newLists;
        });
    };

    return (
        <>
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                <button onClick={handleAddCard} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', borderRadius: '8px', border: '1px solid #ccc' }}>Criar novo card</button>
                <button type='button'
                    onClick={logout}
                    style={{
                        // background: 'transparent',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem'
                    }}
                >
                    {/* <LogOut size={18} /> */}
                    <span>Sair</span>
                </button>
            </div>
            <DragDropProvider onDragOver={handleDragEvent} onDragEnd={handleDragEvent}>
                {/* Top Pool */}
                <DroppableZone id="outside" horizontal={true}>
                    {lists['outside'].map((cardId, index) => (
                        <SortableCard key={cardId} id={cardId} index={index} group="outside" />
                    ))}
                </DroppableZone>

                {/* 3 Droppable lists */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    {targets.map((id) => (
                        <DroppableZone key={id} id={id}>
                            {lists[id].map((cardId, index) => (
                                <SortableCard key={cardId} id={cardId} index={index} group={id} />
                            ))}
                        </DroppableZone>
                    ))}
                </div>
            </DragDropProvider>
        </>
    )
};


import React from 'react';
import { useAuth } from '../../context/AuthContext';

class ErrorBoundary extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: any) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return <div style={{ padding: 20, color: 'red' }}><h1>Something went wrong.</h1><pre>{this.state.error.message}</pre></div>;
        }
        return this.props.children;
    }
}

export default function HomeWithErrorBoundary() {
    return (
        <ErrorBoundary>
            <Home />
        </ErrorBoundary>
    );
}
