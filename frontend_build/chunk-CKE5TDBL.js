import{a as d}from"./chunk-ED5XNJ7R.js";import{Pc as l,Qc as a,Rc as s,_ as i,da as o,ea as p,u as c,va as g}from"./chunk-RB3L2S6D.js";var I=s`
    fragment UserFields on UserType {
  id
  username
  email
  firstName
  lastName
  isActive
  dateJoined
  photo
  phone
  roles {
    id
    name
  }
}
    `,b=s`
    fragment RoleFields on RoleType {
  id
  name
  permissions {
    id
    name
    codename
  }
}
    `,R=s`
    fragment PermissionFields on PermissionType {
  id
  name
  codename
  tag
}
    `,S=s`
    query GetAllUsers($username: String, $email: String, $role: String, $page: Int, $pageSize: Int) {
  users(
    username: $username
    email: $email
    role: $role
    page: $page
    pageSize: $pageSize
  ) {
    items {
      ...UserFields
    }
    totalCount
    numPages
    currentPage
  }
}
    ${I}`,A=class e extends a{document=S;constructor(t){super(t)}static \u0275fac=function(r){return new(r||e)(o(l))};static \u0275prov=i({token:e,factory:e.\u0275fac,providedIn:"root"})},_=s`
    query GetUserById($id: Int!) {
  user(id: $id) {
    ...UserFields
  }
}
    ${I}`,f=class e extends a{document=_;constructor(t){super(t)}static \u0275fac=function(r){return new(r||e)(o(l))};static \u0275prov=i({token:e,factory:e.\u0275fac,providedIn:"root"})},P=s`
    query GetAllRoles($name: String, $page: Int, $pageSize: Int) {
  roles(name: $name, page: $page, pageSize: $pageSize) {
    items {
      ...RoleFields
    }
    totalCount
    numPages
    currentPage
  }
}
    ${b}`,y=class e extends a{document=P;constructor(t){super(t)}static \u0275fac=function(r){return new(r||e)(o(l))};static \u0275prov=i({token:e,factory:e.\u0275fac,providedIn:"root"})},v=s`
    query GetRoleById($id: ID!) {
  role(id: $id) {
    ...RoleFields
  }
}
    ${b}`,m=class e extends a{document=v;constructor(t){super(t)}static \u0275fac=function(r){return new(r||e)(o(l))};static \u0275prov=i({token:e,factory:e.\u0275fac,providedIn:"root"})},F=s`
    query GetAllPermissions {
  permissions {
    ...PermissionFields
  }
}
    ${R}`,u=class e extends a{document=F;constructor(t){super(t)}static \u0275fac=function(r){return new(r||e)(o(l))};static \u0275prov=i({token:e,factory:e.\u0275fac,providedIn:"root"})};var G=class e extends d{endpoint="role";getAllRolesGQL=p(y);getRoleByIdGQL=p(m);getAllPermissionsGQL=p(u);getAll(t="",r=1,n=100){return this.getAllRolesGQL.watch({name:t,page:r,pageSize:n}).valueChanges}getPermissions(){return console.log("[RoleService] Fetching permissions..."),this.getAllPermissionsGQL.fetch().pipe(c(t=>(console.log("[RoleService] Permissions fetched:",t.data.permissions),t.data.permissions||[])))}get_by_id(t){return this.getRoleByIdGQL.fetch({id:String(t)}).pipe(c(r=>{let n=JSON.parse(JSON.stringify(r.data.role));return n&&n.permissions&&(n.permissions=n.permissions.map(T=>T.id)),n}))}getQuery(){return this.getAllRolesGQL.document}static \u0275fac=(()=>{let t;return function(n){return(t||(t=g(e)))(n||e)}})();static \u0275prov=i({token:e,factory:e.\u0275fac,providedIn:"root"})};export{A as a,G as b};
