import re

# 1. READ FILES
with open('frontend/src/app/features/students/components/student-list/student-list.component.ts', 'r') as f:
    student_ts = f.read()

with open('frontend/src/app/features/students/components/student-list/student-list.component.html', 'r') as f:
    student_html = f.read()

with open('frontend/src/app/features/students/components/enrollment-list/enrollment-list.component.ts', 'r') as f:
    enroll_ts = f.read()

# 2. EXTRACT LOGIC FROM student-list.component.ts
# Extract transferForm
transfer_form_match = re.search(r'transferForm = this\.fb\.group\(\{[\s\S]*?\}\);', student_ts)
transfer_form_code = transfer_form_match.group(0) if transfer_form_match else ""

# Extract methods
def extract_method(name, code):
    match = re.search(r'(?:async\s+)?(?:private\s+)?' + name + r'\s*\([\s\S]*?\)\s*\{', code)
    if not match: return ""
    start_idx = match.start()
    brace_count = 0
    in_string = False
    string_char = ''
    i = match.end() - 1
    
    while i < len(code):
        char = code[i]
        if in_string:
            if char == string_char and code[i-1] != '\\':
                in_string = False
        elif char in "'\"`":
            in_string = True
            string_char = char
        elif char == '{':
            brace_count += 1
        elif char == '}':
            brace_count -= 1
            if brace_count == 0:
                return code[start_idx:i+1]
        i += 1
    return ""

on_expel = extract_method('onExpel', student_ts)
on_transfer = extract_method('onTransfer', student_ts)
on_print_cert = extract_method('onPrintCertificate', student_ts)
gen_cert = extract_method('generateCertificate', student_ts)
conf_expel = extract_method('confirmExpel', student_ts)
conf_trans = extract_method('confirmTransfer', student_ts)
print_trans = extract_method('printTransferApproval', student_ts)
gen_trans_pdf = extract_method('generateTransferPDF', student_ts)

# 3. REMOVE LOGIC FROM student-list.component.ts
new_student_ts = student_ts
for block in [transfer_form_code, on_expel, on_transfer, on_print_cert, gen_cert, conf_expel, conf_trans, print_trans, gen_trans_pdf]:
    if block:
        new_student_ts = new_student_ts.replace(block, '')

with open('frontend/src/app/features/students/components/student-list/student-list.component.ts', 'w') as f:
    f.write(new_student_ts)

# 4. INJECT LOGIC TO enrollment-list.component.ts
# Replace existing onExpel, onTransfer, confirmExpel, confirmTransfer in enroll_ts
for old_method in ['onExpel', 'onTransfer', 'confirmExpel', 'confirmTransfer']:
    old_code = extract_method(old_method, enroll_ts)
    if old_code:
        enroll_ts = enroll_ts.replace(old_code, '')

# Prepare new injected methods
injected_methods = f"""
    {transfer_form_code}

    {on_expel.replace('this.getCurrentEnrollment(item)', 'item').replace('const enrollment = item;', '')}

    {on_transfer.replace('this.getCurrentEnrollment(item)', 'item').replace('const enrollment = item;', '')}

    {on_print_cert.replace('this.getCurrentEnrollment(student)', 'student').replace('student:', 'enrollment:').replace('const enrollment = enrollment;', '')}

    {gen_cert}

    {conf_expel.replace('this.getCurrentEnrollment(this.selectedItem())', 'this.selectedItem()')}

    {conf_trans.replace('this.getCurrentEnrollment(this.selectedItem())', 'this.selectedItem()')}

    {print_trans.replace('student: any, enrollment: any', 'enrollment: any')}

    {gen_trans_pdf.replace('student: any, enrollment: any', 'enrollment: any').replace('student.lastName', 'enrollment.student.lastName').replace('student.firstName', 'enrollment.student.firstName').replace('student.matricule', 'enrollment.student.matricule')}
"""

# Insert before toggleFilters
enroll_ts = enroll_ts.replace('toggleFilters() {', f"{injected_methods}\n\n    toggleFilters() {{")

# Add missing imports for StructureStateService, EstablishmentService, environment
if 'StructureStateService' not in enroll_ts:
    enroll_ts = enroll_ts.replace("import { AcademicYearService }", "import { AcademicYearService }\nimport { StructureStateService } from '@core/services/structure-state.service';\nimport { EstablishmentService } from '@features/structure/services/establishment.service';\nimport { firstValueFrom } from 'rxjs';\nimport { environment } from 'src/environments/environment';")

# Add injected services to class
if 'structureState =' not in enroll_ts:
    enroll_ts = enroll_ts.replace("academicYearService = inject(AcademicYearService);", "academicYearService = inject(AcademicYearService);\n    structureState = inject(StructureStateService);\n    establishmentService = inject(EstablishmentService);")

with open('frontend/src/app/features/students/components/enrollment-list/enrollment-list.component.ts', 'w') as f:
    f.write(enroll_ts)

print("Extraction script complete.")
