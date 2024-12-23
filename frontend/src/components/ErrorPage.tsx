import { useLocation, useNavigate } from "react-router";


export default function ErrorPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const isUnauthorized = location.pathname === "/unauthorized";

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate("/home");
  };

  return (
    <div className="flex justify-center items-center w-[900px] max-w-[99%] h-[100vh] grow">
      <div className="bg-black shadow-inner text-sm bg-opacity-10 rounded-lg p-6 text-white w-full max-w-md text-center">
        <h1 className="text-4xl font-bold mb-4">
          {isUnauthorized ? "Unauthorized Access" : "Page Not Found"}
        </h1>
        <p className="text-lg mb-6">
          {isUnauthorized
            ? "You don't have permission to access this page."
            : "The page you're looking for does not exist or has been moved."}
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={handleGoHome}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
          >
            Go to Home
          </button>
          <button
            onClick={handleGoBack}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}