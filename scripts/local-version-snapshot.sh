#!/usr/bin/env bash
set -euo pipefail

# Usage: scripts/local-version-snapshot.sh <tag> [--execute]
# Simulates version-snapshot.yml locally via act (dry-run by default).

TAG=""
EXECUTE=false

for arg in "$@"; do
  case "$arg" in
    --execute) EXECUTE=true ;;
    v*) TAG="$arg" ;;
    *) echo "Unknown argument: $arg" >&2; exit 1 ;;
  esac
done

if [[ -z "$TAG" ]]; then
  echo "Error: tag argument is required (e.g. v2.0.0)" >&2
  echo "Usage: $0 <vN.0.0> [--execute]" >&2
  exit 1
fi

# Validate: must be vN.0.0 (major-only release)
if ! [[ "$TAG" =~ ^v[0-9]+\.0\.0$ ]]; then
  echo "Error: tag '${TAG}' does not match vN.0.0 format (e.g. v2.0.0)." >&2
  echo "Only major-version tags trigger a version snapshot." >&2
  exit 1
fi

MAJOR="${TAG%%.*}"       # e.g. v2
MAJOR="${MAJOR#v}"       # e.g. 2
IDENTIFIER="v${MAJOR}"  # e.g. v2
BRANCH="${MAJOR}.x.x"   # e.g. 2.x.x

echo ""
echo "=== Version Snapshot Simulation ==="
echo "  Tag:        ${TAG}"
echo "  Branch:     ${BRANCH}"
echo "  Identifier: ${IDENTIFIER}"
echo ""
echo "--- Operations that would run ---"
echo "  1. git checkout -b ${BRANCH} ${TAG}"
echo "  2. sed: src/environments/environment.prod.ts"
echo "       version: '' → version: '${IDENTIFIER}'"
echo "  3. git commit -m \"chore(release): set version to ${IDENTIFIER} on ${BRANCH}\""
echo "  4. git push origin ${BRANCH}"
echo "  5. git checkout main && git pull origin main"
echo "  6. public/versions.json: append \"${IDENTIFIER}\""
echo "  7. git commit -m \"chore(release): add ${IDENTIFIER} to versions.json\""
echo "  8. git push origin main"
echo ""

if [[ "$EXECUTE" == false ]]; then
  echo "=== DRY RUN — no changes made ==="
  echo "Pass --execute to perform real git operations via act."
  exit 0
fi

echo "WARNING: --execute will run 'act release' which performs real git pushes."
echo "Branch '${BRANCH}' will be created and pushed to origin."
echo "versions.json on main will be updated."
echo ""
read -r -p "Proceed? [y/N] " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
  echo "Aborted." >&2
  exit 1
fi

# Build event payload
PAYLOAD_FILE="$(mktemp /tmp/version-snapshot-event.XXXXXX.json)"
trap 'rm -f "$PAYLOAD_FILE"' EXIT

cat > "$PAYLOAD_FILE" <<EOF
{
  "action": "published",
  "release": {
    "tag_name": "${TAG}",
    "name": "Release ${TAG}",
    "draft": false,
    "prerelease": false
  },
  "ref": "refs/tags/${TAG}",
  "ref_name": "${TAG}"
}
EOF

echo "Running: act release -e ${PAYLOAD_FILE}"
act release -e "$PAYLOAD_FILE"
