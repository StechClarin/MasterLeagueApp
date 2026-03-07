import { Injectable, inject } from '@angular/core';
import { BaseService } from '@core/abstracts/base.service';
import { GetAllClassRoomsGQL } from '../graphql/structure.generated';
import { map } from 'rxjs/operators';


@Injectable({
    providedIn: 'root'
})
export class ClassRoomService extends BaseService {
    override endpoint = 'class_room';
    private generatedGQL = inject(GetAllClassRoomsGQL);

    getQuery() {
        return this.generatedGQL.document;
    }

    override list() {
        return this.generatedGQL.fetch({ page: 1, pageSize: 100 }, { fetchPolicy: 'network-only' }).pipe(
            map((res: any) => res.data.classrooms?.items || [])
        );
    }

    listByLevel(levelId: string) {
        return this.generatedGQL.fetch({ levelId, page: 1, pageSize: 100 }, { fetchPolicy: 'network-only' }).pipe(
            map((res: any) => res.data.classrooms?.items || [])
        );
    }
}
