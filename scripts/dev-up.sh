#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  scripts/dev-up.sh [--with-fixtures] [--dry-run]

What it does:
  1) Creates missing env files from *.env.example
  2) Starts full stack (postgres + app + web)
  3) Optionally loads fixtures

Options:
  --with-fixtures   Run one-shot fixtures loader after stack is up
  --dry-run         Print actions without executing docker commands
  -h, --help        Show this help
EOF
}

WITH_FIXTURES=0
DRY_RUN=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --with-fixtures)
      WITH_FIXTURES=1
      shift
      ;;
    --dry-run)
      DRY_RUN=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage
      exit 2
      ;;
  esac
done

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

ensure_env_file() {
  local target="$1"
  local example="$2"
  if [[ ! -f "$target" ]]; then
    if [[ ! -f "$example" ]]; then
      echo "Missing example file: $example" >&2
      exit 1
    fi
    cp "$example" "$target"
    echo "Created $target from $example"
  else
    echo "Using existing $target"
  fi
}

run_cmd() {
  echo "+ $*"
  if [[ "$DRY_RUN" -eq 0 ]]; then
    "$@"
  fi
}

ensure_env_file "$ROOT_DIR/.env" "$ROOT_DIR/.env.example"
ensure_env_file "$ROOT_DIR/server/.env" "$ROOT_DIR/server/.env.example"
ensure_env_file "$ROOT_DIR/web/.env" "$ROOT_DIR/web/.env.example"

run_cmd docker compose --env-file "$ROOT_DIR/.env" \
  -f "$ROOT_DIR/docker-compose.yml" \
  up --build -d

if [[ "$WITH_FIXTURES" -eq 1 ]]; then
  run_cmd docker compose --env-file "$ROOT_DIR/.env" \
    -f "$ROOT_DIR/docker-compose.yml" \
    --profile fixtures run --rm fixtures
fi

echo "Done."
if [[ "$WITH_FIXTURES" -eq 1 ]]; then
  echo "Stack is up and fixtures are loaded."
else
  echo "Stack is up (fixtures not loaded)."
fi
