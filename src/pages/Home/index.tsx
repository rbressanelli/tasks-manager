import { useState, useEffect, useRef } from 'react';
import React from 'react';
import Card from '../../components/Card';
import { DragDropProvider, useDroppable } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import SideBar from '../../components/SideBar';

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
    <Card ref={ref}>Card {group}</Card>
  );
}

function DroppableZone({ id, title, children, horizontal, backgroundColor, headerColor }: { id: string; title: string, children: React.ReactNode, horizontal?: boolean, backgroundColor?: string, headerColor?: string }) {
  // Makes the container react to drops so you can drop back into empty areas
  const { ref } = useDroppable({
    id,
  });

  return (
    <div ref={ref} style={{
      width: horizontal ? '100%' : 300,
      minHeight: horizontal ? '80vh' : 300,
      border: '1px solid #ccc',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxSizing: 'border-box',
      flexWrap: horizontal ? 'wrap' : 'nowrap',
      backgroundColor: backgroundColor || 'transparent',
      borderRadius: '12px',
      transition: 'background-color 0.3s ease',
      overflow: 'hidden' // Ensure header corners are rounded as well
    }}>
      {/* Header da Coluna */}
      <div style={{
        width: '100%',
        backgroundColor: headerColor || '#ccc',
        padding: '12px',
        textAlign: 'center',
        boxSizing: 'border-box',
        marginBottom: '15px'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '16px',
          color: '#fff',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          {title}
        </h3>
      </div>

      {/* Container de cards para garantir padding interno */}
      <div style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        padding: '0 20px 20px 20px',
        boxSizing: 'border-box'
      }}>
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
        borderRight: isSidebarOpen ? '1px solid #ccc' : 'none',
        position: 'fixed',
        zIndex: 1000,
        height: '100vh',
        top: 0,
        left: 0,
      }}>
        <SideBar onAddCard={handleAddCard} />
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: '0 20px 20px 0', transition: 'margin-left 0.3s ease', marginLeft: isSidebarOpen ? '300px' : '0' }}>
        <div style={{ position: 'fixed', zIndex: 1000,  width: '100%', backgroundColor: 'white',opacity: 0.5, boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'}}>

          {/* Top Header/Action Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            // marginBottom: '20px',
            gap: '10px',

            padding: '10px',
            borderRadius: '5px',
            // boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
          }}>
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
          </div></div>

        <DragDropProvider onDragOver={handleDragEvent} onDragEnd={handleDragEvent}>
          {/* 5 Droppable lists */}
          <div style={{ display: 'flex', gap: '15px', overflow: 'auto', padding: '80px 0 0 20px' }}>
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
