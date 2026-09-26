import React, { useState, useEffect, useCallback } from 'react';
import { Award, BookOpen, CheckCircle, Save, Search, Users, RefreshCw, AlertCircle, Check, Calendar, Sparkles } from 'lucide-react';
import { fetchManagerGrades, saveManagerGrades } from '../../lib/api';
import type { ManagerGradeItem } from '../../lib/api';

interface OptionItem {
  id: string;
  name: string;
}

export function getAppreciation(val: number | null | undefined): { text: string; bg: string; color: string } {
  if (val === null || val === undefined || isNaN(val)) {
    return { text: '-', bg: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8' };
  }
  if (val >= 18) return { text: 'Excellent', bg: 'rgba(16, 185, 129, 0.2)', color: '#10b981' };
  if (val >= 16) return { text: 'Très Bien', bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981' };
  if (val >= 14) return { text: 'Bien', bg: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' };
  if (val >= 12) return { text: 'Assez Bien', bg: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' };
  if (val >= 10) return { text: 'Passable', bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' };
  if (val >= 8) return { text: 'Insuffisant', bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' };
  if (val >= 6) return { text: 'Faible', bg: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' };
  return { text: 'Très Faible', bg: 'rgba(239, 68, 68, 0.25)', color: '#dc2626' };
}

export const GradesManager: React.FC = () => {
  const [evaluations, setEvaluations] = useState<OptionItem[]>([]);
  const [classrooms, setClassrooms] = useState<OptionItem[]>([]);
  const [subjects, setSubjects] = useState<OptionItem[]>([]);

  // Cascading Filter state: Évaluation (Examen) -> Classe -> Matière
  const [selectedEval, setSelectedEval] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');

  const [students, setStudents] = useState<ManagerGradeItem[]>([]);
  const [evaluationSubjectId, setEvaluationSubjectId] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Editable local grade values: studentId -> { grade: string, comment: string }
  const [gradeInputs, setGradeInputs] = useState<Record<string, { grade: string; comment: string }>>({});

  const loadGradesData = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await fetchManagerGrades(
        selectedEval || undefined,
        selectedClass || undefined,
        selectedSubject || undefined
      );

      setEvaluations(data.evaluations || []);
      setClassrooms(data.classrooms || []);
      setSubjects(data.subjects || []);

      // Synchronisation en cascade des sélections actives retournées par le backend
      if (data.selectedEvalId && data.selectedEvalId !== selectedEval) {
        setSelectedEval(data.selectedEvalId);
      } else if (!selectedEval && data.evaluations?.length > 0) {
        setSelectedEval(data.evaluations[0].id);
      }

      if (data.selectedClassId && data.selectedClassId !== selectedClass) {
        setSelectedClass(data.selectedClassId);
      } else if (!selectedClass && data.classrooms?.length > 0) {
        setSelectedClass(data.classrooms[0].id);
      }

      if (data.selectedSubjectId && data.selectedSubjectId !== selectedSubject) {
        setSelectedSubject(data.selectedSubjectId);
      } else if (!selectedSubject && data.subjects?.length > 0) {
        setSelectedSubject(data.subjects[0].id);
      }

      setStudents(data.students || []);
      setEvaluationSubjectId(data.evaluationSubjectId || null);

      // Saisie locale et calcul dynamique de l'appréciation
      const initialInputs: Record<string, { grade: string; comment: string }> = {};
      (data.students || []).forEach((st) => {
        const gradeVal = st.grade !== null && st.grade !== undefined ? String(st.grade) : '';
        const numVal = gradeVal !== '' ? parseFloat(gradeVal) : null;
        const autoApp = getAppreciation(numVal).text;

        initialInputs[st.id] = {
          grade: gradeVal,
          comment: st.comment || (autoApp !== '-' ? autoApp : ''),
        };
      });
      setGradeInputs(initialInputs);
    } catch (err: any) {
      console.error('Erreur chargement des notes:', err);
      setErrorMsg('Impossible de charger la grille de saisie des notes.');
    } finally {
      setLoading(false);
    }
  }, [selectedEval, selectedClass, selectedSubject]);

  useEffect(() => {
    loadGradesData();
  }, [selectedEval, selectedClass, selectedSubject, loadGradesData]);

  // Quand la note change, l'appréciation se met à jour dynamiquement
  const handleGradeInputChange = (studentId: string, val: string) => {
    const numVal = val !== '' && !isNaN(parseFloat(val)) ? parseFloat(val) : null;
    const dynamicApp = getAppreciation(numVal).text;

    setGradeInputs((prev) => {
      const currentComment = prev[studentId]?.comment || '';
      // Si le commentaire était vide ou était une appréciation automatique précédente, on le met à jour automatiquement
      const isAutoComment =
        !currentComment ||
        ['Excellent', 'Très Bien', 'Bien', 'Assez Bien', 'Passable', 'Insuffisant', 'Faible', 'Très Faible', '-'].includes(
          currentComment
        );

      return {
        ...prev,
        [studentId]: {
          grade: val,
          comment: isAutoComment ? (dynamicApp !== '-' ? dynamicApp : '') : currentComment,
        },
      };
    });
    setSavedSuccess(false);
  };

  const handleSaveAllGrades = async () => {
    if (students.length === 0) return;
    setSaving(true);
    setErrorMsg(null);
    setSavedSuccess(false);

    try {
      const gradesToSave = students.map((st) => {
        const inp = gradeInputs[st.id] || { grade: '', comment: '' };
        const parsedGrade = inp.grade !== '' && !isNaN(parseFloat(inp.grade)) ? parseFloat(inp.grade) : null;
        return {
          student_id: st.id,
          value: parsedGrade,
          comment: inp.comment,
          absence_status: 'NONE',
        };
      });

      const res = await saveManagerGrades({
        evaluation_id: evaluationSubjectId || undefined,
        evaluation_session_id: selectedEval || undefined,
        classroom_id: selectedClass || '',
        subject_id: selectedSubject || '',
        grades: gradesToSave,
      });

      if (res.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
        loadGradesData();
      } else {
        setErrorMsg(res.error || 'Erreur lors de l’enregistrement des notes.');
      }
    } catch (err: any) {
      console.error('Erreur sauvegarde des notes:', err);
      setErrorMsg(err.message || 'Erreur lors de la sauvegarde des notes.');
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.lastName.toLowerCase().includes(search.toLowerCase()) ||
      s.firstName.toLowerCase().includes(search.toLowerCase()) ||
      s.matricule.toLowerCase().includes(search.toLowerCase())
  );

  const gradedCount = Object.values(gradeInputs).filter(
    (inp) => inp.grade !== '' && !isNaN(parseFloat(inp.grade))
  ).length;

  const validGrades = Object.values(gradeInputs)
    .map((inp) => parseFloat(inp.grade))
    .filter((g) => !isNaN(g));

  const average =
    validGrades.length > 0
      ? (validGrades.reduce((acc, curr) => acc + curr, 0) / validGrades.length).toFixed(2)
      : '0.00';

  return (
    <div className="animate-fade-in" style={{ padding: '20px', maxWidth: '1050px', margin: '0 auto' }}>
      {/* HEADER */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Award style={{ color: '#10b981' }} size={28} />
            Saisie & Consultation des Notes
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px', margin: 0 }}>
            Session de saisie des épreuves — Uniquement les élèves inscrits.
          </p>
        </div>

        <button
          onClick={loadGradesData}
          disabled={loading}
          style={{
            padding: '8px 14px',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Actualiser</span>
        </button>
      </div>

      {errorMsg && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
          }}
        >
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* FILTRES EN CASCADE STICKY : EXAMEN (ÉVALUATION) -> CLASSE -> MATIÈRE */}
      <div
        className="glass-panel"
        style={{
          position: 'sticky',
          top: '10px',
          zIndex: 40,
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          padding: '18px',
          marginBottom: '20px',
          borderRadius: '18px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          alignItems: 'center',
          border: '1px solid var(--glass-border, rgba(255, 255, 255, 0.15))',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
        }}
      >
        {/* 1. EXAMEN / ÉVALUATION */}
        <div>
          <label style={{ fontSize: '12px', fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <Calendar size={14} /> 1. Examen (Évaluation)
          </label>
          <select
            value={selectedEval}
            onChange={(e) => setSelectedEval(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '10px',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-main)',
              fontSize: '14px',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {evaluations.length === 0 ? (
              <option value="" style={{ background: '#0f172a' }}>Aucun examen disponible</option>
            ) : (
              evaluations.map((ev) => (
                <option key={ev.id} value={ev.id} style={{ background: '#0f172a' }}>
                  {ev.name}
                </option>
              ))
            )}
          </select>
        </div>

        {/* 2. CLASSE (Seulement les classes concernées par cet examen) */}
        <div>
          <label style={{ fontSize: '12px', fontWeight: 800, color: '#6366f1', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <Users size={14} /> 2. Classe 
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '10px',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-main)',
              fontSize: '14px',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {classrooms.length === 0 ? (
              <option value="" style={{ background: '#0f172a' }}>Aucune classe associée à cet examen</option>
            ) : (
              classrooms.map((c) => (
                <option key={c.id} value={c.id} style={{ background: '#0f172a' }}>
                  {c.name}
                </option>
              ))
            )}
          </select>
        </div>

        {/* 3. MATIÈRE (Seulement les matières de la classe et concernées par l'examen) */}
        <div>
          <label style={{ fontSize: '12px', fontWeight: 800, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <BookOpen size={14} /> 3. Matière 
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '10px',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-main)',
              fontSize: '14px',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {subjects.length === 0 ? (
              <option value="" style={{ background: '#0f172a' }}>Aucune matière pour cette classe</option>
            ) : (
              subjects.map((s) => (
                <option key={s.id} value={s.id} style={{ background: '#0f172a' }}>
                  {s.name}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* KPI SUMMARY */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Élèves notés (Inscrits)</div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-main)' }}>
              {gradedCount} / {students.length}
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(99, 102, 241, 0.15)',
              color: '#6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Award size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Moyenne de classe</div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#6366f1' }}>{average} / 20</div>
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div
        className="glass-panel"
        style={{
          padding: '14px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div style={{ position: 'relative', flex: 1 }}>
          <Search
            size={18}
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou matricule..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 38px',
              borderRadius: '10px',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-main)',
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* REFORMULATED CLEAN TABLE/LIST FOR STUDENT GRADES */}
      <div style={{ marginBottom: '24px' }}>
        {loading ? (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
            <p style={{ margin: 0 }}>Chargement des élèves inscrits et des notes...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Users size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <p style={{ margin: 0, fontWeight: 600 }}>Aucun élève au statut "Inscrit" trouvé pour cette sélection.</p>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>Seuls les élèves ayant un statut d'inscription validé apparaissent ici.</p>
          </div>
        ) : (
          <div
            className="glass-panel"
            style={{
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid var(--glass-border, rgba(255, 255, 255, 0.12))',
              background: 'var(--bg-card, #1e293b)',
            }}
          >
            {/* EN-TÊTE DE LISTE */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(220px, 1.8fr) 140px 160px',
                alignItems: 'center',
                padding: '14px 20px',
                background: 'rgba(15, 23, 42, 0.8)',
                borderBottom: '1px solid var(--glass-border, rgba(255, 255, 255, 0.12))',
                fontSize: '12px',
                fontWeight: 800,
                color: 'var(--text-muted, #94a3b8)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              <div>Matricule & Nom de l'Élève</div>
              <div style={{ textAlign: 'center' }}>Note / 20</div>
              <div style={{ textAlign: 'right' }}>Appréciation</div>
            </div>

            {/* RANGÉES DES ÉLÈVES */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filteredStudents.map((student, idx) => {
                const inp = gradeInputs[student.id] || { grade: '', comment: '' };
                const numVal = inp.grade !== '' && !isNaN(parseFloat(inp.grade)) ? parseFloat(inp.grade) : null;
                const isPassing = numVal !== null && numVal >= 10;
                const isFailing = numVal !== null && numVal < 10;
                const appConfig = getAppreciation(numVal);

                return (
                  <div
                    key={student.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(220px, 1.8fr) 140px 160px',
                      alignItems: 'center',
                      padding: '12px 20px',
                      borderBottom: idx < filteredStudents.length - 1 ? '1px solid rgba(255, 255, 255, 0.06)' : 'none',
                      background: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)',
                      transition: 'background 0.2s ease',
                    }}
                  >
                    {/* COLONNE 1 : MATRICULE & NOM */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#10b981',
                          letterSpacing: '0.5px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {student.matricule}
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                        {student.lastName} {student.firstName}
                      </span>
                    </div>

                    {/* COLONNE 2 : NOTE / 20 */}
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.25"
                        value={inp.grade}
                        onChange={(e) => handleGradeInputChange(student.id, e.target.value)}
                        placeholder="-- / 20"
                        style={{
                          width: '95px',
                          padding: '8px 10px',
                          borderRadius: '10px',
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: isPassing
                            ? '1px solid rgba(16, 185, 129, 0.6)'
                            : isFailing
                            ? '1px solid rgba(239, 68, 68, 0.6)'
                            : '1px solid var(--glass-border, rgba(255, 255, 255, 0.12))',
                          color: isPassing ? '#10b981' : isFailing ? '#ef4444' : 'var(--text-main)',
                          fontWeight: 800,
                          fontSize: '15px',
                          textAlign: 'center',
                          outline: 'none',
                        }}
                      />
                    </div>

                    {/* COLONNE 3 : APPRÉCIATION */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '5px 12px',
                          borderRadius: '100px',
                          background: appConfig.bg,
                          color: appConfig.color,
                          fontSize: '12px',
                          fontWeight: 800,
                        }}
                      >
                        <Sparkles size={13} />
                        {appConfig.text}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* BOUTON D'ENREGISTREMENT À LA FIN DE LA LISTE */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '16px',
          marginTop: '16px',
          padding: '16px',
          borderRadius: '16px',
          background: 'rgba(15, 23, 42, 0.4)',
          border: '1px solid var(--glass-border)',
        }}
      >
        {savedSuccess && (
          <span style={{ color: '#10b981', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle size={18} /> Notes enregistrées avec succès !
          </span>
        )}

        <button
          onClick={handleSaveAllGrades}
          disabled={saving || students.length === 0}
          style={{
            padding: '14px 28px',
            background: savedSuccess
              ? 'linear-gradient(135deg, #10b981, #059669)'
              : 'linear-gradient(135deg, #10b981, #0d9488)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 800,
            fontSize: '15px',
            cursor: saving || students.length === 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)',
            transition: 'all 0.3s ease',
            opacity: saving || students.length === 0 ? 0.7 : 1,
          }}
        >
          {saving ? (
            <RefreshCw size={20} className="animate-spin" />
          ) : savedSuccess ? (
            <Check size={20} />
          ) : (
            <Save size={20} />
          )}
          <span>{saving ? 'Enregistrement...' : savedSuccess ? 'Notes Enregistrées !' : 'Enregistrer les notes'}</span>
        </button>
      </div>
    </div>
  );
};

export default GradesManager;
