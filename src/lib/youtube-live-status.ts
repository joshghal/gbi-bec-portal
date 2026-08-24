// Mirrors checkStreamStillLive() in gbi-bec-youtube-live-sync/src/live-summary.ts —
// kept as a small separate copy since it's a different repo/runtime, not because
// the logic differs. Used by the Item 3 re-run route as the click-time
// authoritative gate (see docs/HLD-sermon-capture-resilience.md in that repo).
//
// Returns:
//   true  — confirmed still live
//   false — confirmed ended (actualEndTime present)
//   null  — inconclusive (no key / API error / no liveStreamingDetails) — the
//           caller should fail OPEN on null (don't block an admin action on a
//           transient API hiccup), same philosophy as the engine's own poller.
export async function checkStreamStillLive(videoId: string): Promise<boolean | null> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return null;
  try {
    const r = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${videoId}&key=${key}`);
    if (!r.ok) return null;
    const j = await r.json() as { items?: Array<{ liveStreamingDetails?: { actualEndTime?: string } }> };
    const details = j.items?.[0]?.liveStreamingDetails;
    if (!details) return null;
    return !details.actualEndTime;
  } catch {
    return null;
  }
}
