export function getCurrentVideoId() {
  // e.g., https://www.youtube.com/watch?v=VIDEO_ID&something=else
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("v") || "unknown";
} 