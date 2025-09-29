#!/usr/bin/env bash
set -euo pipefail

HOST="127.0.0.1"
PORT="8080"
BASE_URL="http://${HOST}:${PORT}"
DOCROOT="public_html/api/public"
ROUTER="${DOCROOT}/index.php"

log() {
  printf '\n[%s] %s\n' "$(date '+%H:%M:%S')" "$*"
}

cleanup() {
  if [[ -n "${SERVER_PID:-}" ]] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" >/dev/null 2>&1 || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
  rm -rf "$TMPDIR"
}

TMPDIR=$(mktemp -d)
trap cleanup EXIT

log "Starting PHP development server for API tests..."
php -S "${HOST}:${PORT}" -t "$DOCROOT" "$ROUTER" >"$TMPDIR/server.log" 2>&1 &
SERVER_PID=$!

log "Waiting for server to be ready..."
for _ in {1..20}; do
  if curl -sS "${BASE_URL}/health" >/dev/null 2>&1; then
    READY=1
    break
  fi
  sleep 1
  READY=0
done

if [[ "${READY:-0}" -ne 1 ]]; then
  log "Server failed to start. Output:" >&2
  cat "$TMPDIR/server.log" >&2
  exit 1
fi

log "Server is ready; running endpoint checks."

check_endpoint() {
  local method="$1"
  local path="$2"
  local expected_status="$3"
  local body="${4:-}"
  local description="${5:-$method $path}"

  local response_file="$TMPDIR/response.json"
  local status

  if [[ -n "$body" ]]; then
    status=$(curl -sS -o "$response_file" -w '%{http_code}' \
      -X "$method" \
      -H 'Content-Type: application/json' \
      -d "$body" \
      "${BASE_URL}${path}")
  else
    status=$(curl -sS -o "$response_file" -w '%{http_code}' \
      -X "$method" \
      "${BASE_URL}${path}")
  fi

  if [[ "$status" != "$expected_status" ]]; then
    log "${description} failed: expected status $expected_status, got $status" >&2
    cat "$response_file" >&2
    return 1
  fi

  if ! grep -q '"ok":true' "$response_file" && ! grep -q '"status":"ok"' "$response_file"; then
    log "${description} failed: response did not indicate success" >&2
    cat "$response_file" >&2
    return 1
  fi

  log "${description} passed with status ${status}."
}

check_endpoint GET /health 200 '' 'Health check'

EMAIL="test.$(date +%s).$RANDOM@example.com"
PASSWORD="Sup3rSecure!"
NAME="Workflow Smoke"

check_endpoint POST /api/auth/signup 201 "{\"name\":\"$NAME\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" "Signup endpoint"
check_endpoint POST /api/auth/login 200 "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" "Login endpoint"

PROVIDER_EMAIL="provider.$(date +%s).$RANDOM@example.com"
check_endpoint POST /api/auth/provider 200 "{\"email\":\"$PROVIDER_EMAIL\",\"name\":\"$NAME\",\"provider\":\"google\"}" "Provider endpoint"
check_endpoint POST /api/auth/logout 200 '{}' "Logout endpoint"

log "All endpoint checks passed."
