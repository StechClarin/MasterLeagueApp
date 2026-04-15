import { HttpInterceptorFn } from '@angular/common/http';

export const graphqlNameInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/graphql') && req.method === 'POST') {
    const body = req.body as any;
    
    if (body && body.operationName) {
      const opName = body.operationName;

      // Ne réécrit que les requêtes qui pointent exactement sur /graphql ou /graphql/
      // afin d'éviter d'ajouter plusieurs fois le nom d'opération.
      const graphqlRootRegex = /\/graphql\/?$/;
      if (graphqlRootRegex.test(req.url)) {
        const newReq = req.clone({
          url: req.url.replace(graphqlRootRegex, `/graphql/${opName}`)
        });

        return next(newReq);
      }
    }
  }
  return next(req);
};