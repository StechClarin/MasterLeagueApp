import { Injectable, inject } from '@angular/core';
import { BaseService } from '@core/abstracts/base.service';
import { GetAllClassRoomsGQL } from '@app/graphql/generated';
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

    list() {
        return this.generatedGQL.fetch().pipe(
            map(res => res.data.classrooms?.items || [])
        );
    }
}
