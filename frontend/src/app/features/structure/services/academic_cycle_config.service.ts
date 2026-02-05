import { Injectable, inject } from '@angular/core';
import { BaseService } from '@core/abstracts/base.service';

@Injectable({
    providedIn: 'root'
})
export class AcademicCycleConfigService extends BaseService {
    override endpoint = 'academic_cycle_config';
}
