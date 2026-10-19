import { Link } from "react-router-dom";
export default function NotFound() {
  return (
    <section className="social-panel p-10 text-center">
      <p className="text-5xl font-extrabold text-primary">404</p>
      <h1 className="mt-4 text-xl font-bold">Page not found</h1>
      <p className="mt-2 text-sm text-slate-500">This page may have moved or no longer exists.</p>
      <Link to="/" className="mt-6 inline-block rounded-xl bg-primary px-5 py-2.5 font-bold text-white">Back to home</Link>
    </section>
  )
}
