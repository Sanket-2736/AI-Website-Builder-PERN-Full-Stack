import React, { useEffect, useState } from "react";
import { assets } from "../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import { authClient } from "../lib/auth-client";
import { UserButton } from "@daveyplate/better-auth-ui";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const {data : session, isPending} = authClient.useSession();
  return (
    <>
      <nav className="fixed top-0 left-0 z-50 flex w-full items-center justify-between border-b border-slate-800 bg-black/40 backdrop-blur px-4 py-4 text-white md:px-16 lg:px-24 xl:px-32">
        <Link to="/">
          <img src={assets.logo} alt="logo" className="h-5 sm:h-7" />
        </Link>

        {/* DESKTOP MENU */}
        <div className="hidden items-center gap-8 md:flex">
          <Link to="/">Products</Link>
          <Link to="/projects">My Projects</Link>
          <Link to="/community">Community</Link>
          <Link to="/pricing">Pricing</Link>
        </div>

        <div className="flex items-center gap-3">
        {isPending ? null : !session?.user ? (
          <button
            onClick={() => navigate("/auth/signin")}
            className="rounded bg-indigo-600 px-6 py-1.5 transition hover:bg-indigo-700 active:scale-95 max-sm:text-sm"
          >
            Get started
          </button>
        ) : (
          <UserButton size="icon" />
        )}
      </div>

      </nav>

      {/* MOBILE MENU */}
      <div
        className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 bg-black/70 text-lg text-white backdrop-blur transition-transform duration-300 md:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <Link to="/" onClick={() => setMenuOpen(false)}>
          Products
        </Link>
        <Link to="/projects" onClick={() => setMenuOpen(false)}>
          My Projects
        </Link>
        <Link to="/community" onClick={() => setMenuOpen(false)}>
          Community
        </Link>
        <Link to="/pricing" onClick={() => setMenuOpen(false)}>
          Pricing
        </Link>

        {/* CLOSE BUTTON */}
        <button
          className="flex size-10 items-center justify-center rounded-md bg-slate-100 p-1 text-black transition hover:bg-slate-200 active:ring-2 active:ring-white"
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>

      {/* BACKGROUND GRADIENT */}
      <img
        src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/refs/heads/main/assets/hero/bg-gradient-2.png"
        className="pointer-events-none fixed inset-0 -z-10 size-full opacity-60"
        alt=""
      />
    </>
  );
};

export default Navbar;
