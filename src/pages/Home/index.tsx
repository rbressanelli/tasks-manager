import { useState, useEffect, useRef, type SetStateAction, type Dispatch } from 'react';
import React from 'react';
import Card from '../../components/Card';
import { DragDropProvider, useDroppable } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import SideBar from '../../components/SideBar';
import Header from '../../components/Header';
import ModalCard from '../../components/ModalCard';
import CardForm from '../../components/CardForm';
import type { CardMetadata } from '../../types/card';

// Helper to move items within the same array
function arrayMove<T>(array: T[], from: number, to: number): T[] {
  const newArray = array.slice();
  newArray.splice(to < 0 ? newArray.length + to : to, 0, newArray.splice(from, 1)[0]);
  return newArray;
}
function SortableCard({ id, index, group, modal, onDelete, data }: { 
  id: string; 
  index: number; 
  group: string, 
  modal: (id: string) => void,
  onDelete: (id: string) => void,
  data?: CardMetadata
}) {
  // Configures the card as a sortable element
  const { ref } = useSortable({
    id,
    index,
    group,
  });

  return (
    <Card 
        ref={ref} 
        onOpenModal={() => modal(id)}
        onOpenDeleteModal={() => onDelete(id)}
    >
        <div className="flex flex-col gap-1">
            <h4 className="font-headline font-bold text-primary text-sm truncate">{data?.title || 'Sem título'}</h4>
            <p className="text-xs text-on-surface-variant line-clamp-2">{data?.description || ''}</p>
        </div>
    </Card>
  );
}

function DroppableZone({ id, title, children, horizontal, backgroundColor, headerColor }: { id: string; title: string, children: React.ReactNode, horizontal?: boolean, backgroundColor?: string, headerColor?: string }) {
  // Makes the container react to drops so you can drop back into empty areas
  const { ref } = useDroppable({
    id,
  });

  return (
    <div
      ref={ref}
      className={`border border-[#ccc] flex flex-col items-center box-border rounded-[12px] transition-colors duration-300 ease-in-out overflow-hidden ${horizontal ? 'w-full min-h-[80vh] flex-wrap' : 'w-[300px] min-h-[300px] flex-nowrap'
        }`}
      style={{ backgroundColor: backgroundColor || 'transparent' }}
    >
      {/* Header da Coluna */}
      <div
        className="w-full p-[12px] text-center box-border mb-[15px]"
        style={{ backgroundColor: headerColor || '#ccc' }}
      >
        <h3 className="m-0 text-[16px] text-white font-bold uppercase tracking-[1px]">
          {title}
        </h3>
      </div>

      {/* Container de cards para garantir padding interno */}
      <div className="w-full flex flex-col items-center gap-[10px] px-[20px] pb-[20px] pt-0 box-border">
        {children}
      </div>
    </div>
  );
}


