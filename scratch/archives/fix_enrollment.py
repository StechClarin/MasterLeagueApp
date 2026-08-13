import re

with open('frontend/src/app/features/students/components/enrollment-list/enrollment-list.component.ts', 'r') as f:
    code = f.read()

# Remove structureState = inject(StructureStateService);
code = code.replace("    structureState = inject(StructureStateService);\n", "")

# Remove currentAcademicYearId from initFilterForm
old_init = """    override initFilterForm(): FormGroup {
        const activeYearId = this.structureState.currentAcademicYearId();
        return this.fb.group({
            search: [''],
            classroomId: [null],
            academicYearId: [activeYearId]
        });
    }"""

new_init = """    override initFilterForm(): FormGroup {
        return this.fb.group({
            search: [''],
            classroomId: [null],
            academicYearId: [null]
        });
    }"""

code = code.replace(old_init, new_init)

# Inject logic to set active year in ngOnInit
old_ngoninit = """    override ngOnInit(): void {
        super.ngOnInit();

        // Sync Search"""

new_ngoninit = """    override ngOnInit(): void {
        super.ngOnInit();

        // Set active academic year by default
        this.academicYears$.pipe(takeUntil(this.destroy$)).subscribe(years => {
            const activeYear = years.find((y: any) => y.isActive);
            if (activeYear) {
                // Ensure we don't trigger unnecessary re-fetches if it's already set
                if (this.filterForm.value.academicYearId !== activeYear.id) {
                    this.filterForm.patchValue({ academicYearId: activeYear.id });
                }
            }
        });

        // Sync Search"""

code = code.replace(old_ngoninit, new_ngoninit)

with open('frontend/src/app/features/students/components/enrollment-list/enrollment-list.component.ts', 'w') as f:
    f.write(code)

print("Fixed enrollment list.")
