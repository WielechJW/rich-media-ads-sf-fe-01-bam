"""Export both ads and all delivery sources, with a strict combined 3 MB limit."""

from pathlib import Path
import shutil
import zipfile

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'submission' if (ROOT / 'submission').is_dir() else ROOT
OUTPUT = ROOT / 'dist' / 'submission'
EXCLUDED = {'.git', 'node_modules', 'dist', 'test-results', '__pycache__'}
LIMIT = 3_000_000


def main():
    required = ['index.html', 'README.md', 'DECISIONS.md', 'variant-a-game/index.html',
                'variant-b-fireplace/top.html', 'variant-b-fireplace/left.html',
                'variant-b-fireplace/right.html', 'variant-b-fireplace/preview.html']
    for name in required:
        if not (SOURCE / name).is_file():
            raise SystemExit(f'Missing delivery file: {name}')
    files = sorted(path for path in SOURCE.rglob('*') if path.is_file()
                   and not EXCLUDED.intersection(path.relative_to(SOURCE).parts))
    total = sum(path.stat().st_size for path in files)
    if total >= LIMIT:
        raise SystemExit(f'Combined submission exceeds 3 MB: {total:,} bytes')
    if OUTPUT.exists():
        shutil.rmtree(OUTPUT)
    OUTPUT.mkdir(parents=True)
    archive = ROOT / 'dist' / 'submission.zip'
    with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as zipped:
        for source in files:
            relative = source.relative_to(SOURCE)
            target = OUTPUT / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, target)
            zipped.write(source, relative)
    print(f'Files: {len(files)}')
    print(f'Combined uncompressed delivery: {total:,} / {LIMIT:,} bytes')
    print(f'Remaining budget: {LIMIT - total:,} bytes')
    print(f'ZIP: {archive.stat().st_size:,} bytes')


if __name__ == '__main__':
    main()
