"""
Garde-fou P1 : init_app._install_canonical() doit être sûr.
- fichier Python invalide -> SyntaxError AVANT écriture (fail-fast)
- fichier source manquant -> FileNotFoundError claire
- fichier valide -> copié correctement
"""
import pytest

import init_app


def test_install_canonical_rejects_invalid_python(tmp_path, monkeypatch):
    bootstrap = tmp_path / "bootstrap"
    bootstrap.mkdir()
    (bootstrap / "bad_seed.py").write_text("def broken(:\n", encoding="utf-8")
    monkeypatch.setattr(init_app, "BOOTSTRAP_DIR", str(bootstrap))

    with pytest.raises(SyntaxError):
        init_app._install_canonical("bad_seed.py", str(tmp_path / "out" / "bad_seed.py"))


def test_install_canonical_missing_source_raises(tmp_path, monkeypatch):
    bootstrap = tmp_path / "bootstrap"
    bootstrap.mkdir()
    monkeypatch.setattr(init_app, "BOOTSTRAP_DIR", str(bootstrap))

    with pytest.raises(FileNotFoundError):
        init_app._install_canonical("inexistant.py", str(tmp_path / "x.py"))


def test_install_canonical_valid_python(tmp_path, monkeypatch):
    bootstrap = tmp_path / "bootstrap"
    bootstrap.mkdir()
    (bootstrap / "good.py").write_text("x = 1\n", encoding="utf-8")
    monkeypatch.setattr(init_app, "BOOTSTRAP_DIR", str(bootstrap))

    dest = tmp_path / "out" / "good.py"
    init_app._install_canonical("good.py", str(dest))
    assert dest.exists()
    assert dest.read_text(encoding="utf-8") == "x = 1\n"


def test_install_canonical_text_no_compile(tmp_path, monkeypatch):
    bootstrap = tmp_path / "bootstrap"
    bootstrap.mkdir()
    # Contenu TS invalide en Python mais valide en 'text' (ne doit PAS compiler)
    (bootstrap / "fichier.ts").write_text("export const x = 'y';\n", encoding="utf-8")
    monkeypatch.setattr(init_app, "BOOTSTRAP_DIR", str(bootstrap))

    dest = tmp_path / "out" / "fichier.ts"
    init_app._install_canonical("fichier.ts", str(dest), syntax="text")
    assert dest.read_text(encoding="utf-8") == "export const x = 'y';\n"
