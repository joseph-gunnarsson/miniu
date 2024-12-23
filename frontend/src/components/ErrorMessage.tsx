


interface ErrorMessageProps {
    message: string;
  }
  
  export default function ErrorMessage({ message }: ErrorMessageProps) {
    if (!message) return null; // If there's no message, render nothing
  
    return (
      <div className="bg-red-500 text-white p-2 rounded-md text-center mb-2">
        {message}
      </div>
    );
  }
  