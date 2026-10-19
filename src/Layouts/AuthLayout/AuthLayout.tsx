import { Outlet, Link } from "react-router-dom";
import BrandSection from "../../components/Auth/BrandSection/BrandSection";
import { useLocation } from "react-router-dom";

export default function AuthLayout() {
  const {pathname} = useLocation();
  const mode = pathname === "/auth/register" ? "/auth/register" : "/auth/login";



  return (
    <>
      
      <main className="min-h-screen flex items-center justify-center bg-primary-light px-4 py-8 sm:py-12">
      
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-center lg:gap-16">
        
        <BrandSection />

        <section className="w-full max-w-md">
          <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-sm">
            <div className="mb-5 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
              <Link
                to="/auth/login"
                
                className={`rounded-lg p-2 text-center text-sm font-extrabold transition ${
                  mode === "/auth/login"
                    ? "bg-white text-primary shadow-sm"
                    : "text-slate-600 hover:text-slate-600"
                }`}
              >
                Login
              </Link>
              <Link
                to="/auth/register"
                
                className={`rounded-lg p-2 text-center text-sm font-extrabold transition ${
                  mode === "/auth/register"
                    ? "bg-white text-primary shadow-sm"
                    : "text-slate-600 hover:text-slate-600"
                }`}
              >
                Register
              </Link>
            </div>
            
            <Outlet />
          </div>
        </section>

      </div>
      </main>
    </>
  );
}
