import { inject, Injectable } from '@angular/core';
import { BaseService } from '@core/abstracts/base.service';
import { GetAllLevelsGQL, GetAllRoomsGQL } from '../graphql/structure.generated';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class RoomService extends BaseService {
    override endpoint = 'room';
    private generatedGQL = inject(GetAllRoomsGQL);

    override list() {
        return this.generatedGQL.fetch({ page: 1, pageSize: 100 }, { fetchPolicy: 'network-only' }).pipe(
            map((res: any) => res.data.rooms?.items || [])
        );
    }
}
