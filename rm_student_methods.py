import re

with open('frontend/src/app/features/students/components/student-list/student-list.component.ts', 'r') as f:
    code = f.read()

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

blocks_to_remove = [
    extract_method('onExpel', code),
    extract_method('onTransfer', code),
    extract_method('onPrintCertificate', code),
    extract_method('generateCertificate', code),
    extract_method('confirmExpel', code),
    extract_method('confirmTransfer', code),
    extract_method('printTransferApproval', code),
    extract_method('generateTransferPDF', code)
]

# also remove transferForm
transfer_form_match = re.search(r'transferForm = this\.fb\.group\(\{[\s\S]*?\}\);', code)
if transfer_form_match:
    blocks_to_remove.append(transfer_form_match.group(0))

for block in blocks_to_remove:
    if block:
        code = code.replace(block, '')

with open('frontend/src/app/features/students/components/student-list/student-list.component.ts', 'w') as f:
    f.write(code)

print("Methods removed from student-list")
