import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

interface SideBarProps {
    onAddCard: () => void;
}

const SideBar: React.FC<SideBarProps> = ({ onAddCard }) => {
    const { logout } = useAuth();
    const [dateTime, setDateTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setDateTime(new Date());
        }, 60000); // Atualiza a cada minuto

        return () => clearInterval(timer);
    }, []);

    const formatDate = (date: Date) => {
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = date.getFullYear();
        const hh = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');
        return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
    };

    return (
        <aside style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            alignItems: 'center',
            padding: '20px 0',
            boxSizing: 'border-box',
            position: 'relative'
        }}>
            {/* Botão Criar Card - 20% abaixo do topo */}
            <div style={{ marginTop: '20%', width: '100%', display: 'flex', justifyContent: 'center' }}>
                <button 
                    onClick={onAddCard}
                    style={{
                        width: '70%',
                        padding: '12px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: 'white',
                        backgroundColor: '#445e90',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 6px rgba(68, 94, 144, 0.2)',
                        transition: 'transform 0.1s active'
                    }}
                >
                    Criar card
                </button>
            </div>

            {/* Espaçador flexível */}
            <div style={{ flex: 1 }}></div>

            {/* Seção Inferior: Data e Logout */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px', gap: '15px' }}>
                <div style={{ 
                    fontSize: '14px', 
                    color: '#586064', 
                    fontWeight: '500', 
                    fontFamily: 'Inter, sans-serif' 
                }}>
                    {formatDate(dateTime)}
                </div>

                <button 
                    onClick={logout}
                    style={{
                        width: '70%',
                        padding: '10px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#9f403d',
                        backgroundColor: 'transparent',
                        border: '2px solid #9f403d',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(159, 64, 61, 0.05)')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                    Sair
                </button>
            </div>
        </aside>
    );
};

export default SideBar;