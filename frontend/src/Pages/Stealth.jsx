import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Image as ImageIcon, Trash2 } from "lucide-react";

// Simple UI components with orange theme
const Button = ({ children, className = "", ...props }) => (
  <button
    className={
      "px-4 py-2 rounded bg-orange-500 text-white hover:bg-orange-600 transition font-semibold shadow " +
      className
    }
    {...props}
  >
    {children}
  </button>
);

const Input = React.forwardRef(({ className = "", ...props }, ref) => (
  <input
    ref={ref}
    className={
      "border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-orange-400 bg-orange-50 " +
      className
    }
    {...props}
  />
));

const Card = ({ children, className = "" }) => (
  <div
    className={
      "bg-white rounded-xl shadow-lg border border-orange-200 " + className
    }
  >
    {children}
  </div>
);

const CardContent = ({ children, className = "" }) => (
  <div className={"p-8 " + className}>{children}</div>
);

const Modal = ({ open, onClose, children }) =>
  open ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg p-6 min-w-[320px] max-w-sm border-2 border-orange-300">
        {children}
        <div className="mt-4 text-right">
          <Button
            className="bg-orange-200 text-orange-900 hover:bg-orange-300"
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  ) : null;

// Cloudinary config from .env
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

const Stealth = () => {
  const [display, setDisplay] = useState("");
  const [secretMode, setSecretMode] = useState(false);
  const [images, setImages] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!secretMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [secretMode]);

  useEffect(() => {
    if (!secretMode) return;
    const handlePopState = () => {
      window.location.href = "https://en.wikipedia.org/wiki/Special:Random";
    };
    window.addEventListener("popstate", handlePopState);
    window.history.pushState({ stealth: true }, "");
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [secretMode]);

  const handleInputChange = (e) => setDisplay(e.target.value);

  const handleInputKeyDown = (e) => {
    if (
      (display.length >= 3 && (display + e.key).slice(-4) === "####") ||
      (e.key === "Enter" && display.slice(-4) === "####")
    ) {
      setSecretMode(true);
      setDisplay("");
      e.preventDefault();
      return;
    }
    if (
      !(
        /[0-9+\-*/.=C#]/.test(e.key) ||
        e.key === "Backspace" ||
        e.key === "Enter"
      )
    ) {
      e.preventDefault();
    }
  };

  const handleButtonClick = (val) => {
    if (display.length >= 3 && (display + val).slice(-4) === "####") {
      setSecretMode(true);
      setDisplay("");
      return;
    }
    if (val === "=") {
      try {
        // eslint-disable-next-line no-eval
        setDisplay(eval(display).toString());
      } catch {
        setDisplay("Error");
      }
    } else if (val === "C") {
      setDisplay("");
    } else {
      setDisplay(display + val);
    }
  };

  // Open system file picker directly
  const handleUploadClick = () => {
    setUploadError("");
    setSelectedFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  // Cloudinary image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFileName(file.name);
    setUploading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (data.secure_url) {
        setImages((prev) => [data.secure_url, ...prev]);
        setShowUploadModal(false);
      } else {
        setUploadError("Upload failed. Check your Cloudinary config.");
      }
    } catch (err) {
      setUploadError("Upload failed. Try again.");
    }
    setUploading(false);
  };

  const handleDeleteImage = (url) => {
    setImages(images.filter((img) => img !== url));
  };

  const buttons = [
    "7",
    "8",
    "9",
    "/",
    "4",
    "5",
    "6",
    "*",
    "1",
    "2",
    "3",
    "-",
    "0",
    ".",
    "=",
    "+",
    "C",
  ];

  // Helper to truncate file name
  const truncateFileName = (name, max = 18) =>
    name.length > max ? name.slice(0, max) + "..." : name;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      {!secretMode ? (
        <Card className="w-[340px]">
          <CardContent>
            <div className="mb-4 text-center">
              <h2 className="text-2xl font-bold text-orange-700 mb-1">
                Stealth Calculator
              </h2>
              <p className="text-xs text-orange-500">
                Enter{" "}
                <span className="font-mono bg-orange-100 px-1 rounded">
                  ####
                </span>{" "}
                to unlock secret mode
              </p>
            </div>
            <Input
              ref={inputRef}
              className="mb-4 text-right font-mono text-xl bg-white"
              value={display}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              autoFocus
              placeholder="0"
            />
            <div className="grid grid-cols-4 gap-2">
              {buttons.map((btn) => (
                <Button
                  key={btn}
                  className="h-12 text-lg"
                  onClick={() => handleButtonClick(btn)}
                >
                  {btn}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-2xl">
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-orange-700">
                Your Secret Files
              </h2>
              <Button
                className="bg-orange-200 text-orange-900 hover:bg-orange-300"
                onClick={() => navigate("/dashboard/user")}
              >
                Exit Stealth Mode
              </Button>
            </div>
            <div className="flex gap-4 mb-8">
              <Button
                className="bg-orange-600 hover:bg-orange-700 flex items-center"
                onClick={handleUploadClick}
                disabled={uploading}
              >
                <Plus className="w-4 h-4 mr-1" /> Upload Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3 text-orange-700">
                Files
              </h3>
              {images.length === 0 ? (
                <div className="text-orange-400 text-center py-8">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                  <div>No photos uploaded yet.</div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {images.map((url, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={url}
                        alt="Uploaded"
                        className="rounded-lg shadow border border-orange-200 object-cover w-full h-40"
                      />
                      <button
                        className="absolute top-2 right-2 bg-orange-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        onClick={() => handleDeleteImage(url)}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Upload status and file name */}
            {uploading && (
              <div className="text-orange-600 text-sm mt-4">Uploading...</div>
            )}
            {uploadError && (
              <div className="text-red-600 text-sm mt-2">{uploadError}</div>
            )}
            {selectedFileName && (
              <div className="text-xs text-orange-700 mt-2">
                {truncateFileName(selectedFileName)}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Stealth;
