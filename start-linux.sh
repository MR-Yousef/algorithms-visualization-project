#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
FRONT="$ROOT/FrontEnd"
BACK="$ROOT/Backend/venv/config"
VENV="$ROOT/.launcher-venv"
REQUIREMENTS="$ROOT/launcher-requirements.txt"
for file in "$FRONT/package.json" "$BACK/manage.py" "$REQUIREMENTS"; do
  if [[ ! -f "$file" ]]; then echo "Missing: $file" >&2; exit 1; fi
done
for tool in npm node; do command -v "$tool" >/dev/null || { echo "Install Node.js and npm first (missing $tool)." >&2; exit 1; }; done
PYTHON=""
for candidate in python3.14 python3.13 python3.12 python3; do
  if command -v "$candidate" >/dev/null && "$candidate" -c 'import sys; assert sys.version_info >= (3,12)' 2>/dev/null; then PYTHON="$candidate"; break; fi
done
[[ -n "$PYTHON" ]] || { echo "Python 3.12+ is required (Django 6)." >&2; exit 1; }
if [[ ! -x "$VENV/bin/python" ]]; then "$PYTHON" -m venv "$VENV"; fi
if ! "$VENV/bin/python" -c 'import django, rest_framework, decouple, corsheaders, django_filters, drf_spectacular, rest_framework_simplejwt, PIL' 2>/dev/null; then
  "$VENV/bin/python" -m pip install -r "$REQUIREMENTS"
fi
if [[ ! -d "$FRONT/node_modules" ]]; then
  (cd "$FRONT" && if [[ -f package-lock.json ]]; then npm ci; else npm install; fi)
fi
if [[ ! -f "$BACK/.env" ]]; then echo "WARNING: $BACK/.env is missing; Django may fail." >&2; fi
if [[ "${RUN_MIGRATIONS:-0}" == 1 ]]; then (cd "$BACK" && "$VENV/bin/python" manage.py migrate --noinput); fi
PIDS=()
cleanup() { trap - INT TERM EXIT; echo; echo 'Stopping AlgoHub...'; for pid in "${PIDS[@]}"; do kill "$pid" 2>/dev/null || true; done; wait 2>/dev/null || true; }
trap cleanup EXIT INT TERM
(cd "$BACK" && exec "$VENV/bin/python" manage.py runserver 127.0.0.1:8000) & PIDS+=("$!")
(cd "$FRONT" && exec npm run dev -- --host 127.0.0.1 --port 5173 --strictPort) & PIDS+=("$!")
echo 'AlgoHub frontend: http://127.0.0.1:5173'
echo 'Django backend:   http://127.0.0.1:8000'
echo 'Press Ctrl+C to stop both servers.'
wait -n "${PIDS[@]}" || true
