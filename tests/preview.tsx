// Visual testing only: run on port 5176. All API calls below use in-memory fixtures.
import { createRoot } from "react-dom/client";
import { api } from "../src/services/api";
import "../src/index.css";

if (location.port !== "5176") throw new Error("Open this isolated preview on port 5176, never on the normal app origin.");
const me = { _id: "preview-user", name: "Eyad Saker", username: "eyadsaker", photo: "", email: "eyad@example.test", followersCount: 311, followingCount: 42 };
const other = { _id: "preview-friend", name: "Ahmed Ali", username: "ahmedali", photo: "", followersCount: 188 };
const comment = { _id: "preview-comment", content: "Great work! Excited to see what you build next.", commentCreator: other, createdAt: new Date().toISOString(), post: "preview-post", likes: [] };
const post = { _id: "preview-post", id: "preview-post", body: "Building something new, one component at a time. Welcome to NotFacebook! 💙", user: me, privacy: "public", likes: [], likesCount: 18, commentsCount: 1, sharesCount: 3, bookmarked: false, isShare: false, createdAt: new Date(Date.now() - 3600000).toISOString(), topComment: comment };
let following = false;
api.defaults.adapter = async (config) => {
  const path = config.url || "";
  let data: object = {};
  if (path === "/users/profile-data" || path.endsWith("/profile")) data = { user: path.includes("preview-friend") ? other : me };
  else if (path.endsWith("/suggestions")) data = { suggestions: [other, { ...other, _id: "preview-friend-2", name: "Alaa Ashraf", username: "alaaashraf", followersCount: 242 }] };
  else if (path.endsWith("/search")) data = { users: [other] };
  else if (path.endsWith("/follow")) { following = !following; data = { following }; }
  else if (path.endsWith("/comments")) data = { comments: [comment] };
  else if (path === "/posts/preview-post") data = { post };
  else if (path.endsWith("/posts")) data = { posts: [post] };
  else if (path.endsWith("/bookmarks")) data = { bookmarks: [post] };
  else if (path.endsWith("/notifications")) data = { notifications: [] };
  return { config, status: 200, statusText: "OK", headers: {}, data: { success: true, message: "Preview only", data, meta: { pagination: { currentPage: 1, nextPage: null } } } };
};
localStorage.setItem("user_token", "preview-only-token");
localStorage.setItem("user_info", JSON.stringify(me));
history.replaceState(null, "", "/");
const { default: App } = await import("../src/App");
createRoot(document.getElementById("root")!).render(<App />);
