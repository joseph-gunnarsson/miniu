import { useState } from "react";
import ErrorMessage from "./ErrorMessage";

export default function AddURL() {
  const [url, setUrl] = useState<string>("");
  const [customShortUrl, setCustomShortUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url) {
      alert("Please enter a valid URL.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/url/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          original_url: url,
          short_url_prefix: customShortUrl || "",
        }),
      });

      if (response.ok) {
        window.location.href = "/home"
      } else {
        const errorData = await response.json();
        console.error(errorData.message)
        throw new Error();
      }
    } catch (err) {
      setError("Failed to shorten URL.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center w-[900px] max-w-[99%] h-[100] grow">
      <ErrorMessage message={error}/>
      <div className="bg-black shadow-inner text-sm bg-opacity-10 rounded-lg p-4 text-white w-full max-w-md">
        <h1 className="text-center text-3xl mb-4">Add a New URL</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="url" className="block text-lg mb-1">
              URL
            </label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full p-2 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter the full URL (e.g., https://example.com)"
              required
            />
          </div>
          <div>
            <label htmlFor="customShortUrl" className="block text-lg mb-1">
              Custom Short URL Prefix (Optional)
            </label>
            <input
              id="customShortUrl"
              type="text"
              value={customShortUrl}
              onChange={(e) => setCustomShortUrl(e.target.value)}
              className="w-full p-2 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter a custom prefix (e.g., my-url)"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full ${
              loading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
            } text-white p-2 rounded-md text-lg`}
          >
            {loading ? "Shortening..." : "Shorten URL"}
          </button>
        </form>
      </div>
    </div>
  );
}
