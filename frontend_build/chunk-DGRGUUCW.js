import{Pc as r,Qc as o,Rc as n,_ as i,da as s}from"./chunk-RB3L2S6D.js";var c=n`
    fragment FeeDefinitionFields on FeeDefinitionType {
  id
  name
  category
  amount
  isActive
  level {
    id
    name
  }
  academicYear {
    id
    name
  }
  paymentModality
  installmentCount
  installmentPeriod
  students {
    id
    firstName
    lastName
    matricule
  }
  classroom {
    id
    name
  }
}
    `,g=n`
    fragment InvoiceFields on InvoiceType {
  id
  title
  totalAmount
  paidAmount
  remainingAmount
  dueDate
  status
  category
  student {
    id
    firstName
    lastName
    matricule
  }
  reference
  enrollment {
    classroom {
      name
    }
  }
}
    `,d=n`
    fragment PaymentFields on PaymentType {
  id
  amount
  paymentDate
  paymentMethod
  reference
  note
  invoice {
    id
    title
    reference
    enrollment {
      classroom {
        name
      }
    }
    student {
      firstName
      lastName
      matricule
    }
  }
}
    `,I=n`
    query GetFeeDefinitions($search: String, $levelId: Int, $page: Int, $pageSize: Int) {
  feeDefinitions(
    search: $search
    levelId: $levelId
    page: $page
    pageSize: $pageSize
  ) {
    totalCount
    numPages
    currentPage
    pageSize
    items {
      ...FeeDefinitionFields
    }
  }
}
    ${c}`,l=class e extends o{document=I;constructor(t){super(t)}static \u0275fac=function(a){return new(a||e)(s(r))};static \u0275prov=i({token:e,factory:e.\u0275fac,providedIn:"root"})},T=n`
    query GetInvoices($search: String, $studentId: Int, $status: String, $category: String, $classroomId: Int, $page: Int, $pageSize: Int) {
  invoices(
    search: $search
    studentId: $studentId
    status: $status
    category: $category
    classroomId: $classroomId
    page: $page
    pageSize: $pageSize
  ) {
    totalCount
    numPages
    currentPage
    pageSize
    items {
      ...InvoiceFields
    }
  }
}
    ${g}`,p=class e extends o{document=T;constructor(t){super(t)}static \u0275fac=function(a){return new(a||e)(s(r))};static \u0275prov=i({token:e,factory:e.\u0275fac,providedIn:"root"})},f=n`
    query GetPayments($invoiceId: Int, $page: Int, $pageSize: Int) {
  payments(invoiceId: $invoiceId, page: $page, pageSize: $pageSize) {
    totalCount
    numPages
    currentPage
    pageSize
    items {
      ...PaymentFields
    }
  }
}
    ${d}`,y=class e extends o{document=f;constructor(t){super(t)}static \u0275fac=function(a){return new(a||e)(s(r))};static \u0275prov=i({token:e,factory:e.\u0275fac,providedIn:"root"})},F=n`
    query GetUsedFeeCategories {
  usedFeeCategories
}
    `,m=class e extends o{document=F;constructor(t){super(t)}static \u0275fac=function(a){return new(a||e)(s(r))};static \u0275prov=i({token:e,factory:e.\u0275fac,providedIn:"root"})};export{I as a,l as b,T as c,p as d,f as e,y as f,F as g};
