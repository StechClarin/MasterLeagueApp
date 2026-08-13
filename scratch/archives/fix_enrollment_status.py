import re

with open('frontend/src/app/features/students/components/enrollment-list/enrollment-list.component.ts', 'r') as f:
    code = f.read()

# 1. Update filter HTML
old_filter_html = """            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Année Académique</label>
              <div class="relative">
                <select formControlName="academicYearId" 
                  class="block w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm appearance-none bg-no-repeat bg-right focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer">
                  <option [ngValue]="null">Toutes les années</option>
                  <ng-container *ngIf="academicYears$ | async as years">
                      <option *ngFor="let y of years" [value]="y?.id">{{ y?.name }}</option>
                  </ng-container>
                </select>
              </div>
            </div>"""

new_filter_html = old_filter_html + """
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Statut</label>
              <div class="relative">
                <select formControlName="status" 
                  class="block w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm appearance-none bg-no-repeat bg-right focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer">
                  <option [ngValue]="null">Tous les statuts</option>
                  <option value="PENDING">En attente</option>
                  <option value="REGISTERED">Inscrit</option>
                  <option value="LEFT">Parti</option>
                  <option value="EXPELLED">Renvoyé</option>
                </select>
              </div>
            </div>"""

code = code.replace(old_filter_html, new_filter_html)
code = code.replace('grid-cols-1 md:grid-cols-2', 'grid-cols-1 md:grid-cols-3')

# 2. Update initFilterForm
old_init = """    override initFilterForm(): FormGroup {
        return this.fb.group({
            search: [''],
            classroomId: [null],
            academicYearId: [null]
        });
    }"""

new_init = """    override initFilterForm(): FormGroup {
        return this.fb.group({
            search: [''],
            classroomId: [null],
            academicYearId: [null],
            status: [null]
        });
    }"""

code = code.replace(old_init, new_init)

# 3. Update ngOnInit to patch status as well
old_ngoninit = """                // Ensure we don't trigger unnecessary re-fetches if it's already set
                if (this.filterForm.value.academicYearId !== activeYear.id) {
                    this.filterForm.patchValue({ academicYearId: activeYear.id });
                }"""

new_ngoninit = """                // Ensure we don't trigger unnecessary re-fetches if it's already set
                if (this.filterForm.value.academicYearId !== activeYear.id || this.filterForm.value.status !== 'REGISTERED') {
                    this.filterForm.patchValue({ 
                        academicYearId: activeYear.id,
                        status: 'REGISTERED' 
                    });
                }"""

code = code.replace(old_ngoninit, new_ngoninit)

# 4. Update getStatusLabel to handle PENDING and the others properly
old_status_labels = """    getStatusLabel(status: string): string {
        const labels: any = {
            'REGISTERED': 'Inscrit',
            'LEFT': 'Parti',
            'EXPELLED': 'Renvoyé'
        };
        return labels[status] || status;
    }

    getStatusClass(status: string): string {
        const base = 'px-2.5 py-1 rounded-full text-xs font-bold border ';
        const classes: any = {
            'REGISTERED': base + 'bg-green-50 text-green-700 border-green-100',
            'LEFT': base + 'bg-gray-50 text-gray-700 border-gray-100',
            'EXPELLED': base + 'bg-red-50 text-red-700 border-red-100'
        };
        return classes[status] || base + 'bg-gray-50 text-gray-400 border-gray-100';
    }"""

new_status_labels = """    getStatusLabel(status: string): string {
        const labels: any = {
            'PENDING': 'En attente',
            'REGISTERED': 'Inscrit',
            'LEFT': 'Parti',
            'EXPELLED': 'Renvoyé'
        };
        return labels[status] || 'Inconnu';
    }

    getStatusClass(status: string): string {
        const base = 'px-2.5 py-1 rounded-full text-xs font-bold border ';
        const classes: any = {
            'PENDING': base + 'bg-amber-50 text-amber-700 border-amber-200',
            'REGISTERED': base + 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm',
            'LEFT': base + 'bg-slate-50 text-slate-700 border-slate-200',
            'EXPELLED': base + 'bg-red-50 text-red-700 border-red-200'
        };
        return classes[status] || base + 'bg-slate-50 text-slate-400 border-slate-100';
    }"""

code = code.replace(old_status_labels, new_status_labels)

with open('frontend/src/app/features/students/components/enrollment-list/enrollment-list.component.ts', 'w') as f:
    f.write(code)

print("Fixed enrollment list statuses.")
