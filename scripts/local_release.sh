#!/usr/bin/env bash
set -euo pipefail

RELEASE_BRANCH="master"
PRNG_PACKAGE_NAME="@drdice/prng"
DICE_PACKAGE_NAME="@drdice/dice"
EXPECTED_GITHUB_LOGIN="dearlordylord"
DRY_RUN="${DRDICE_RELEASE_DRY_RUN:-0}"
REGISTRY_VISIBILITY_ATTEMPTS=60
REGISTRY_VISIBILITY_DELAY_SECONDS=5
REGISTRY_VISIBILITY_TIMEOUT_SECONDS=$((REGISTRY_VISIBILITY_ATTEMPTS * REGISTRY_VISIBILITY_DELAY_SECONDS))

if [[ "${1:-}" == "--dist-tag-dry-run" ]]; then
  [[ -n "${2:-}" ]] || {
    printf 'Release refused: --dist-tag-dry-run requires a version\n' >&2
    exit 1
  }
  node scripts/npm-dist-tag.mjs "$2"
  exit 0
fi

fail() {
  printf 'Release refused: %s\n' "$1" >&2
  exit 1
}

published_version() {
  local package_name="$1"
  local package_version="$2"
  local error_file
  local output

  error_file="$(mktemp)"
  if output="$(npm view "$package_name@$package_version" version --json 2>"$error_file")"; then
    rm -f "$error_file"
    printf '%s\n' "$output" | tr -d '"'
    return 0
  fi

  if grep -q "E404" "$error_file"; then
    rm -f "$error_file"
    return 0
  fi

  cat "$error_file" >&2
  rm -f "$error_file"
  return 1
}

package_needs_publish() {
  local package_name="$1"
  local package_version="$2"
  [[ "$(published_version "$package_name" "$package_version")" != "$package_version" ]]
}

wait_for_published_version() {
  local package_name="$1"
  local package_version="$2"
  local attempt

  for ((attempt = 1; attempt <= REGISTRY_VISIBILITY_ATTEMPTS; attempt += 1)); do
    if [[ "$(published_version "$package_name" "$package_version")" == "$package_version" ]]; then
      return 0
    fi
    printf 'Waiting for %s@%s registry visibility (%s/%s).\n' \
      "$package_name" "$package_version" "$attempt" "$REGISTRY_VISIBILITY_ATTEMPTS"
    sleep "$REGISTRY_VISIBILITY_DELAY_SECONDS"
  done
  fail "$package_name@$package_version is not visible in the registry after $REGISTRY_VISIBILITY_TIMEOUT_SECONDS seconds"
}

current_branch="$(git branch --show-current)"
[[ "$current_branch" == "$RELEASE_BRANCH" ]] ||
  fail "current branch is '$current_branch'; expected '$RELEASE_BRANCH'"

[[ -z "$(git status --porcelain)" ]] || {
  git status --short >&2
  fail "the worktree is dirty"
}

# The checkout can be shared with a container that materialized another
# platform's optional TypeScript binary. Force installation so this release
# always verifies with the current host platform package.
CI=true pnpm install --frozen-lockfile --prod=false --force

[[ -z "$(git status --porcelain)" ]] || {
  git status --short >&2
  fail "lockfile installation changed the worktree"
}

git fetch origin "$RELEASE_BRANCH"
head_commit="$(git rev-parse HEAD)"
remote_commit="$(git rev-parse "origin/$RELEASE_BRANCH")"
[[ "$head_commit" == "$remote_commit" ]] ||
  fail "HEAD $head_commit does not equal origin/$RELEASE_BRANCH $remote_commit"

if [[ "$DRY_RUN" != "1" ]]; then
  npm whoami >/dev/null
  github_login="$(gh api user --jq .login)"
  [[ "$github_login" == "$EXPECTED_GITHUB_LOGIN" ]] ||
    fail "active GitHub account is '$github_login'; expected '$EXPECTED_GITHUB_LOGIN'"
fi

pnpm build
pnpm check:build
pnpm check:release

release_directory="$(mktemp -d)"
cleanup() {
  if [[ -n "${release_directory:-}" && -d "$release_directory" ]]; then
    rm -rf -- "$release_directory"
  fi
}
trap cleanup EXIT

pnpm --dir packages/prng pack --pack-destination "$release_directory"
pnpm --dir packages/dice pack --pack-destination "$release_directory"

