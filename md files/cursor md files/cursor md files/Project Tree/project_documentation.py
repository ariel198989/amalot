import os
from pathlib import Path
from typing import List
import math

def read_file_content(file_path: Path) -> str:
    """Read and return file content with line numbers"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            numbered_lines = [f"{i+1}| {line}" for i, line in enumerate(lines)]
            return ''.join(numbered_lines)
    except Exception as e:
        return f"Error reading file: {str(e)}\n"

def generate_documentation(root_path: str, exclude_dirs: List[str] = None, exclude_files: List[str] = None) -> tuple[str, dict]:
    if exclude_dirs is None:
        exclude_dirs = [
            'node_modules',
            '.git',
            '__pycache__',
            'venv',
            '.next',
            'build',
            'dist',
            '.cache',
            '.npm',
            'coverage',
            '.vscode',
            '.idea',
            '.temp',  # Supabase temp files
            'public/images'  # Image assets
        ]
    if exclude_files is None:
        exclude_files = [
            '.DS_Store',
            '.gitignore',
            '.env',
            '.env.local',
            'package-lock.json',
            'yarn.lock',
            '*.pyc',
            '*.pyo',
            '*.pyd',
            'tsconfig.*.json',  # TypeScript config variations
            'components.json',   # Redundant config
            'postcss.config.js',
            'tailwind.config.js',
            'vite.config.ts',
            'eslint.config.js',
            'cli-latest',
            'gotrue-version',
            'pooler-url',
            'postgres-version',
            'project-ref',
            'rest-version',
            'storage-version'
        ]
    
    tree = []
    file_contents = {}
    root_path = Path(root_path)
    
    def should_exclude_file(filename: str) -> bool:
        """Check if file should be excluded based on name or extension"""
        return (
            filename in exclude_files or
            any(filename.endswith(ext) for ext in [
                '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg',
                '.ttf', '.woff', '.woff2', '.eot',
                '.mp4', '.webm', '.ogg',
                '.pdf', '.zip', '.tar.gz'
            ])
        )
    
    def add_to_tree(path: Path, prefix: str = ''):
        if path.is_file():
            if not should_exclude_file(path.name):
                tree.append(f"{prefix}├── {path.name}")
                rel_path = str(path.relative_to(root_path))
                file_contents[rel_path] = read_file_content(path)
        else:
            if path.name not in exclude_dirs:
                if path != root_path:
                    tree.append(f"{prefix}├── {path.name}/")
                    prefix += "│   "
                for item in sorted(path.iterdir()):
                    add_to_tree(item, prefix)
    
    add_to_tree(root_path)
    return '\n'.join(tree), file_contents

def save_documentation_in_chunks(project_path: str, lines_per_chunk: int = 2500, base_output_file: str = "project_documentation"):
    """Generate and save project documentation in chunks of specified lines"""
    print("Generating documentation...")
    tree_structure, file_contents = generate_documentation(project_path)
    
    # Save tree structure separately
    tree_file = f"{base_output_file}_0_tree.txt"
    with open(tree_file, 'w', encoding='utf-8') as f:
        f.write("=" * 80 + "\n")
        f.write("PROJECT TREE STRUCTURE\n")
        f.write("=" * 80 + "\n\n")
        f.write(tree_structure)
    
    print(f"Tree structure saved to {tree_file}")
    
    # Process files in chunks
    current_chunk = 1
    current_lines = 0
    files_in_current_chunk = []
    total_lines = 0
    
    # First pass: count total lines and identify large files
    for content in file_contents.values():
        total_lines += content.count('\n')
    
    estimated_chunks = math.ceil(total_lines / lines_per_chunk)
    print(f"\nTotal lines of code: {total_lines}")
    print(f"Estimated number of chunks: {estimated_chunks} (max {lines_per_chunk} lines each)")
    
    for file_path, content in file_contents.items():
        file_lines = content.count('\n')
        file_content = f"\nFile: {file_path}\n{'-' * 80}\n{content}\n"
        
        # If single file is larger than chunk size, split it into multiple chunks
        if file_lines > lines_per_chunk:
            # Save current chunk if not empty
            if files_in_current_chunk:
                with open(f"{base_output_file}_{current_chunk:02d}.txt", 'w', encoding='utf-8') as f:
                    f.write(f"=" * 80 + "\n")
                    f.write(f"FILE CONTENTS (PART {current_chunk})\n")
                    f.write("=" * 80 + "\n\n")
                    f.write(''.join(files_in_current_chunk))
                current_chunk += 1
                files_in_current_chunk = []
                current_lines = 0
            
            # Save large file
            with open(f"{base_output_file}_{current_chunk:02d}.txt", 'w', encoding='utf-8') as f:
                f.write(f"=" * 80 + "\n")
                f.write(f"LARGE FILE: {file_path} ({file_lines} lines)\n")
                f.write("=" * 80 + "\n\n")
                f.write(file_content)
            print(f"Large file saved to chunk {current_chunk:02d} ({file_lines} lines)")
            current_chunk += 1
            continue
        
        # If adding this file would exceed chunk size, save current chunk
        if current_lines + file_lines > lines_per_chunk and files_in_current_chunk:
            with open(f"{base_output_file}_{current_chunk:02d}.txt", 'w', encoding='utf-8') as f:
                f.write(f"=" * 80 + "\n")
                f.write(f"FILE CONTENTS (PART {current_chunk})\n")
                f.write(f"Lines: {current_lines}\n")
                f.write("=" * 80 + "\n\n")
                f.write(''.join(files_in_current_chunk))
            current_chunk += 1
            files_in_current_chunk = []
            current_lines = 0
        
        files_in_current_chunk.append(file_content)
        current_lines += file_lines
    
    # Save any remaining files
    if files_in_current_chunk:
        with open(f"{base_output_file}_{current_chunk:02d}.txt", 'w', encoding='utf-8') as f:
            f.write(f"=" * 80 + "\n")
            f.write(f"FILE CONTENTS (PART {current_chunk})\n")
            f.write(f"Lines: {current_lines}\n")
            f.write("=" * 80 + "\n\n")
            f.write(''.join(files_in_current_chunk))
    
    print("\nDocumentation has been split into chunks:")
    print(f"- {tree_file} (Project Tree)")
    print(f"- Chunks 01-{current_chunk:02d} (max {lines_per_chunk} lines each)")

if __name__ == '__main__':
    project_path = '/Users/galhavkin/Desktop/aiboost'
    save_documentation_in_chunks(project_path, lines_per_chunk=2500)
    print(f"Documentation has been generated for: {project_path}")
    print("Check project_documentation.txt for the complete documentation") 