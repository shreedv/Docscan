import { Link, useLocation } from "wouter";
import { Bell } from "lucide-react";

const Header = () => {
  const [location] = useLocation();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <svg className="h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="ml-2 text-xl font-semibold text-gray-900">DocuExtract</span>
          </div>
          <nav className="hidden md:flex space-x-8">
            <Link href="/">
              <span className={`font-medium cursor-pointer ${location === "/" ? "text-primary" : "text-gray-500 hover:text-gray-900"}`}>
                Extract
              </span>
            </Link>
            <Link href="/history">
              <span className={`font-medium cursor-pointer ${location === "/history" ? "text-primary" : "text-gray-500 hover:text-gray-900"}`}>
                History
              </span>
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <button type="button" className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              <span className="sr-only">View notifications</span>
              <Bell className="h-6 w-6" />
            </button>
            <div className="relative">
              <button type="button" className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                <span className="sr-only">Open user menu</span>
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                  JD
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
