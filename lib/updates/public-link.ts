export function publicUpdateLink(value: string | null | undefined) {
  if (!value) return undefined;

  const url = URL.canParse(value) ? new URL(value) : undefined;
  if (!url || (url.protocol !== "http:" && url.protocol !== "https:")) {
    return undefined;
  }

  // Plane work items are accessible only to the project team.
  if (url.hostname.replace(/\.$/, "") === "plane.stevensweb.org") {
    return undefined;
  }

  return value;
}
