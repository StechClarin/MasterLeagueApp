import{Pc as l,Qc as i,Rc as a,_ as r,da as s}from"./chunk-RB3L2S6D.js";var v=a`
    fragment EstablishmentFields on EstablishmentType {
  id
  name
  phone
  email
  address
  logo
  isActive
  slogan
  website
  taxId
  city
  country
  printHeader
  printFooter
}
    `,S=a`
    fragment AcademicYearFields on AcademicYearType {
  id
  name
  start_date
  end_date
  isActive
  isArchived
  cycleConfigs {
    id
    cycle {
      id
    }
    startDate
  }
}
    `,c=a`
    fragment LevelFields on LevelType {
  id
  name
  shortName
  order
  isActive
  cycle {
    id
    name
    establishment {
      id
      name
    }
  }
}
    `,h=a`
    fragment ClassRoomFields on ClassRoomType {
  id
  name
  capacity
  isActive
  level {
    ...LevelFields
  }
  academicYear {
    id
    name
  }
}
    ${c}`,f=a`
    fragment LevelSubjectFields on LevelSubjectType {
  id
  coefficient
  hourlyQuota
  level {
    id
    name
  }
}
    `,F=a`
    fragment SubjectFields on SubjectType {
  id
  name
  code
  isOptional
  isActive
  levelSubjects {
    ...LevelSubjectFields
  }
}
    ${f}`,Q=a`
    fragment AcademicPeriodFields on AcademicPeriodType {
  id
  name
  startDate
  endDate
  isActive
  academicYear {
    id
    name
  }
}
    `,C=a`
    fragment RoomFields on RoomType {
  id
  name
  capacity
}
    `,x=a`
    fragment CycleFields on CycleType {
  id
  name
  order
  isActive
  establishment {
    id
    name
  }
}
    `,G=a`
    fragment StructureResponse on StructureResponseType {
  activeAcademicYear {
    id
    name
    start_date
    end_date
    isActive
    isArchived
  }
  cycles {
    ...CycleFields
    levels {
      ...LevelFields
    }
  }
}
    ${x}
${c}`,P=a`
    query GetAllEstablishments($search: String, $city: String, $phone: String, $isActive: Boolean, $page: Int, $pageSize: Int) {
  establishments(
    search: $search
    city: $city
    phone: $phone
    isActive: $isActive
    page: $page
    pageSize: $pageSize
  ) {
    items {
      ...EstablishmentFields
    }
    totalCount
    numPages
    currentPage
  }
}
    ${v}`,o=class e extends i{document=P;constructor(t){super(t)}static \u0275fac=function(n){return new(n||e)(s(l))};static \u0275prov=r({token:e,factory:e.\u0275fac,providedIn:"root"})},j=a`
    query GetEstablishmentById($id: ID!) {
  establishment(id: $id) {
    ...EstablishmentFields
  }
}
    ${v}`,p=class e extends i{document=j;constructor(t){super(t)}static \u0275fac=function(n){return new(n||e)(s(l))};static \u0275prov=r({token:e,factory:e.\u0275fac,providedIn:"root"})},D=a`
    query GetAllAcademicYears($search: String, $isActive: Boolean, $isArchived: Boolean, $page: Int, $pageSize: Int) {
  academicyears(
    search: $search
    isActive: $isActive
    isArchived: $isArchived
    page: $page
    pageSize: $pageSize
  ) {
    items {
      ...AcademicYearFields
    }
    totalCount
    numPages
    currentPage
  }
}
    ${S}`,y=class e extends i{document=D;constructor(t){super(t)}static \u0275fac=function(n){return new(n||e)(s(l))};static \u0275prov=r({token:e,factory:e.\u0275fac,providedIn:"root"})},Y=a`
    query GetAcademicYearById($id: ID!) {
  academicyear(id: $id) {
    ...AcademicYearFields
  }
}
    ${S}`,u=class e extends i{document=Y;constructor(t){super(t)}static \u0275fac=function(n){return new(n||e)(s(l))};static \u0275prov=r({token:e,factory:e.\u0275fac,providedIn:"root"})},E=a`
    query GetAllCycles($search: String, $establishmentId: ID, $page: Int, $pageSize: Int) {
  cycles(
    search: $search
    establishmentId: $establishmentId
    page: $page
    pageSize: $pageSize
  ) {
    items {
      ...CycleFields
    }
    totalCount
    numPages
    currentPage
  }
}
    ${x}`,m=class e extends i{document=E;constructor(t){super(t)}static \u0275fac=function(n){return new(n||e)(s(l))};static \u0275prov=r({token:e,factory:e.\u0275fac,providedIn:"root"})},R=a`
    query GetAllLevels($search: String, $cycleId: ID, $establishmentId: ID, $page: Int, $pageSize: Int) {
  levels(
    search: $search
    cycleId: $cycleId
    establishmentId: $establishmentId
    page: $page
    pageSize: $pageSize
  ) {
    items {
      ...LevelFields
    }
    totalCount
    numPages
    currentPage
  }
}
    ${c}`,d=class e extends i{document=R;constructor(t){super(t)}static \u0275fac=function(n){return new(n||e)(s(l))};static \u0275prov=r({token:e,factory:e.\u0275fac,providedIn:"root"})},M=a`
    query GetAllClassRooms($search: String, $levelId: ID, $academicYearId: ID, $page: Int, $pageSize: Int) {
  classrooms(
    search: $search
    levelId: $levelId
    academicYearId: $academicYearId
    page: $page
    pageSize: $pageSize
  ) {
    items {
      ...ClassRoomFields
    }
    totalCount
    numPages
    currentPage
  }
}
    ${h}`,g=class e extends i{document=M;constructor(t){super(t)}static \u0275fac=function(n){return new(n||e)(s(l))};static \u0275prov=r({token:e,factory:e.\u0275fac,providedIn:"root"})},z=a`
    query GetClassRoomById($id: ID!) {
  classroom(id: $id) {
    ...ClassRoomFields
  }
}
    ${h}`,b=class e extends i{document=z;constructor(t){super(t)}static \u0275fac=function(n){return new(n||e)(s(l))};static \u0275prov=r({token:e,factory:e.\u0275fac,providedIn:"root"})},L=a`
    query GetAllSubjects($search: String, $levelId: ID, $page: Int, $pageSize: Int) {
  subjects(search: $search, levelId: $levelId, page: $page, pageSize: $pageSize) {
    items {
      ...SubjectFields
    }
    totalCount
    numPages
    currentPage
  }
}
    ${F}`,A=class e extends i{document=L;constructor(t){super(t)}static \u0275fac=function(n){return new(n||e)(s(l))};static \u0275prov=r({token:e,factory:e.\u0275fac,providedIn:"root"})},B=a`
    query GetAllAcademicPeriods($search: String, $academicYearId: Int, $page: Int, $pageSize: Int) {
  academicPeriods(
    search: $search
    academicYearId: $academicYearId
    page: $page
    pageSize: $pageSize
  ) {
    items {
      ...AcademicPeriodFields
    }
    totalCount
    numPages
    currentPage
  }
}
    ${Q}`,T=class e extends i{document=B;constructor(t){super(t)}static \u0275fac=function(n){return new(n||e)(s(l))};static \u0275prov=r({token:e,factory:e.\u0275fac,providedIn:"root"})},V=a`
    query GetAllRooms($search: String, $page: Int, $pageSize: Int) {
  rooms(search: $search, page: $page, pageSize: $pageSize) {
    items {
      ...RoomFields
    }
    totalCount
    numPages
    currentPage
  }
}
    ${C}`,I=class e extends i{document=V;constructor(t){super(t)}static \u0275fac=function(n){return new(n||e)(s(l))};static \u0275prov=r({token:e,factory:e.\u0275fac,providedIn:"root"})},w=a`
    query GetActiveStructure {
  activeStructure {
    ...StructureResponse
  }
}
    ${G}`,_=class e extends i{document=w;constructor(t){super(t)}static \u0275fac=function(n){return new(n||e)(s(l))};static \u0275prov=r({token:e,factory:e.\u0275fac,providedIn:"root"})};export{o as a,y as b,m as c,d,g as e,A as f,T as g,I as h};
