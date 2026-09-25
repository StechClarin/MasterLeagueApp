import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PortalAuthProvider } from './context/PortalAuthContext';
import RequireAuth from './components/RequireAuth';

import Layout from './components/Layout';
import Dashboard from './pages/students/Dashboard';
import Timetable from './pages/students/Timetable';
import ReportCards from './pages/students/ReportCards';
import Payments from './pages/students/Payments';
import Messages from './pages/students/Messages';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';

import LayoutProf from './components/LayoutProf';
import DashboardProf from './pages/prof/Dashboard';
import TimetableProf from './pages/prof/Timetable';
import EvaluationsProf from './pages/prof/Evaluations';
import MessagesProf from './pages/prof/Messages';
import GradeEntryProf from './pages/prof/GradeEntry';

import LayoutManager from './components/LayoutManager';
import DashboardManager from './pages/manager/Dashboard';
import StudentsManager from './pages/manager/Students';
import FinanceManager from './pages/manager/Finance';
import StaffManager from './pages/manager/Staff';
import MessagesManager from './pages/manager/Messages';
import GradesManager from './pages/manager/Grades';

function App() {
  return (
    <PortalAuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Login />} />

          {/* Espace étudiant / parent — protégé par magic link */}
          <Route
            path="/student"
            element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="timetable" element={<Timetable />} />
            <Route path="grades" element={<ReportCards />} />
            <Route path="payments" element={<Payments />} />
            <Route path="messages" element={<Messages />} />
          </Route>

          {/* Espace enseignant — protégé par magic link */}
          <Route
            path="/prof"
            element={
              <RequireAuth>
                <LayoutProf />
              </RequireAuth>
            }
          >
            <Route index element={<DashboardProf />} />
            <Route path="timetable" element={<TimetableProf />} />
            <Route path="evaluations" element={<EvaluationsProf />} />
            <Route path="evaluations/:id/grades" element={<GradeEntryProf />} />
            <Route path="messages" element={<MessagesProf />} />
          </Route>

          {/* Espace directeur / gestionnaire (Mobile First) — protégé par magic link */}
          <Route
            path="/manager"
            element={
              <RequireAuth>
                <LayoutManager />
              </RequireAuth>
            }
          >
            <Route index element={<DashboardManager />} />
            <Route path="students" element={<StudentsManager />} />
            <Route path="finance" element={<FinanceManager />} />
            <Route path="grades" element={<GradesManager />} />
            <Route path="staff" element={<StaffManager />} />
            <Route path="messages" element={<MessagesManager />} />
          </Route>

          <Route path="*" element={<Landing />} />
        </Routes>
      </BrowserRouter>
    </PortalAuthProvider>
  );
}

export default App;

