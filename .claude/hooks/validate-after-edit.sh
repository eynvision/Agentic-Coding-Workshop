#!/usr/bin/env bash
set -u

compile_log="$(mktemp)"
docker_log="$(mktemp)"

python -m compileall . >"$compile_log" 2>&1
compile_code=$?

docker build -t taskflow-backend backend/ >"$docker_log" 2>&1
docker_code=$?

python - "$compile_code" "$docker_code" "$compile_log" "$docker_log" <<'PY'
import json
import sys
from pathlib import Path

compile_code = int(sys.argv[1])
docker_code = int(sys.argv[2])
compile_log = Path(sys.argv[3]).read_text(errors="replace").strip()
docker_log = Path(sys.argv[4]).read_text(errors="replace").strip()

compile_ok = compile_code == 0
docker_ok = docker_code == 0

summary_lines = [
    "✅ Python compile check passed" if compile_ok else "❌ Python compile check failed",
    "✅ Docker build check passed" if docker_ok else "❌ Docker build check failed",
]

summary = "\n".join(summary_lines)

if compile_ok and docker_ok:
    print(json.dumps({
        "systemMessage": summary,
        "hookSpecificOutput": {
            "hookEventName": "PostToolUse",
            "additionalContext": summary
        }
    }))
    sys.exit(0)

details = [summary]

if not compile_ok:
    details.append("\nPython compile output:\n" + (compile_log or "No output"))

if not docker_ok:
    details.append("\nDocker build output:\n" + (docker_log or "No output"))

reason = "\n".join(details)

print(json.dumps({
    "systemMessage": summary,
    "decision": "block",
    "reason": reason,
    "hookSpecificOutput": {
        "hookEventName": "PostToolUse",
        "additionalContext": reason
    }
}))

sys.exit(0)
PY
