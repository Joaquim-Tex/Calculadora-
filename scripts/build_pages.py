import os
import shutil
from pathlib import Path

from calculadora import app


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "site"
BASE_PATH = os.environ.get("PAGES_BASE_PATH", "/Calculadora-").rstrip("/")

if not BASE_PATH.startswith("/") or BASE_PATH.startswith("//"):
    raise ValueError("PAGES_BASE_PATH deve começar com uma única barra.")

app.config["STATIC_SITE"] = True
response = app.test_client().get("/")
if response.status_code != 200:
    raise RuntimeError(f"A página inicial retornou HTTP {response.status_code}.")

html = response.get_data(as_text=True)
html = html.replace('href="/static/', f'href="{BASE_PATH}/static/')
html = html.replace('src="/static/', f'src="{BASE_PATH}/static/')

if 'data-calculation-mode="static"' not in html:
    raise RuntimeError("A página gerada não está configurada para cálculos estáticos.")

OUTPUT.mkdir(parents=True, exist_ok=True)
(OUTPUT / "index.html").write_text(html, encoding="utf-8")
shutil.copytree(ROOT / "static", OUTPUT / "static", dirs_exist_ok=True)
print(f"Site estático gerado em {OUTPUT}")