const Home = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const targets = ['A', 'B', 'C', 'D', 'E'];

  // Map of specific pastel colors for each target
  const zoneColors: Record<string, string> = {
    'A': '#e3f2fd', // Pastel Blue
    'B': '#e8f5e9', // Pastel Green
    'C': '#fff9c4', // Pastel Gold/Yellow
    'D': '#fff3e0', // Pastel Orange
    'E': '#f3e5f5'  // Pastel Violet
  };

  // Map of darker colors for headers
  const headerColors: Record<string, string> = {
    'A': '#42a5f5',
    'B': '#66bb6a',
    'C': '#fbc02d',
    'D': '#ffa726',
    'E': '#ab47bc'
  };

  // Custom titles for each column
  const zoneTitles: Record<string, string> = {
    'A': 'Backlog',
    'B': 'To Do',
    'C': 'In Progress',
    'D': 'Review',
    'E': 'Done'
  };

  // Track cards per group explicitly to maintain strict ordering
  // 'outside' is the top pool area
  const [lists, setLists] = useState<Record<string, string[]>>({
    'outside': ['1'],
    'A': [],
    'B': [],
    'C': [],
    'D': [],
    'E': []
  });
  const [nextId, setNextId] = useState(2);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [cardsMetadata, setCardsMetadata] = useState<Record<string, CardMetadata>>({
    '1': { title: 'Nova Tarefa', description: 'Clique em editar para adicionar uma descrição' }
  });

  const isInitialMount = useRef(true);
  const hasLoaded = useRef(false);

  useEffect(() => {
    const fetchState = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          // Merge loaded data with existing structure to ensure new columns ('D', 'E') are present
          setLists(prev => ({ ...prev, ...data.lists }));
          setCardsMetadata(data.cardsMetadata || {});
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
  }, [user]);

  useEffect(() => {
    if (!hasLoaded.current || !user) return;
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const timeoutId = setTimeout(async () => {
      try {
        const docRef = doc(db, 'users', user.uid);
        await setDoc(docRef, { lists, nextId, cardsMetadata }, { merge: true });
      } catch (err) {
        console.error("Failed to save state to Firebase", err);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [lists, nextId, cardsMetadata, user]);

  const handleAddCard = () => {
    const newId = String(nextId);
    setNextId(n => n + 1);
    setLists(prev => ({ ...prev, 'A': [...prev['A'], newId] }));
    setCardsMetadata(prev => ({
      ...prev,
      [newId]: { title: 'Nova Tarefa', description: '' }
    }));
  };

  const handleOpenDeleteModal = (id: string) => {
    setCardToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!cardToDelete) return;

    setLists(prev => {
      const newLists = { ...prev };
      for (const group in newLists) {
        newLists[group] = newLists[group].filter(id => id !== cardToDelete);
      }
      return newLists;
    });

    setCardsMetadata(prev => {
        const newMetadata = { ...prev };
        delete newMetadata[cardToDelete];
        return newMetadata;
    });

    setIsDeleteModalOpen(false);
    setCardToDelete(null);
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

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out bg-[#f4f4f4] fixed z-[1000] h-screen top-0 left-0 ${isSidebarOpen ? 'w-[300px] border-r border-[#ccc]' : 'w-0 border-none'
          }`}
      >
        <SideBar onAddCard={handleAddCard} />
      </div>

      {/* Main Content Area */}
      <div
        className={`flex-1 pr-[20px] pb-[20px] pt-0 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-[300px]' : 'ml-0'
          }`}
      >
        {/* Top Header/Action Bar */}
        <Header toggleSidebar={toggleSidebar} />

        <ModalCard isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingCardId(null);
          }}
          title={editingCardId ? "Editar Tarefa" : "Nova Tarefa"}
        >
            <CardForm 
                initialValues={editingCardId ? cardsMetadata[editingCardId] : undefined}
                onCancel={() => {
                    setIsModalOpen(false);
                    setEditingCardId(null);
                }}
                onSubmit={(data) => {
                    if (editingCardId) {
                        setCardsMetadata(prev => ({
                            ...prev,
                            [editingCardId]: data
                        }));
                    }
                    setIsModalOpen(false);
                    setEditingCardId(null);
                }}
            />
        </ModalCard>

        <ModalCard 
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Confirmar Exclusão"
          footer={
            <>
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-6 py-2 rounded-full border border-outline text-primary font-label hover:bg-primary/5 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmDelete}
                className="px-6 py-2 rounded-full bg-error text-on-error font-label hover:shadow-lg transition-all"
              >
                Excluir
              </button>
            </>
          }
        >
          <div className="py-2">
            <p className="text-on-surface-variant font-body">
              Você tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.
            </p>
          </div>
        </ModalCard>

        <DragDropProvider onDragOver={handleDragEvent} onDragEnd={handleDragEvent}>
          {/* 5 Droppable lists */}
          <div className="flex gap-[15px] overflow-auto pt-[80px] pb-0 pr-0 pl-[20px]">
            {targets.map((id) => (
              <DroppableZone
                key={id}
                id={id}
                title={zoneTitles[id]}
                horizontal={true}
                backgroundColor={zoneColors[id]}
                headerColor={headerColors[id]}
              >
                {(lists[id] || []).map((cardId, index) => (
                  <SortableCard 
                    key={cardId} 
                    id={cardId} 
                    index={index} 
                    group={id} 
                    modal={(id) => {
                        setEditingCardId(id);
                        setIsModalOpen(true);
                    }}
                    onDelete={handleOpenDeleteModal}
                    data={cardsMetadata[cardId]}
                  />
                ))}
              </DroppableZone>
            ))}
          </div>
        </DragDropProvider>
      </div>
    </div>
  );
};
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
