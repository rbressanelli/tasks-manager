import { useState, useEffect, useRef } from 'react';
import React from 'react';
import Card from '../../components/Card';
import { DragDropProvider, useDroppable } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import AsideBar from '../../components/AsideBar';

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
  const { logout, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const targets = ['A', 'B', 'C', 'D', 'E'];

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
        await setDoc(docRef, { lists, nextId }, { merge: true });
      } catch (err) {
        console.error("Failed to save state to Firebase", err);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [lists, nextId, user]);

  const handleAddCard = () => {
    const newId = String(nextId);
    setNextId(n => n + 1);
    setLists(prev => ({ ...prev, 'A': [...prev['A'], newId] }));
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
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {/* Sidebar */}
      <div style={{
        width: isSidebarOpen ? '300px' : '0',
        overflow: 'hidden',
        transition: 'width 0.3s ease',
        background: '#f4f4f4',
        borderRight: isSidebarOpen ? '1px solid #ccc' : 'none'
      }}>
        <AsideBar />
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: '20px', transition: 'margin-left 0.3s ease' }}>
        {/* Top Header/Action Bar */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          marginBottom: '20px',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button 
              onClick={toggleSidebar}
              title="Alternar Sidebar"
              style={{
                fontSize: '24px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ☰
            </button>
            <button onClick={handleAddCard} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', borderRadius: '8px', border: '1px solid #ccc' }}>Criar novo card</button>
          </div>
          
          <button type='button'
            onClick={logout}
            style={{
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            <span>Sair</span>
          </button>
        </div>

        <DragDropProvider onDragOver={handleDragEvent} onDragEnd={handleDragEvent}>
          {/* 5 Droppable lists */}
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '20px' }}>
            {targets.map((id) => (
              <DroppableZone key={id} id={id}>
                {(lists[id] || []).map((cardId, index) => (
                  <SortableCard key={cardId} id={cardId} index={index} group={id} />
                ))}
              </DroppableZone>
            ))}
          </div>
        </DragDropProvider>
      </div>
    </div>
  )
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
