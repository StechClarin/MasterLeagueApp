import{Pc as r,Qc as l,Rc as i,_ as a,da as s}from"./chunk-RB3L2S6D.js";var d=i`
    query GetAllStudents($search: String, $classroomId: ID, $academicYearId: ID, $status: String, $page: Int, $pageSize: Int) {
  students(
    search: $search
    classroomId: $classroomId
    academicYearId: $academicYearId
    status: $status
    page: $page
    pageSize: $pageSize
  ) {
    items {
      id
      firstName
      lastName
      matricule
      photo
      dateOfBirth
      placeOfBirth
      gender
      address
      health {
        id
        bloodGroup
        medicalConditions
        allergies
        emergencyContactName
        emergencyContactPhone
      }
      enrollments {
        id
        status
        isRepeater
        classroom {
          id
          name
          level {
            id
            name
          }
        }
        academicYear {
          id
          name
        }
      }
      guardians {
        id
        firstName
        lastName
        phoneNumber
        profession
        user {
          firstName
          lastName
          email
        }
      }
    }
  }
}
    `,o=class e extends l{document=d;constructor(t){super(t)}static \u0275fac=function(n){return new(n||e)(s(r))};static \u0275prov=a({token:e,factory:e.\u0275fac,providedIn:"root"})},c=i`
    query GetStudent($id: ID!) {
  student(id: $id) {
    id
    matricule
    firstName
    lastName
    gender
    photo
    dateOfBirth
    placeOfBirth
    address
    health {
      id
      bloodGroup
      allergies
      medicalConditions
      emergencyContactName
      emergencyContactPhone
    }
    enrollments {
      id
      status
      classroom {
        id
        name
        level {
          id
          name
        }
      }
      academicYear {
        id
        name
      }
    }
    guardians {
      id
      phoneNumber
      profession
      user {
        firstName
        lastName
        email
      }
    }
    siblings {
      id
      matricule
      firstName
      lastName
      gender
      photo
      dateOfBirth
    }
  }
}
    `,p=class e extends l{document=c;constructor(t){super(t)}static \u0275fac=function(n){return new(n||e)(s(r))};static \u0275prov=a({token:e,factory:e.\u0275fac,providedIn:"root"})},y=i`
    query GetAllEnrollments($search: String, $classroomId: ID, $academicYearId: ID, $page: Int, $pageSize: Int) {
  enrollments(
    search: $search
    classroomId: $classroomId
    academicYearId: $academicYearId
    page: $page
    pageSize: $pageSize
  ) {
    items {
      id
      status
      enrollmentDate
      isRepeater
      student {
        id
        firstName
        lastName
        matricule
        photo
      }
      classroom {
        id
        name
        level {
          id
          name
        }
      }
      academicYear {
        id
        name
      }
    }
    totalCount
    numPages
  }
}
    `,u=class e extends l{document=y;constructor(t){super(t)}static \u0275fac=function(n){return new(n||e)(s(r))};static \u0275prov=a({token:e,factory:e.\u0275fac,providedIn:"root"})};export{d as a,o as b,y as c,u as d};
