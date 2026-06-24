import { GradeFieldsFragment, EvaluationSubjectFieldsFragment } from '../graphql/evaluations.generated';

export interface StudentGradeRow {
  studentId: string;
  matricule: string;
  firstName: string;
  lastName: string;
  classroomId: string;
  levelId: string;
  grades: any[];
  average: number;
  appreciation: string;
}

export type ClassStats = {
  min: number;
  max: number;
  avg: number;
};

export interface BulletinData {
  student: {
    lastName: string;
    firstName: string;
    matricule: string;
    classRank: number | null;
    totalClassStudents: number;
    cycleRank: number | null;
    totalCycleStudents: number;
    estRank: number | null;
    totalEstStudents: number;
    average: number;
    appreciation: string;
  };
  period: {
    name: string;
    academicYear: string;
    date: string;
  };
  establishment: {
    name: string;
    slogan: string;
    phone: string;
    email: string;
    website: string;
    address: string;
    logoBase64: string | null;
  };
  classroomName: string;
  classStats: ClassStats;
  hasCredits: boolean;
  ueGroups: any[];
  totalPeriodPoints: number;
  totalPeriodCoeff: number;
}
