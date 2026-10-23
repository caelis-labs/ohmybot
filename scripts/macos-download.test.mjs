import test from "node:test";
import assert from "node:assert/strict";
import { artifactURL, resolveDownload } from "../functions/download/macos.js";
const manifest = {
  schema: 1,
  version: "0.18.2",
  tag: "v0.18.2",
  file: "Caelis-Bot-0.18.2-macos-arm64.dmg",
  source: "a".repeat(40),
  sha256: "b".repeat(64),
  length: 123456,
};
const request = (query = "", method = "GET") =>
  new Request(`https://ohmybot.si/download/macos/${query}`, { method });
const mock =
  (value = manifest, length = value.length) =>
  async (url, options) => {
    assert.equal(options.redirect, "manual");
    if (url.endsWith("/latest.json"))
      return new Response(JSON.stringify(value));
    assert.equal(options.method, "HEAD");
    return new Response(null, {
      headers: { "content-length": String(length) },
    });
  };

test("macOS resolves current metadata directly to R2 for GET, HEAD and checksum", async () => {
  for (const method of ["GET", "HEAD"]) {
    const response = await resolveDownload(request("", method), mock());
    assert.equal(response.status, 302);
    assert.equal(response.headers.get("location"), artifactURL(manifest));
    assert.equal(response.headers.get("cache-control"), "no-store");
  }
  const checksum = await resolveDownload(request("?asset=checksum"), mock());
  assert.equal(
    checksum.headers.get("location"),
    artifactURL(manifest, "checksum"),
  );
  const newer = {
    ...manifest,
    version: "0.19.0",
    tag: "v0.19.0",
    file: "Caelis-Bot-0.19.0-macos-arm64.dmg",
  };
  assert.equal(
    (await resolveDownload(request(), mock(newer))).headers.get("location"),
    artifactURL(newer),
  );
});

test("macOS refuses malformed, external, oversized or mismatched artifacts", async () => {
  for (const patch of [
    { file: "https://evil.example/app.dmg" },
    { tag: "v0.18.2/../other" },
    { sha256: "bad" },
    { source: "bad" },
    { length: 0 },
    { length: Infinity },
    { version: "0.18.2-preview" },
  ]) {
    assert.equal(
      (await resolveDownload(request(), mock({ ...manifest, ...patch })))
        .status,
      503,
    );
  }
  assert.equal(
    (await resolveDownload(request(), mock(manifest, 1))).status,
    503,
  );
  assert.equal(
    (
      await resolveDownload(
        request(),
        async () => new Response("x".repeat(17000)),
      )
    ).status,
    503,
  );
});

test("unavailable metadata and methods fail without main-site or unknown redirects", async () => {
  for (const fetcher of [
    async () => {
      throw new Error("offline");
    },
    async () =>
      new Response(null, {
        status: 302,
        headers: { location: "https://evil.example" },
      }),
    async () => new Response("{"),
  ]) {
    const response = await resolveDownload(request(), fetcher);
    assert.equal(response.status, 503);
    assert.equal(response.headers.get("location"), null);
  }
  const never = async () => {
    throw new Error("must not fetch");
  };
  assert.equal(
    (await resolveDownload(request("?asset=exe"), never)).status,
    400,
  );
  assert.equal((await resolveDownload(request("", "POST"), never)).status, 405);
});
