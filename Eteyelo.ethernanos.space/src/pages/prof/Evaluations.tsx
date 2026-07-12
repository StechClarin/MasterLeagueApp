import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Search, Edit3, Trash2, CheckCircle, Clock, AlertTriangle, X, Save, ChevronDown, Check } from 'lucide-react';

const initialEvaluations = [
  { id: 1, title: 'Devoir Surveillé 1', class: 'Terminale S', date: '10 Juin 2026', type: 'DS', status: 'Corrigé', average: '13.2', period: 'Trimestre 1' },
  { id: 2, title: 'Interrogation Écrite', class: '1ère S', date: '12 Juin 2026', type: 'CC', status: 'À corriger', average: '-', period: 'Trimestre 1' },
  { id: 3, title: 'Examen Blanc', class: 'Terminale S', date: '15 Juin 2026', type: 'Examen', status: 'À venir', average: '-', period: 'Trimestre 1' },
  { id: 4, title: 'Devoir Maison', class: 'Seconde A', date: '05 Juin 2026', type: 'DS', status: 'Corrigé', average: '14.5', period: 'Trimestre 1' },
];

const AVAILABLE_ROOMS = ['Salle 101', 'Salle 102', 'Salle 201', 'Labo Physique', 'Labo Chimie', 'Amphi A', 'Gymnase'];

