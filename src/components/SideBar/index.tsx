import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

interface SideBarProps {
    onAddCard: () => void;
}

type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];

const SideBar: React.FC<SideBarProps> = ({ onAddCard }) => {
    const { logout, user } = useAuth();
    const [dateTime, setDateTime] = useState(new Date());
    const [value, onChange] = useState<Value>(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setDateTime(new Date());
        }, 60000); // Atualiza a cada minuto

        return () => clearInterval(timer);
    }, []);

    return (
        <aside style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            alignItems: 'center',
            padding: '20px 10px',
            boxSizing: 'border-box',
            position: 'relative'
        }}>
            <div style={{ marginTop: '10%', width: '70%', display: 'flex', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px', height: '50px', alignItems: 'center', backgroundColor: '#ee9014ff', borderRadius: '50px' }}>
                <p className="text-center text-white truncate w-50">{user?.email}</p>
            </div>

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
                    Criar Tarefa
                </button>
            </div>

            {/* Espaçador flexível */}
            <div style={{ flex: 1 }}></div>
            <Calendar className='mb-20' calendarType='gregory' onChange={onChange} value={value} />

            {/* Seção Inferior: Data e Logout */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px', gap: '15px' }}>
                <div style={{
                    fontSize: '14px',
                    color: '#586064',
                    fontWeight: '500',
                    fontFamily: 'Inter, sans-serif'
                }}>
                    {dateTime.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
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