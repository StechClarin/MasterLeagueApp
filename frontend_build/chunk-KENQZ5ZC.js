import{Pc as i,Qc as r,Rc as l,_ as a,da as s}from"./chunk-RB3L2S6D.js";var d=l`
    query GetAllPlannings($search: String, $minDate: Date, $maxDate: Date, $page: Int, $pageSize: Int) {
  plannings(
    search: $search
    minDate: $minDate
    maxDate: $maxDate
    page: $page
    pageSize: $pageSize
  ) {
    items {
      id
      nom
      dateStart
      dateEnd
      isTemplate
      establishment {
        id
        name
      }
      details {
        id
        date
        heureDebut
        heureFin
        enseignant {
          id
          matricule
          user {
            firstName
            lastName
          }
        }
        classe {
          id
          name
        }
        matiere {
          id
          name
        }
        salle {
          id
          name
        }
      }
    }
    totalCount
    numPages
  }
}
    `,p=class e extends r{document=d;constructor(n){super(n)}static \u0275fac=function(t){return new(t||e)(s(i))};static \u0275prov=a({token:e,factory:e.\u0275fac,providedIn:"root"})},T=l`
    query GetPlanningDetails($search: String, $classeId: ID, $minDate: Date, $maxDate: Date, $page: Int, $pageSize: Int) {
  planningDetails(
    search: $search
    classeId: $classeId
    minDate: $minDate
    maxDate: $maxDate
    page: $page
    pageSize: $pageSize
  ) {
    items {
      id
      date
      heureDebut
      heureFin
      enseignant {
        id
        matricule
        user {
          firstName
          lastName
        }
      }
      classe {
        id
        name
      }
      matiere {
        id
        name
      }
      salle {
        id
        name
      }
    }
    totalCount
    numPages
  }
}
    `,y=class e extends r{document=T;constructor(n){super(n)}static \u0275fac=function(t){return new(t||e)(s(i))};static \u0275prov=a({token:e,factory:e.\u0275fac,providedIn:"root"})},_=l`
    query GetPlanningById($id: ID!) {
  planning(id: $id) {
    id
    nom
    dateStart
    dateEnd
    isTemplate
    details {
      id
      date
      heureDebut
      heureFin
      enseignant {
        id
        matricule
        user {
          firstName
          lastName
        }
      }
      classe {
        id
        name
      }
      matiere {
        id
        name
      }
      salle {
        id
        name
      }
    }
  }
}
    `,m=class e extends r{document=_;constructor(n){super(n)}static \u0275fac=function(t){return new(t||e)(s(i))};static \u0275prov=a({token:e,factory:e.\u0275fac,providedIn:"root"})},A=l`
    query GetPlanningDependencies {
  personnels(search: "", page: 1, pageSize: 100) {
    items {
      id
      matricule
      roles {
        name
      }
      user {
        firstName
        lastName
      }
    }
  }
  subjects(search: "", page: 1, pageSize: 100) {
    items {
      id
      name
    }
  }
  classrooms(search: "", page: 1, pageSize: 100) {
    items {
      id
      name
    }
  }
  rooms(search: "", page: 1, pageSize: 100) {
    items {
      id
      name
    }
  }
  academicyears(search: "", page: 1, pageSize: 100) {
    items {
      id
      name
      isActive
      startDate: start_date
      cycleConfigs {
        id
        cycle {
          id
        }
        startDate
      }
    }
  }
}
    `,o=class e extends r{document=A;constructor(n){super(n)}static \u0275fac=function(t){return new(t||e)(s(i))};static \u0275prov=a({token:e,factory:e.\u0275fac,providedIn:"root"})},D=l`
    query GetAllTeachingAssignments($search: String, $page: Int, $pageSize: Int) {
  teachingAssignments(search: $search, page: $page, pageSize: $pageSize) {
    items {
      id
      startDate
      endDate
      hoursScheduled
      personnel {
        id
        user {
          firstName
          lastName
        }
      }
      classroom {
        id
        name
      }
      subject {
        id
        name
      }
      academicYear {
        id
        name
      }
    }
    totalCount
    numPages
    currentPage
  }
}
    `,u=class e extends r{document=D;constructor(n){super(n)}static \u0275fac=function(t){return new(t||e)(s(i))};static \u0275prov=a({token:e,factory:e.\u0275fac,providedIn:"root"})},b=l`
    query GetTeachingAssignment($id: ID!) {
  teachingAssignment(id: $id) {
    id
    startDate
    endDate
    hoursScheduled
    personnel {
      id
      user {
        firstName
        lastName
      }
    }
    classroom {
      id
      name
    }
    subject {
      id
      name
    }
    academicYear {
      id
      name
    }
  }
}
    `,c=class e extends r{document=b;constructor(n){super(n)}static \u0275fac=function(t){return new(t||e)(s(i))};static \u0275prov=a({token:e,factory:e.\u0275fac,providedIn:"root"})};export{p as a,y as b,m as c,o as d,u as e};
