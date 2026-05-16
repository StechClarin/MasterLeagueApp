#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to fix encoding issues in migration files.
Converts all migration files to UTF-8 encoding and adds encoding declaration if missing.
"""

import os
import sys
from pathlib import Path

def fix_migration_file(filepath):
    """Fix encoding of a single migration file."""
    try:
        # Try to read with UTF-8
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if encoding declaration exists
        if not content.startswith('# -*- coding: utf-8 -*-'):
            # Read in binary to add declaration at start
            with open(filepath, 'rb') as f:
                binary_content = f.read()
            
            # Add UTF-8 declaration at the very beginning
            declaration = b'# -*- coding: utf-8 -*-\n'
            
            # Remove any existing encoding declaration
            lines = binary_content.split(b'\n')
            new_lines = []
            for i, line in enumerate(lines):
                if i == 0 and (line.startswith(b'#!/') or line.startswith(b'# -*-')):
                    continue  # Skip shebang or existing encoding
                if i <= 1 and line.startswith(b'# -*-'):
                    continue  # Skip encoding declaration
                new_lines.append(line)
            
            # Write back with declaration
            with open(filepath, 'wb') as f:
                f.write(declaration)
                f.write(b'\n'.join(new_lines))
        
        return True, "OK (UTF-8)"
    
    except UnicodeDecodeError:
        # Try with different encodings
        for encoding in ['utf-8-sig', 'latin-1', 'cp1252', 'iso-8859-1']:
            try:
                with open(filepath, 'r', encoding=encoding) as f:
                    content = f.read()
                
                # Write back as UTF-8 with declaration
                declaration = '# -*- coding: utf-8 -*-\n'
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(declaration)
                    f.write(content)
                
                return True, f"Fixed (converted from {encoding})"
            
            except Exception:
                continue
        
        return False, "FAILED (unknown encoding)"
    
    except Exception as e:
        return False, f"ERROR: {str(e)}"

def main():
    """Main function to fix all migration files."""
    base_dir = Path(__file__).parent.parent
    migrations_pattern = base_dir / "apps" / "*" / "migrations" / "*.py"
    
    print("🔧 Fixing migration file encodings...\n")
    
    fixed_count = 0
    error_count = 0
    
    for app_dir in (base_dir / "apps").glob("*/migrations"):
        for migration_file in app_dir.glob("*.py"):
            if migration_file.name == "__init__.py":
                continue
            
            success, message = fix_migration_file(migration_file)
            
            relative_path = migration_file.relative_to(base_dir)
            
            if success:
                print(f"✅ {relative_path}: {message}")
                fixed_count += 1
            else:
                print(f"❌ {relative_path}: {message}")
                error_count += 1
    
    print(f"\n📊 Summary:")
    print(f"   Fixed: {fixed_count}")
    print(f"   Errors: {error_count}")
    
    if error_count == 0:
        print("✨ All migration files fixed!\n")
        return 0
    else:
        print(f"⚠️  {error_count} files had issues\n")
        return 1

if __name__ == "__main__":
    sys.exit(main())
