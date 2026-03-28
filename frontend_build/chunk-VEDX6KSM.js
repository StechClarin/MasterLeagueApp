import{b as G,e as S}from"./chunk-G7TQ2UKJ.js";import{a as l}from"./chunk-ED5XNJ7R.js";import{B as c}from"./chunk-AZKF7LEX.js";import{A as g,Pc as D,Qc as h,Rc as j,_ as i,da as v,ea as a,o as f,u as s,va as u}from"./chunk-RB3L2S6D.js";var B=j`
    query GetDocumentsByEntity($appLabel: String!, $modelName: String!, $objectId: ID!) {
  documentsByEntity(
    appLabel: $appLabel
    modelName: $modelName
    objectId: $objectId
  ) {
    id
    title
    fileUrl
    documentType
    uploadedAt
  }
}
    `,y=class e extends h{document=B;constructor(t){super(t)}static \u0275fac=function(n){return new(n||e)(v(D))};static \u0275prov=i({token:e,factory:e.\u0275fac,providedIn:"root"})};var d=class e extends l{endpoint="document";getDocumentsGQL=a(y);getQuery(){return this.getDocumentsGQL.document}uploadDocument(t,n,o,p,m="AUTRE"){let r=new FormData;return r.append("file",t),r.append("title",t.name),r.append("document_type",m),r.append("content_type_app",n),r.append("content_type_model",o),r.append("object_id",p.toString()),this.http.post(`${c.apiUrl}/${this.endpoint}/save/`,r)}getByEntity(t,n,o){return this.getDocumentsGQL.fetch({appLabel:t,modelName:n,objectId:o}).pipe(s(p=>p.data.documentsByEntity))}static \u0275fac=(()=>{let t;return function(o){return(t||(t=u(e)))(o||e)}})();static \u0275prov=i({token:e,factory:e.\u0275fac,providedIn:"root"})};var Q=class e extends l{endpoint="evaluation_session";generatedGQL=a(G);evaluationPlanningsGQL=a(S);documentService=a(d);getQuery(){return this.generatedGQL.document}list(){return this.generatedGQL.fetch({page:1,pageSize:100},{fetchPolicy:"network-only"}).pipe(s(t=>t.data.evaluationSessions?.items||[]))}afterSave(t,n){if(!n||n.length===0)return f(t);let o=t.subjects||[],p=n.map(m=>{let r=o[m.index]?.id;if(r){let b=new FormData;return b.append("file",m.file),this.http.post(`${c.apiUrl}/evaluation_subject/upload_subject_file/${r}/`,b)}return f(null)});return g(p).pipe(s(()=>t))}changeStatus(t,n){return this.http.post(`${c.apiUrl}/${this.endpoint}/status/${t}/`,{status:n})}static \u0275fac=(()=>{let t;return function(o){return(t||(t=u(e)))(o||e)}})();static \u0275prov=i({token:e,factory:e.\u0275fac,providedIn:"root"})};export{Q as a};
