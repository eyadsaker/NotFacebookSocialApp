import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { api } from "../src/services/api";
import AuthProvider, { useAuth } from "../src/context/AuthContext";
import LoginForm from "../src/components/Auth/LoginForm/LoginForm";
import PostComposer from "../src/components/Posts/components/PostComposer";
import CommentForm from "../src/components/Posts/components/CommentForm";
import CommentItem from "../src/components/Posts/components/CommentItem";
import PostHeader from "../src/components/Posts/components/PostHeader";
import PostListing from "../src/components/Posts/PostListing";
import PostDetails from "../src/Pages/PostDetails/PostDetails";
import Profile from "../src/Pages/Profile/Profile";
import Settings from "../src/Pages/Settings/Settings";
import PostCard from "../src/components/Posts/components/PostCard";
import PostActions from "../src/components/Posts/components/PostActions";
import SuggestedFriends from "../src/components/Layout/Sidebar/SuggestedFriends";
import { toast } from "react-toastify";
import ProtectedRoutes from "../src/routing/ProtectedRoutes";
import ProtectedAuthRoutes from "../src/routing/ProtectedAuthRoutes";
import { getAllPosts } from "../src/services/post.service";
import { getSuggestions } from "../src/services/user.service";
import { formatDate } from "../src/utils/formatDate";
import type { Post } from "../src/interface/post";

const me = { _id: "user-1", name: "Eyad Saker", username: "eyad", photo: "", email: "eyad@example.test" };
const other = { _id: "user-2", name: "Other User", username: "other", photo: "" };
const comment = { _id: "comment-1", content: "A top comment", commentCreator: me, post: "post-1", likes: [], createdAt: new Date().toISOString() };
const post: Post = { _id: "post-1", id: "post-1", body: "A real post", user: me, privacy: "public", likes: [], likesCount: 0, commentsCount: 1, sharesCount: 0, bookmarked: false, isShare: false, createdAt: new Date().toISOString(), topComment: comment };
let requests: InternalAxiosRequestConfig[] = [];
let handler: (config: InternalAxiosRequestConfig) => unknown;

beforeEach(() => {
  requests = [];
  handler = (config) => {
    if (config.url === "/users/profile-data") return { user: me };
    if (config.url === "/posts") return { posts: [post] };
    if (config.url === "/posts/post-1") return { post };
    if (config.url === "/posts/post-1/comments") return { comments: [comment] };
    if (config.url === "/users/user-2/profile") return { user: other, isFollowing: false };
    if (config.url === "/users/user-2/posts") return { posts: [] };
    return {};
  };
  api.defaults.adapter = async (config) => {
    requests.push(config);
    return { data: { success: true, message: "Success", data: handler(config), meta: { pagination: { currentPage: 1, nextPage: null, numberOfPages: 1 } } }, status: 200, statusText: "OK", headers: {}, config };
  };
});

function mount(content: ReactNode, { signedIn = true, path = "/" } = {}) {
  if (signedIn) {
    localStorage.setItem("user_token", "test-token");
    localStorage.setItem("user_info", JSON.stringify(me));
  }
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity }, mutations: { retry: false } } });
  const result = render(<QueryClientProvider client={client}><AuthProvider><MemoryRouter initialEntries={[path]}>{content}</MemoryRouter></AuthProvider></QueryClientProvider>);
  return { ...result, client };
}

function SessionInfo() {
  const { user, isAuthenticated } = useAuth();
  return <p>{isAuthenticated ? user?.name : "Signed out"}</p>;
}

describe("authentication", () => {
  it("saves the token and user on login, then restores the user on refresh", async () => {
    handler = (config) => config.url === "/users/signin" ? { token: "new-token", user: me } : { user: me };
    const success = vi.spyOn(toast, "success");
    const view = mount(<><LoginForm /><SessionInfo /></>, { signedIn: false, path: "/auth/login" });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "eyad@example.test" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "Test123!demo" } });
    fireEvent.submit(screen.getByRole("button", { name: "Login" }).closest("form")!);
    await waitFor(() => expect(localStorage.getItem("user_token")).toBe("new-token"));
    expect(JSON.parse(localStorage.getItem("user_info")!)._id).toBe(me._id);
    expect(success).not.toHaveBeenCalled();
    view.unmount();
    mount(<SessionInfo />, { signedIn: false });
    expect(screen.getByText("Eyad Saker")).toBeTruthy();
  });
  it("does not loop between protected and auth routes when signed out", async () => {
    mount(<Routes><Route element={<ProtectedRoutes />}><Route path="/" element={<p>Feed</p>} /></Route><Route element={<ProtectedAuthRoutes />}><Route path="/auth/login" element={<p>Login screen</p>} /></Route></Routes>, { signedIn: false });
    expect(await screen.findByText("Login screen")).toBeTruthy();
  });
  it("re-enables the login button after a network failure", async () => {
    const attempt = vi.fn(async () => { throw new AxiosError("Network Error", "ERR_NETWORK"); });
    api.defaults.adapter = attempt;
    mount(<LoginForm />, { signedIn: false });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "eyad@example.test" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "Test123!demo" } });
    fireEvent.submit(screen.getByRole("button", { name: "Login" }).closest("form")!);
    await waitFor(() => expect(attempt).toHaveBeenCalled());
    await waitFor(() => expect((screen.getByRole("button", { name: "Login" }) as HTMLButtonElement).disabled).toBe(false));
    expect(localStorage.getItem("user_token")).toBeNull();
  });
});