prng_version="$(node -p "require('./packages/prng/package.json').version")"
dice_version="$(node -p "require('./packages/dice/package.json').version")"
[[ "$prng_version" == "$dice_version" ]] ||
  fail "package versions differ: PRNG $prng_version, Dice $dice_version"
RELEASE_TAG="v$prng_version"
npm_dist_tag="$(node scripts/npm-dist-tag.mjs "$prng_version")"
if [[ "$npm_dist_tag" == "latest" ]]; then
  github_release_kind="stable"
else
  github_release_kind="prerelease"
fi
prng_archive="$release_directory/drdice-prng-$prng_version.tgz"
dice_archive="$release_directory/drdice-dice-$dice_version.tgz"

[[ -f "$prng_archive" ]] || fail "PRNG tarball was not created"
[[ -f "$dice_archive" ]] || fail "Dice tarball was not created"

prng_needs_publish=false
dice_needs_publish=false
package_needs_publish "$PRNG_PACKAGE_NAME" "$prng_version" && prng_needs_publish=true
package_needs_publish "$DICE_PACKAGE_NAME" "$dice_version" && dice_needs_publish=true

if [[ "$DRY_RUN" == "1" ]]; then
  npm publish "$prng_archive" --access public --tag "$npm_dist_tag" --dry-run
  npm publish "$dice_archive" --access public --tag "$npm_dist_tag" --dry-run
  printf 'Release dry run passed for %s@%s and %s@%s with npm dist-tag %s.\n' \
    "$PRNG_PACKAGE_NAME" "$prng_version" "$DICE_PACKAGE_NAME" "$dice_version" "$npm_dist_tag"
  exit 0
fi

if [[ "$prng_needs_publish" == "true" ]]; then
  npm publish "$prng_archive" --access public --tag "$npm_dist_tag"
else
  printf '%s@%s is already published; skipping.\n' "$PRNG_PACKAGE_NAME" "$prng_version"
fi

if [[ "$dice_needs_publish" == "true" ]]; then
  npm publish "$dice_archive" --access public --tag "$npm_dist_tag"
else
  printf '%s@%s is already published; skipping.\n' "$DICE_PACKAGE_NAME" "$dice_version"
fi

wait_for_published_version "$PRNG_PACKAGE_NAME" "$prng_version"
wait_for_published_version "$DICE_PACKAGE_NAME" "$dice_version"

if git rev-parse -q --verify "refs/tags/$RELEASE_TAG" >/dev/null; then
  tag_commit="$(git rev-list -n 1 "$RELEASE_TAG")"
  [[ "$tag_commit" == "$head_commit" ]] ||
    fail "$RELEASE_TAG points to $tag_commit instead of $head_commit"
else
  git tag -a "$RELEASE_TAG" -m "DRDice $RELEASE_TAG"
fi

git push origin "$RELEASE_BRANCH"
git push origin "$RELEASE_TAG"

if gh release view "$RELEASE_TAG" >/dev/null 2>&1; then
  gh release upload "$RELEASE_TAG" \
    "$prng_archive#drdice-prng-$prng_version.tgz" \
    "$dice_archive#drdice-dice-$dice_version.tgz" \
    --clobber
  release_is_draft="$(gh release view "$RELEASE_TAG" --json isDraft --jq .isDraft)"
  if [[ "$release_is_draft" == "true" ]]; then
    if [[ "$github_release_kind" == "stable" ]]; then
      gh release edit "$RELEASE_TAG" --draft=false --latest --target "$head_commit"
    else
      gh release edit "$RELEASE_TAG" --draft=false --prerelease --target "$head_commit"
    fi
  fi
else
  release_flags=(--generate-notes --title "DRDice $RELEASE_TAG" --verify-tag)
  if [[ "$github_release_kind" == "stable" ]]; then
    release_flags+=(--latest)
  else
    release_flags+=(--prerelease)
  fi
  gh release create "$RELEASE_TAG" \
    "$prng_archive#drdice-prng-$prng_version.tgz" \
    "$dice_archive#drdice-dice-$dice_version.tgz" \
    "${release_flags[@]}"
fi

npm dist-tag ls "$PRNG_PACKAGE_NAME"
npm dist-tag ls "$DICE_PACKAGE_NAME"
printf 'Release finished for %s@%s and %s@%s.\n' \
  "$PRNG_PACKAGE_NAME" "$prng_version" "$DICE_PACKAGE_NAME" "$dice_version"
