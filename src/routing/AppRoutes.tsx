import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../Layouts/MainLayout/MainLayout";
import Feed from "../Pages/Feed/Feed";
import Profile from "../Pages/Profile/Profile";
import NotFound from "../Pages/NotFound/NotFound";
import AuthLayout from "../Layouts/AuthLayout/AuthLayout";
import Login from "../Pages/Auth/Login/Login";
import Register from "../Pages/Auth/Register/Register";
import ProtectedRoutes from "./ProtectedRoutes";
import ProtectedAuthRoutes from "./ProtectedAuthRoutes";
import PostDetails from "../Pages/PostDetails/PostDetails";
import Settings from "../Pages/Settings/Settings";
import Notifications from "../Pages/Notifications/Notifications";

export const router = createBrowserRouter([
  {
    element: <ProtectedRoutes />,
    children: [
      {
        path: "/",
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <Feed />,
          },
          {
            path: "feed",
            element: <Feed />,
          },
          {
            path: "profile",
            element: <Profile />,
          },
          { path: "profile/:userId", element: <Profile /> },
          { path: "post/:postId", element: <PostDetails /> },
          { path: "settings", element: <Settings /> },
          { path: "notifications", element: <Notifications /> },
          { path: "community", element: <Feed /> },
          { path: "saved", element: <Feed /> },
          {
            path: "*",
            element: <NotFound />,
          },
        ],
      },
    ],
  },

  {
    element: <ProtectedAuthRoutes />,
    children: [
      {
        path: "auth",
        element: <AuthLayout />,
        children: [
          {
            index: true,
            element: <Login />,
          },
          {
            path: "login",
            element: <Login />,
          },
          {
            path: "register",
            element: <Register />,
          },
          {
            path: "*",
            element: <NotFound />,
          },
        ],
      },
    ],
  },
]);