const EvaluationsProf: React.FC = () => {
  const [evaluations, setEvaluations] = useState(initialEvaluations);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    type: 'CC',
    subject: 'Mathématiques',
    classTarget: 'Terminale S',
    date: '',
    maxScore: '20',
    academicPeriod: 'Trimestre 1',
    startTime: '',
    rooms: [] as string[]
  });

  const [isRoomSelectOpen, setIsRoomSelectOpen] = useState(false);
  const roomSelectRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  // Close custom select when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (roomSelectRef.current && !roomSelectRef.current.contains(event.target as Node)) {
        setIsRoomSelectOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [roomSelectRef]);

  const filteredEvals = evaluations.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.class.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    const newEval = {
      id: Date.now(),
      title: formData.title,
      class: formData.classTarget,
      date: formData.date ? new Date(formData.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : 'À définir',
      type: formData.type,
      status: 'À venir',
      average: '-',
      period: formData.academicPeriod
    };
    
    setEvaluations([newEval, ...evaluations]);
    setIsModalOpen(false);
    // Reset form
    setFormData({
      title: '', type: 'CC', subject: 'Mathématiques', classTarget: 'Terminale S', date: '', maxScore: '20', academicPeriod: 'Trimestre 1', startTime: '', rooms: []
    });
  };

  const toggleRoom = (room: string) => {
    setFormData(prev => {
      const isSelected = prev.rooms.includes(room);
      return {
        ...prev,
        rooms: isSelected 
          ? prev.rooms.filter(r => r !== room)
          : [...prev.rooms, room]
      };
    });
  };

  return (
    <div className="animate-fade-in" style={{ position: 'relative' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Évaluations</h1>
          <p className="page-subtitle">Gérez vos devoirs et examens.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="glass-card hover-lift" style={{ 
          display: 'flex', alignItems: 'center', gap: '8px', 
          padding: '12px 24px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
        }}>
          <Plus size={20} />
          Nouvelle Évaluation
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(236, 72, 153, 0.2)', padding: '8px', borderRadius: '8px' }}>
              <FileText size={24} color="var(--secondary)" />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Liste des Évaluations</h2>
          </div>

          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Rechercher une évaluation..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                width: '100%', padding: '12px 12px 12px 40px', 
                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', 
                borderRadius: '8px', color: 'var(--text-main)', outline: 'none'
              }} 
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {filteredEvals.map((evalItem) => (
            <div key={evalItem.id} className="glass-card hover-lift" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, width: 'fit-content',
                    background: evalItem.type === 'DS' ? 'rgba(99, 102, 241, 0.2)' : evalItem.type === 'Examen' ? 'rgba(236, 72, 153, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    color: evalItem.type === 'DS' ? 'var(--primary)' : evalItem.type === 'Examen' ? 'var(--secondary)' : 'var(--warning)'
                  }}>
                    {evalItem.type}
                  </span>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, marginTop: '8px' }}>{evalItem.title}</h3>
                  <div style={{ color: 'var(--text-muted)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {evalItem.class} <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-muted)' }}></span> {evalItem.period}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => navigate(`/prof/evaluations/${evalItem.id}/grades`)}
                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '8px', borderRadius: '8px', color: 'var(--text-main)', cursor: 'pointer' }} 
                    title="Modifier / Saisir les notes"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', padding: '8px', borderRadius: '8px', color: 'var(--danger)', cursor: 'pointer' }} title="Supprimer">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '16px 0', borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Date</div>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>{evalItem.date}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Moyenne</div>
                  <div style={{ fontSize: '14px', fontWeight: evalItem.average !== '-' ? 700 : 500, color: evalItem.average !== '-' ? 'var(--success)' : 'inherit' }}>
                    {evalItem.average}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', 
                color: evalItem.status === 'Corrigé' ? 'var(--success)' : evalItem.status === 'À corriger' ? 'var(--warning)' : 'var(--text-muted)',
                fontWeight: 600, fontSize: '14px'
              }}>
                {evalItem.status === 'Corrigé' && <CheckCircle size={18} />}
                {evalItem.status === 'À corriger' && <AlertTriangle size={18} />}
                {evalItem.status === 'À venir' && <Clock size={18} />}
                {evalItem.status}
              </div>
            </div>
          ))}

          {filteredEvals.length === 0 && (
            <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed var(--glass-border)' }}>
              Aucune évaluation trouvée pour "{searchTerm}".
            </div>
          )}
        </div>
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)', padding: '20px'
        }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '800px', margin: 'auto', padding: '0', overflow: 'visible', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Créer une Évaluation</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>Session d'évaluation pour une classe spécifique.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-muted)', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateEvaluation} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                
                {/* COLONNE GAUCHE : IDENTIFICATION */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px', margin: 0 }}>
                    Identification de l'épreuve
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type d'Évaluation</label>
                    <select 
                      required
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
                    >
                      <option value="CC">Contrôle Continu (CC)</option>
                      <option value="DS">Devoir Surveillé (DS)</option>
                      <option value="Examen">Examen Périodique</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Titre</label>
                    <input 
                      type="text" required placeholder="ex: Séquence 1"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Matière</label>
                    <select 
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
                    >
                      <option value="Mathématiques">Mathématiques</option>
                      <option value="Physique">Physique</option>
                      <option value="SVT">SVT</option>
                      <option value="Français">Français</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Classe ciblée</label>
                    <select 
                      required
                      value={formData.classTarget}
                      onChange={(e) => setFormData({...formData, classTarget: e.target.value})}
                      style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
                    >
                      <option value="Terminale S">Terminale S</option>
                      <option value="1ère S">1ère S</option>
                      <option value="Seconde A">Seconde A</option>
                      <option value="3ème A">3ème A</option>
                    </select>
                  </div>
                </div>

                {/* COLONNE DROITE : LOGISTIQUE */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px', margin: 0 }}>
                    Logistique & Planification
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Période Académique</label>
                    <select 
                      required
                      value={formData.academicPeriod}
                      onChange={(e) => setFormData({...formData, academicPeriod: e.target.value})}
                      style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
                    >
                      <option value="Trimestre 1">Trimestre 1</option>
                      <option value="Trimestre 2">Trimestre 2</option>
                      <option value="Trimestre 3">Trimestre 3</option>
                      <option value="Semestre 1">Semestre 1</option>
                      <option value="Semestre 2">Semestre 2</option>
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date Prévue</label>
                      <input 
                        type="date" required
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Heure de début</label>
                      <input 
                        type="time" required
                        value={formData.startTime}
                        onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                        style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }} ref={roomSelectRef}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Salles assignées</label>
                    <div 
                      onClick={() => setIsRoomSelectOpen(!isRoomSelectOpen)}
                      style={{ 
                        padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: '8px', 
                        color: formData.rooms.length > 0 ? 'var(--text-main)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
                      }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {formData.rooms.length > 0 ? formData.rooms.join(', ') : 'Sélectionner des salles...'}
                      </span>
                      <ChevronDown size={16} />
                    </div>
                    
                    {isRoomSelectOpen && (
                      <div style={{ 
                        position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', background: '#1e293b', 
                        border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '8px', zIndex: 10,
                        boxShadow: '0 10px 25px rgba(0,0,0,0.5)', maxHeight: '200px', overflowY: 'auto',
                        display: 'flex', flexDirection: 'column', gap: '4px'
                      }}>
                        {AVAILABLE_ROOMS.map(room => {
                          const isSelected = formData.rooms.includes(room);
                          return (
                            <div 
                              key={room}
                              onClick={() => toggleRoom(room)}
                              className="hover-bg"
                              style={{ 
                                padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                                color: isSelected ? 'var(--primary)' : 'var(--text-main)'
                              }}
                            >
                              <span style={{ fontSize: '14px', fontWeight: isSelected ? 600 : 400 }}>{room}</span>
                              {isSelected && <Check size={16} color="var(--primary)" />}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Base de notation</label>
                    <select 
                      required
                      value={formData.maxScore}
                      onChange={(e) => setFormData({...formData, maxScore: e.target.value})}
                      style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
                    >
                      <option value="10">Sur 10</option>
                      <option value="20">Sur 20</option>
                      <option value="40">Sur 40</option>
                    </select>
                  </div>
                </div>

              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px', paddingTop: '24px', borderTop: '1px solid var(--glass-border)' }}>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '12px 24px', background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--glass-border)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                  className="hover-bg"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  style={{ padding: '12px 24px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
                  className="hover-lift"
                >
                  <Save size={18} />
                  Créer l'évaluation
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationsProf;
