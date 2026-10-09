#!/usr/bin/env bash
# Logic: Shell CLI wrapper for adding competitive programming problems and generating authentic testcases.
# Input: CLI arguments forwarded directly to scripts/add_problem.py.
# Output: Execution status and problem registration summary.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Logic: Validates Python 3 environment and delegates execution to add_problem.py.
# Input: $@ command line arguments.
# Output: Exit status code of add_problem.py.
main() {
    if ! command -v python3 &>/dev/null; then
        echo "[!] Error: python3 is required to execute problem generation." >&2
        exit 1
    fi

    python3 "${SCRIPT_DIR}/add_problem.py" "$@"
}

main "$@"
