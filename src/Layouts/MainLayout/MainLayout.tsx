import { Outlet } from "react-router-dom";
import Navbar from "../../components/Layout/Navbar/Navbar";
import Sidebar from "../../components/Layout/Sidebar/Sidebar";
import SuggestedFriends from "../../components/Layout/Sidebar/SuggestedFriends";

export default function MainLayout() {
  return <>
    <Navbar />
    <main className="mx-auto grid max-w-[1600px] grid-cols-1 items-start gap-5 px-3 py-6 sm:px-6 lg:grid-cols-[210px_minmax(0,1fr)] xl:grid-cols-[230px_minmax(0,1fr)_300px] xl:gap-6">
      <aside className="lg:sticky lg:top-24"><Sidebar /></aside>
      <div className="min-w-0"><Outlet /></div>
      <aside className="hidden xl:block"><SuggestedFriends /></aside>
    </main>
  </>;
}
