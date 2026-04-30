import { useEffect, useState, useRef } from "react";
import {
  uploadAttachment,
  getAttachments,
  deleteAttachment,
} from "../services/api";

const FileAttachments = ({ taskId }) => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  // 📥 GET files
  const fetchFiles = async () => {
    try {
      const data = await getAttachments(taskId);
      setFiles(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (taskId) fetchFiles();
  }, [taskId]);

  // 📤 UPLOAD
  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      await uploadAttachment(taskId, formData, (event) => {
        const percent = Math.round((event.loaded * 100) / event.total);
        setProgress(percent);
      });

      setSelectedFile(null);
      setProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchFiles(); // refresh list
    } catch (err) {
      console.log(err);
      setProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const getFileName = (filePath) => {
    if (!filePath) {
      return "Attachment";
    }

    return filePath.split("/").pop();
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this attachment?"))
      return;
    try {
      await deleteAttachment(fileId);
      setFiles(files.filter((f) => f.id !== fileId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete attachment. You might not have permission.");
    }
  };

  return (
    <div className="taskdetail-section">
      <div className="taskdetail-section-header">
        <h3>Attachments</h3>
      </div>

      <div className="taskdetail-upload-row">
        <input
          type="file"
          className="taskdetail-file-input"
          ref={fileInputRef}
          onChange={(e) => setSelectedFile(e.target.files[0])}
        />

        <button
          type="button"
          className="taskdetail-upload-btn"
          onClick={handleUpload}
          disabled={!selectedFile || progress > 0}
          style={{
            opacity: !selectedFile || progress > 0 ? 0.7 : 1,
            cursor: !selectedFile || progress > 0 ? "not-allowed" : "pointer",
          }}
        >
          {progress > 0 ? `Uploading ${progress}%` : "Upload"}
        </button>
      </div>

      {progress > 0 && (
        <div
          style={{
            width: "100%",
            backgroundColor: "#e4ecf8",
            height: "6px",
            borderRadius: "3px",
            margin: "1rem 0",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              backgroundColor: "#2968d8",
              height: "100%",
              borderRadius: "3px",
              transition: "width 0.2s ease-in-out",
            }}
          ></div>
        </div>
      )}

      <ul className="taskdetail-file-list">
        {files.length === 0 && (
          <li className="taskdetail-file-empty">No attachments yet</li>
        )}

        {files.map((file) => (
          <li key={file.id} className="taskdetail-file-item">
            <span className="taskdetail-file-name">
              {file.fileName || getFileName(file.url)}
            </span>

            <a
              href={file.url}
              target="_blank"
              rel="noreferrer"
              download={file.fileName}
              className="taskdetail-file-link"
            >
              Download
            </a>

            <button
              type="button"
              onClick={() => handleDelete(file.id)}
              className="taskdetail-file-link"
              style={{
                color: "#ef4444",
                border: "1px solid #fecaca",
                backgroundColor: "transparent",
                marginLeft: "8px",
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileAttachments;
