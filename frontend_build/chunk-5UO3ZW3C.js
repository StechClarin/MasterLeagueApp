import{Pc as o,Qc as a,Rc as i,_ as r,da as s}from"./chunk-RB3L2S6D.js";var m=i`
    query GetAllPersonnels($search: String, $establishment: ID, $contractType: ID, $role: ID, $roleName: String, $jobTitle: String, $page: Int, $pageSize: Int) {
  personnels(
    search: $search
    establishment: $establishment
    contractType: $contractType
    role: $role
    roleName: $roleName
    jobTitle: $jobTitle
    page: $page
    pageSize: $pageSize
  ) {
    items {
      id
      user {
        id
        username
        firstName
        lastName
        email
        photo
      }
      roles {
        id
        name
      }
      matricule
      jobTitle
      contractType {
        id
        designation
        code
      }
      emailPro
      phoneNumber
      address
      dateHired
      isActive
      establishment {
        id
        name
      }
    }
    totalCount
    numPages
    currentPage
  }
}
    `,l=class e extends a{document=m;constructor(t){super(t)}static \u0275fac=function(n){return new(n||e)(s(o))};static \u0275prov=r({token:e,factory:e.\u0275fac,providedIn:"root"})},d=i`
    query GetPersonnel($id: ID!) {
  personnel(id: $id) {
    id
    user {
      id
      firstName
      lastName
      email
      photo
    }
    roles {
      id
      name
    }
    establishment {
      id
      name
    }
    matricule
    jobTitle
    contractType {
      id
      designation
      code
    }
    emailPro
    phoneNumber
    address
    dateHired
    isActive
  }
}
    `,p=class e extends a{document=d;constructor(t){super(t)}static \u0275fac=function(n){return new(n||e)(s(o))};static \u0275prov=r({token:e,factory:e.\u0275fac,providedIn:"root"})},g=i`
    query GetAllContractTypes {
  contractTypes {
    items {
      id
      designation
      code
      description
    }
  }
}
    `,y=class e extends a{document=g;constructor(t){super(t)}static \u0275fac=function(n){return new(n||e)(s(o))};static \u0275prov=r({token:e,factory:e.\u0275fac,providedIn:"root"})},T=i`
    query GetContractType($id: ID!) {
  contractType(id: $id) {
    id
    designation
    code
    description
  }
}
    `,c=class e extends a{document=T;constructor(t){super(t)}static \u0275fac=function(n){return new(n||e)(s(o))};static \u0275prov=r({token:e,factory:e.\u0275fac,providedIn:"root"})};export{l as a,y as b,c};
