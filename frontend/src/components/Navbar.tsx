import { FaAlignJustify } from "react-icons/fa";
import { useEffect, useState, useContext } from "react";
import { NavLink } from "react-router";
import { AuthContext } from "../app/App";

export default function Navbar() {
  const [hideNavDropMenu, setHideNavDropMenu] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { isAuthenticated, logout } = useContext(AuthContext);

  const NAVBAR_LINKS = [
    { href: "/home", label: "Home" },
    ...(isAuthenticated
      ? [
          { href: "/manage-urls", label: "Manage URLs" },
          { href: "/add-url", label: "Add URL" },
        ]
      : []),
  ];

  async function handleLogout() {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false); 
  }

  function NavLinks() {
    return (
      <ul className="hidden list-none gap-6 sm:flex">
        {NAVBAR_LINKS.map((link) => (
          <li key={link.href}>
            <NavLink to={link.href} className="hover:text-slate-400">
              {link.label}
            </NavLink>
          </li>
        ))}
        {isAuthenticated && (
          <li>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={`hover:text-slate-400 ${
                isLoggingOut ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </li>
        )}
        {!isAuthenticated && (
          <li>
            <NavLink to="/login" className="hover:text-slate-400">
              Login
            </NavLink>
          </li>
        )}
      </ul>
    );
  }

  function MobileNavLinks({ hidden }: { hidden: boolean }) {
    return (
      <div>
        <ul className={`overflow-hidden ${hidden ? "h-0" : "h-auto"}`}>
          {NAVBAR_LINKS.map((link) => (
            <li key={link.href} className="py-1">
              <NavLink to={link.href} className="hover:text-slate-400">
                {link.label}
              </NavLink>
            </li>
          ))}
          {isAuthenticated && (
            <li className="py-1">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={`hover:text-slate-400 ${
                  isLoggingOut ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </li>
          )}
          {!isAuthenticated && (
            <li className="py-1">
              <NavLink to="/login" className="hover:text-slate-400">
                Login
              </NavLink>
            </li>
          )}
        </ul>
      </div>
    );
  }

  useEffect(() => {
    const handleResize = () => setHideNavDropMenu(true);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <nav className="justify-center flex w-full">
      <div
        className={`bg-red-50 w-[1000px] delay-75 overflow-y-hidden max-w-[98%] transition-[height] duration-700 rounded-full px-2 flex flex-col
        ${
          hideNavDropMenu
            ? "rounded-full h-8 justify-center"
            : "rounded-md h-36 justify-start"
        }
        `}
      >
        <div className="justify-between flex items-center">
          <h1 className="text-xl font-bold">Miniu</h1>

          <NavLinks />

          <span className="sm:hidden">
            <FaAlignJustify
              className="cursor-pointer"
              onClick={() => setHideNavDropMenu(!hideNavDropMenu)}
            />
          </span>
        </div>

        <MobileNavLinks hidden={hideNavDropMenu} />
      </div>
    </nav>
  );
}
