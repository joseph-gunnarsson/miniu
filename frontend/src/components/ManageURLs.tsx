import { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";
import ErrorMessage from "./ErrorMessage";

interface URLItem {
  id: number;
  originalUrl: string;
  shortUrl: string;
}

function URLRow({
  url,
  isEditing,
  updatedPrefix,
  onEdit,
  onSave,
  onDelete,
  onCancel,
  onPrefixChange,
}: {
  url: URLItem;
  isEditing: boolean;
  updatedPrefix: string;
  onEdit: (id: number, currentPrefix: string) => void;
  onSave: (id: number) => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
  onPrefixChange: (prefix: string) => void;
}) {
  return (
    <tr className="hover:bg-black/20 h-12 text-nowrap">
      <td className="p-2">{url.originalUrl}</td>
      <td className="p-2">
        {isEditing ? (
          <div className="flex items-center">  
          <div>{import.meta.env.VITE_BACKEND}/</div>  
          <input
            type="text"
            value={updatedPrefix}
            onChange={(e) => onPrefixChange(e.target.value)}
            className="p-1 rounded-md text-black"
            placeholder="Enter new prefix"
          />
          </div>
        ) : (
          `${import.meta.env.VITE_BACKEND}/${url.shortUrl}`
        )}
      </td>
      <td className="p-2 h-12 flex justify-end items-center gap-2">
        {isEditing ? (
          <>
            <button
              onClick={() => onSave(url.id)}
              className="text-green-500 hover:text-green-600"
            >
              <FaSave />
            </button>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-600"
            >
              <FaTimes />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onEdit(url.id, url.shortUrl)}
              className="text-yellow-500 hover:text-yellow-600"
            >
              <FaEdit />
            </button>
            <button
              onClick={() => onDelete(url.shortUrl)}
              className="text-red-500 hover:text-red-600"
            >
              <FaTrash />
            </button>
          </>
        )}
      </td>
    </tr>
  );
}

export default function ManageURLs() {
  const [urls, setUrls] = useState<URLItem[]>([]);
  const [editingUrlId, setEditingUrlId] = useState<number | null>(null);
  const [updatedPrefix, setUpdatedPrefix] = useState<string>("");
  const [error, setError] = useState<string>("");
  
  useEffect(() => {
    const fetchURLs = async () => {
      try {
        const response = await fetch("/api/url/list/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch URLs");
        }
        const data = await response.json();
        setUrls(
          data.map((url: any) => ({
            id: url.id,
            originalUrl: url.original_url,
            shortUrl: url.short_url_prefix,
          }))
        );
        setError("");
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching URLs");
      }
    };

    fetchURLs();
  }, []);

  const handleDelete = async (shortUrl: string) => {
    try {
      const response = await fetch(`/api/url/${shortUrl}/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
  
      if (!response.ok) {
        throw new Error("Failed to delete the URL");
      }
      setUrls(urls.filter((url) => url.shortUrl !== shortUrl));
      setError("");
    } catch (err: any) {
      setError(err.message || "An error occurred while deleting the URL");
    }
  };
  
  const handleEdit = (id: number, currentPrefix: string) => {
    setEditingUrlId(id);
    setUpdatedPrefix(currentPrefix);
  };


  const handleSave = (id: number) => {
    const handleUpdate= async () => {
      try {
        const response = await fetch(`/api/url/update/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body:JSON.stringify({id:id,short_url_prefix:updatedPrefix})
        });
        console.log(updatedPrefix)
        if (!response.ok) {
          const data = await response.json()
          if (data.error == "Short URL prefix already exists")
            throw new Error(data.error);
          else
            throw new Error("Failed to update the URL");
        }
      setUrls(
        urls.map((url) =>
        url.id === id
          ? { ...url, shortUrl: `${updatedPrefix}` }
          : url
      )
      );
        setError("");
      } catch (err: any) {
        setError(err.message || "An error occurred while deleting the URL");
      }
    };

    handleUpdate()
    setEditingUrlId(null);
    setUpdatedPrefix("");
  };

  const handleCancel = () => {
    setEditingUrlId(null);
    setUpdatedPrefix("");
  };

  const handlePrefixChange = (prefix: string) => {
    setUpdatedPrefix(prefix);
  };

  return (
    <div className="flex flex-col justify-center items-center w-[90%] max-w-[99%] h-[100] grow">
            <ErrorMessage message={error} />

      <div className="bg-black overflow-x-auto scrollbar-thin shadow-inner text-sm bg-opacity-10 rounded-lg p-6 text-white w-full">
        <h1 className="text-center text-3xl mb-4">Manage Your URLs</h1>
        {urls.length > 0 ? (
          <table className="w-full table-auto text-left border-collapse">
            <thead>
              <tr>
                <th className="border-b p-2">Original URL</th>
                <th className="border-b p-2">Short URL</th>
                <th className="border-b p-2"></th>
              </tr>
            </thead>
            <tbody>
              {urls.map((url) => (
                <URLRow
                  key={url.id}
                  url={url}
                  isEditing={editingUrlId === url.id}
                  updatedPrefix={updatedPrefix}
                  onEdit={handleEdit}
                  onSave={handleSave}
                  onDelete={handleDelete}
                  onCancel={handleCancel}
                  onPrefixChange={handlePrefixChange}
                />
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-lg">No URLs found. Start adding some!</p>
        )}
      </div>
    </div>
  );
}