describe("posts and comments", () => {
  it("deletes a post only after its owner confirms", async () => {
    mount(<PostCard post={post} />);
    await userEvent.click(screen.getByRole("button", { name: "Post options" }));
    await userEvent.click(screen.getByText("Delete post"));
    expect(requests.some((r) => r.method === "delete")).toBe(false);
    await userEvent.click(screen.getByRole("button", { name: "Delete post" }));
    await waitFor(() => expect(requests.some((r) => r.method === "delete" && r.url === "/posts/post-1")).toBe(true));
  });
  it("sends likes and shares to the selected post", async () => {
    const success = vi.spyOn(toast, "success");
    mount(<PostActions post={post} />);
    await userEvent.click(screen.getByRole("button", { name: "Like" }));
    await waitFor(() => expect(requests.some((r) => r.method === "put" && r.url === "/posts/post-1/like")).toBe(true));
    await userEvent.click(screen.getByRole("button", { name: "Share" }));
    await waitFor(() => expect(requests.some((r) => r.method === "post" && r.url === "/posts/post-1/share")).toBe(true));
    expect(success).not.toHaveBeenCalled();
  });
  it("publishes a post with multipart data and invalidates feeds", async () => {
    const { client } = mount(<PostComposer />);
    const invalidate = vi.spyOn(client, "invalidateQueries");
    fireEvent.change(screen.getByLabelText("Post text"), { target: { value: "A new post" } });
    fireEvent.submit(screen.getByLabelText("Post text").closest("form")!);
    await waitFor(() => expect(requests.some((r) => r.method === "post" && r.url === "/posts")).toBe(true));
    const request = requests.find((r) => r.method === "post" && r.url === "/posts")!;
    expect((request.data as FormData).get("body")).toBe("A new post");
    expect(request.headers.Authorization).toBe("Bearer test-token");
    await waitFor(() => expect(invalidate).toHaveBeenCalledWith({ queryKey: ["posts"] }));
  });
  it("updates the existing post instead of creating a second one", async () => {
    const done = vi.fn();
    mount(<PostComposer post={post} onDone={done} />);
    fireEvent.change(screen.getByLabelText("Post text"), { target: { value: "Updated post" } });
    fireEvent.submit(screen.getByLabelText("Post text").closest("form")!);
    await waitFor(() => expect(done).toHaveBeenCalled());
    expect(requests.find((r) => r.method === "put")?.url).toBe("/posts/post-1");
  });
  it("creates comments on the correct post and clears the form", async () => {
    mount(<CommentForm postId="post-1" />);
    fireEvent.change(screen.getByLabelText("Write a comment"), { target: { value: "New comment" } });
    fireEvent.submit(screen.getByLabelText("Write a comment").closest("form")!);
    await waitFor(() => expect(requests.some((r) => r.method === "post" && r.url === "/posts/post-1/comments")).toBe(true));
    expect((requests.find((r) => r.method === "post")!.data as FormData).get("content")).toBe("New comment");
    await waitFor(() => expect((screen.getByLabelText("Write a comment") as HTMLInputElement).value).toBe(""));
  });
  it("allows comment owner editing and confirms deletion before sending DELETE", async () => {
    mount(<CommentItem comment={comment} postId="post-1" postOwnerId="user-2" />);
    await userEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByLabelText("Edit comment"), { target: { value: "Edited comment" } });
    fireEvent.submit(screen.getByLabelText("Edit comment").closest("form")!);
    await waitFor(() => expect(requests.some((r) => r.method === "put" && r.url === "/posts/post-1/comments/comment-1")).toBe(true));
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(requests.some((r) => r.method === "delete")).toBe(false);
    await userEvent.click(screen.getAllByRole("button", { name: "Delete" })[1]);
    await waitFor(() => expect(requests.some((r) => r.method === "delete")).toBe(true));
  });
  it("hides comment editing and deletion from unrelated users", () => {
    mount(<CommentItem comment={{ ...comment, commentCreator: other }} postId="post-1" postOwnerId="user-2" />);
    expect(screen.queryByRole("button", { name: "Edit" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Delete" })).toBeNull();
  });
  it("hides post edit/delete options for someone else's post", async () => {
    mount(<PostHeader post={{ ...post, user: other }} onEdit={vi.fn()} onDelete={vi.fn()} onBookmark={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "Post options" }));
    expect(screen.queryByText("Edit post")).toBeNull();
    expect(screen.queryByText("Delete post")).toBeNull();
    expect(screen.getByText("Save post")).toBeTruthy();
  });
  it("renders the top comment in the feed", async () => {
    mount(<PostListing />);
    expect(await screen.findByText("A top comment")).toBeTruthy();
    expect(screen.getByText("Top comment")).toBeTruthy();
  });
  it("fetches the selected post's comments in the details route", async () => {
    mount(<Routes><Route path="/post/:postId" element={<PostDetails />} /></Routes>, { path: "/post/post-1" });
    expect(await screen.findByText("A top comment")).toBeTruthy();
    expect(requests.some((r) => r.url === "/posts/post-1/comments" && r.params.page === 1)).toBe(true);
  });
});

describe("profile and response contracts", () => {
  it("uploads profile and cover images from the owner's profile", async () => {
    mount(<Routes><Route path="/profile" element={<Profile />} /></Routes>, { path: "/profile" });
    const person = userEvent.setup();
    const image = new File(["image"], "avatar.png", { type: "image/png" });
    await person.upload(await screen.findByLabelText("Change profile photo"), image);
    await waitFor(() => expect(requests.some((request) => request.url === "/users/upload-photo" && request.method === "put")).toBe(true));
    const photoRequest = requests.find((request) => request.url === "/users/upload-photo")!;
    expect((photoRequest.data as FormData).get("photo")).toBe(image);
    await person.upload(screen.getByLabelText("Change cover photo"), image);
    await waitFor(() => expect(requests.some((request) => request.url === "/users/upload-cover" && request.method === "put")).toBe(true));
    const coverRequest = requests.find((request) => request.url === "/users/upload-cover")!;
    expect((coverRequest.data as FormData).get("cover")).toBe(image);
  });
  it("updates the sidebar follow button without a success toast", async () => {
    handler = (config) => config.url === "/users/suggestions" ? { suggestions: [other] } : config.url === "/users/user-2/follow" ? { following: true } : { user: me };
    const success = vi.spyOn(toast, "success");
    mount(<SuggestedFriends />);
    await userEvent.click(await screen.findByRole("button", { name: "Follow" }));
    expect(await screen.findByRole("button", { name: "Following" })).toBeTruthy();
    expect(success).not.toHaveBeenCalled();
  });
  it("uses the profile route parameter for profile and posts", async () => {
    mount(<Routes><Route path="/profile/:userId" element={<Profile />} /></Routes>, { path: "/profile/user-2" });
    expect(await screen.findByText("Other User")).toBeTruthy();
    await waitFor(() => expect(requests.some((r) => r.url === "/users/user-2/posts")).toBe(true));
    expect(screen.queryByText("Settings")).toBeNull();
  });
  it("reads suggestions and bookmarks from their documented envelope keys", async () => {
    handler = (config) => config.url === "/users/suggestions" ? { suggestions: [other] } : { bookmarks: [post] };
    expect((await getSuggestions()).data.users[0]._id).toBe("user-2");
    expect((await getAllPosts(1, undefined, true)).data.posts[0]._id).toBe("post-1");
  });
  it("rotates the saved token after changing password", async () => {
    handler = (config) => config.url === "/users/change-password" ? { token: "rotated-token" } : { user: me };
    mount(<Settings />);
    fireEvent.change(screen.getByLabelText("Current password"), { target: { value: "OldPassword123!" } });
    fireEvent.change(screen.getByLabelText("New password"), { target: { value: "NewPassword123!" } });
    fireEvent.change(screen.getByLabelText("Confirm new password"), { target: { value: "NewPassword123!" } });
    fireEvent.submit(screen.getByRole("button", { name: "Update password" }).closest("form")!);
    await waitFor(() => expect(localStorage.getItem("user_token")).toBe("rotated-token"));
  });
  it("formats valid dates and safely handles invalid values", () => {
    expect(formatDate("not-a-date")).toBe("");
    expect(formatDate(new Date().toISOString())).toBe("Just now");
  });
});
