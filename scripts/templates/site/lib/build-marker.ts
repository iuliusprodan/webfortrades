export const BUILD_MARKER_BUILD_ID = "webfortrades-build-id";
export const BUILD_MARKER_SLUG = "webfortrades-business-slug";
export const BUILD_MARKER_COMMENT_PREFIX = "webfortrades-build:";

export function buildMarkerComment(buildId: string): string {
  return `<!-- ${BUILD_MARKER_COMMENT_PREFIX}${buildId} -->`;
}
