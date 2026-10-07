#!/usr/bin/env bash
# Usage: load-tests/run.sh [stage ...]   stages: x1 x10 x100 x1000 x10000 (default: all, in order)
# Env:   HOST, PORT (default localhost:3010), DURATION (seconds, overrides every stage),
#        HEAP_MAX (JMeter heap, default 8g), CLEANUP=0 to keep the data the run creates,
#        JMETER_HOME / JAVA_HOME if JMeter and Java are not on PATH.
set -euo pipefail
cd "$(dirname "$0")"

HOST="${HOST:-localhost}"
PORT="${PORT:-3010}"
BASE_URL="http://${HOST}:${PORT}"

stage_params() {
  case "$1" in
    x1) echo "1 1 60" ;;
    x10) echo "10 5 60" ;;
    x100) echo "100 10 60" ;;
    x1000) echo "1000 30 90" ;;
    x10000) echo "10000 60 120" ;;
    *) echo "Unknown stage '$1' (expected x1, x10, x100, x1000 or x10000)" >&2; return 1 ;;
  esac
}

find_jmeter() {
  if [ -n "${JMETER_HOME:-}" ] && [ -x "$JMETER_HOME/bin/jmeter" ]; then echo "$JMETER_HOME/bin/jmeter"; return; fi
  local candidate
  for candidate in "$HOME"/tools/apache-jmeter-*/bin/jmeter; do
    if [ -x "$candidate" ]; then echo "$candidate"; return; fi
  done
  command -v jmeter || true
}

JMETER="$(find_jmeter)"
if [ -z "$JMETER" ]; then
  echo "JMeter not found. Install Apache JMeter 5.6+ or set JMETER_HOME." >&2
  exit 1
fi
if [ -z "${JAVA_HOME:-}" ] && [ -x "$HOME/tools/jdk/bin/java" ]; then export JAVA_HOME="$HOME/tools/jdk"; fi
if [ -z "${JAVA_HOME:-}" ] && ! command -v java >/dev/null 2>&1; then
  echo "Java not found. JMeter needs Java 8 or newer (set JAVA_HOME)." >&2
  exit 1
fi

# Thousands of virtual users each hold sockets and a thread; JMeter's default
# 1 GB heap is far too small for the top stages.
export HEAP="${HEAP:--Xms1g -Xmx${HEAP_MAX:-8g} -XX:MaxMetaspaceSize=256m}"
ulimit -n 65535 2>/dev/null || true

compose() {
  if command -v docker >/dev/null 2>&1; then docker compose -f ../docker-compose.yml "$@"; else podman compose -f ../docker-compose.yml "$@"; fi
}

db_sql() {
  compose exec -T db psql -q -t -A -U "${POSTGRES_USER:-phoneme_wordle}" -d "${POSTGRES_DB:-phoneme_wordle}" -c "$1" 2>/dev/null
}

cleanup_stage() {
  local started_at="$1"
  if [ "${CLEANUP:-1}" = "0" ]; then echo "Skipping cleanup (CLEANUP=0)"; return; fi
  if [ -z "$started_at" ]; then echo "Skipping cleanup: could not reach the database container" >&2; return; fi
  # Only rows written since this stage began are removed, so earlier real or
  # simulated usage on the dashboard is left alone.
  db_sql "delete from \"Activity\" where name like 'LOAD %'" >/dev/null || true
  db_sql "delete from \"WordList\" where name like 'LOAD %'" >/dev/null || true
  db_sql "delete from \"GenerationEvent\" where not simulated and \"createdAt\" >= '${started_at}'" >/dev/null || true
  db_sql "delete from \"PageView\" where not simulated and \"createdAt\" >= '${started_at}'" >/dev/null || true
  echo "Cleaned up load-test data written since ${started_at} UTC"
}

preflight() {
  if ! curl -fsS -m 10 "${BASE_URL}/health" >/dev/null; then
    echo "App is not healthy at ${BASE_URL}/health — start it first (docker compose up -d)." >&2
    exit 1
  fi
  for type in WORDLE WORD_SEARCH; do
    if ! curl -fsS -m 10 "${BASE_URL}/api/activities?type=${type}" | grep -q '"id"'; then
      echo "No ${type} activities found — run npm run db:seed first." >&2
      exit 1
    fi
  done
}

STAGES=("$@")
if [ ${#STAGES[@]} -eq 0 ]; then STAGES=(x1 x10 x100 x1000 x10000); fi

preflight

for stage in "${STAGES[@]}"; do
  read -r users rampup duration <<<"$(stage_params "$stage")"
  duration="${DURATION:-$duration}"
  out="results/${stage}"
  rm -rf "$out"
  mkdir -p "$out"

  echo
  echo "=== ${stage}: ${users} virtual users, ${rampup}s ramp-up, ${duration}s steady (${BASE_URL}) ==="
  started_at="$(db_sql "select to_char(clock_timestamp() at time zone 'utc', 'YYYY-MM-DD HH24:MI:SS.MS')" || true)"

  "$JMETER" -n -t phoneme-wordle.jmx \
    -Jusers="$users" -Jrampup="$rampup" -Jduration="$duration" \
    -Jhost="$HOST" -Jport="$PORT" \
    -l "$out/results.jtl" -j "$out/jmeter.log" -e -o "$out/report"

  cleanup_stage "$started_at"
done

echo
node summarize.mjs
echo "Open results/<stage>/report/index.html in a browser for the full JMeter dashboard."
