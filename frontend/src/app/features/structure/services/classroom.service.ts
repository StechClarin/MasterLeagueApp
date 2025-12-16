import { Injectable, inject } from '@angular/core';
import { BaseService } from '@core/abstracts/base.service';
import { GetAllClassRoomsGQL } from '@app/graphql/generated';

@Injectable({
    providedIn: 'root'
})
export class ClassRoomService extends BaseService {
    override endpoint = 'class_room';
    private generatedGQL = inject(GetAllClassRoomsGQL);

    getQuery() {
        return this.generatedGQL.document;
    }
}
