import{Pc as l,Qc as r,Rc as t,_ as i,da as s}from"./chunk-RB3L2S6D.js";var g=t`
    fragment EvaluationTypeFields on EvaluationTypeType {
  id
  name
  code
  weight
  description
  isActive
}
    `,v=t`
    fragment EvaluationPlanningFields on EvaluationPlanningType {
  id
  date
  startTime
  durationMinutes
  levels {
    id
    name
  }
  classrooms {
    id
    name
    level {
      id
    }
  }
}
    `,T=t`
    fragment EvaluationSubjectFields on EvaluationSubjectType {
  id
  maxScore
  coefficient
  levelCoefficients {
    levelId
    coefficient
  }
  subjectFile
  subject {
    id
    name
  }
  levels {
    id
    name
  }
  plannings {
    ...EvaluationPlanningFields
  }
}
    ${v}`,m=t`
    fragment EvaluationSessionFields on EvaluationSessionType {
  id
  title
  status
  scope
  evaluationType {
    id
    name
    code
    weight
  }
  academicPeriod {
    id
    name
  }
  subjects {
    ...EvaluationSubjectFields
  }
}
    ${T}`,_=t`
    fragment EvaluationSupervisionFields on EvaluationSupervisionType {
  id
  date
  classroom {
    id
    name
  }
  supervisors {
    id
    user {
      firstName
      lastName
    }
  }
}
    `,S=t`
    fragment GradeFields on GradeType {
  id
  value
  comment
  isAbsent
  student {
    id
    matricule
    firstName
    lastName
  }
  evaluationSubject {
    id
    subject {
      name
    }
    session {
      evaluationType {
        code
        weight
      }
    }
  }
}
    `,I=t`
    query GetAllEvaluationTypes($search: String, $page: Int, $pageSize: Int) {
  evaluationTypes(search: $search, page: $page, pageSize: $pageSize) {
    items {
      ...EvaluationTypeFields
    }
    totalCount
    numPages
    currentPage
  }
}
    ${g}`,o=class e extends r{document=I;constructor(n){super(n)}static \u0275fac=function(a){return new(a||e)(s(l))};static \u0275prov=i({token:e,factory:e.\u0275fac,providedIn:"root"})},b=t`
    query GetAllEvaluationSessions($search: String, $classroomId: Int, $levelId: Int, $periodId: Int, $subjectId: Int, $evaluationTypeId: Int, $page: Int, $pageSize: Int) {
  evaluationSessions(
    search: $search
    classroomId: $classroomId
    levelId: $levelId
    periodId: $periodId
    subjectId: $subjectId
    evaluationTypeId: $evaluationTypeId
    page: $page
    pageSize: $pageSize
  ) {
    items {
      ...EvaluationSessionFields
      supervisions {
        ...EvaluationSupervisionFields
      }
    }
    totalCount
    numPages
    currentPage
  }
}
    ${m}
${_}`,u=class e extends r{document=b;constructor(n){super(n)}static \u0275fac=function(a){return new(a||e)(s(l))};static \u0275prov=i({token:e,factory:e.\u0275fac,providedIn:"root"})},E=t`
    query GetAllGrades($evaluationSubjectId: Int, $evaluationSessionId: Int, $studentId: Int, $academicPeriodId: Int, $classroomId: Int, $page: Int, $pageSize: Int) {
  grades(
    evaluationSubjectId: $evaluationSubjectId
    evaluationSessionId: $evaluationSessionId
    studentId: $studentId
    academicPeriodId: $academicPeriodId
    classroomId: $classroomId
    page: $page
    pageSize: $pageSize
  ) {
    items {
      ...GradeFields
    }
    totalCount
    numPages
    currentPage
  }
}
    ${S}`,p=class e extends r{document=E;constructor(n){super(n)}static \u0275fac=function(a){return new(a||e)(s(l))};static \u0275prov=i({token:e,factory:e.\u0275fac,providedIn:"root"})},A=t`
    query GetEvaluationSession($id: ID!) {
  evaluationSession(id: $id) {
    ...EvaluationSessionFields
  }
}
    ${m}`,y=class e extends r{document=A;constructor(n){super(n)}static \u0275fac=function(a){return new(a||e)(s(l))};static \u0275prov=i({token:e,factory:e.\u0275fac,providedIn:"root"})},f=t`
    query GetAllEvaluationPlannings($classeId: ID, $minDate: Date, $maxDate: Date, $page: Int, $pageSize: Int) {
  evaluationPlannings(
    classeId: $classeId
    minDate: $minDate
    maxDate: $maxDate
    page: $page
    pageSize: $pageSize
  ) {
    items {
      id
      date
      startTime
      durationMinutes
      evaluationSubject {
        id
        subject {
          id
          name
        }
      }
      classrooms {
        id
        name
      }
    }
    totalCount
    numPages
  }
}
    `,c=class e extends r{document=f;constructor(n){super(n)}static \u0275fac=function(a){return new(a||e)(s(l))};static \u0275prov=i({token:e,factory:e.\u0275fac,providedIn:"root"})};export{o as a,u as b,p as c,y as d,c as e};
