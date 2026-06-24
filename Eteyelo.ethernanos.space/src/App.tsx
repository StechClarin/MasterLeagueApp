
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/students/Dashboard';
import Timetable from './pages/students/Timetable';
import ReportCards from './pages/students/ReportCards';
import Payments from './pages/students/Payments';
import Messages from './pages/students/Messages';
import Landing from './pages/Landing';

import LayoutProf from './components/LayoutProf';
import DashboardProf from './pages/prof/Dashboard';
import TimetableProf from './pages/prof/Timetable';
import EvaluationsProf from './pages/prof/Evaluations';
import MessagesProf from './pages/prof/Messages';
import GradeEntryProf from './pages/prof/GradeEntry';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route path="/student" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="timetable" element={<Timetable />} />
          <Route path="grades" element={<ReportCards />} />
          <Route path="payments" element={<Payments />} />
          <Route path="messages" element={<Messages />} />
        </Route>
        
        <Route path="/prof" element={<LayoutProf />}>
          <Route index element={<DashboardProf />} />
          <Route path="timetable" element={<TimetableProf />} />
          <Route path="evaluations" element={<EvaluationsProf />} />
          <Route path="evaluations/:id/grades" element={<GradeEntryProf />} />
          <Route path="messages" element={<MessagesProf />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
