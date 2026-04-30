import { useEffect, useState } from "react";
import { API_ORIGIN, uploadAttachment, getAttachments } from "../services/api";

const FileAttachments = ({ taskId }) => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [progress, setProgress] = useState(0);

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
      fetchFiles(); // refresh list
    } catch (err) {
      console.log(err);
    }
  };

  const getFileName = (filePath) => {
    if (!filePath) {
      return "Attachment";
    }

    return filePath.split("/").pop();
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
          onChange={(e) => setSelectedFile(e.target.files[0])}
        />

        <button
          type="button"
          className="taskdetail-upload-btn"
          onClick={handleUpload}
          disabled={!selectedFile || progress > 0}
          style={{ opacity: (!selectedFile || progress > 0) ? 0.7 : 1, cursor: (!selectedFile || progress > 0) ? "not-allowed" : "pointer" }}
        >
          {progress > 0 ? `Uploading ${progress}%` : "Upload"}
        </button>
      </div>

      {progress > 0 && (
        <div style={{ width: "100%", backgroundColor: "#e4ecf8", height: "6px", borderRadius: "3px", margin: "1rem 0", overflow: "hidden" }}>
          <div style={{ width: `${progress}%`, backgroundColor: "#2968d8", height: "100%", borderRadius: "3px", transition: "width 0.2s ease-in-out" }}></div>
        </div>
      )}

      <ul className="taskdetail-file-list">
        {files.length === 0 && (
          <li className="taskdetail-file-empty">
            No attachments yet
          </li>
        )}

        {files.map((file) => (
          <li key={file.id} className="taskdetail-file-item">
            <span className="taskdetail-file-name">{getFileName(file.filePath)}</span>

            <a
              href={`${API_ORIGIN}/${file.filePath}`}
              target="_blank"
              rel="noreferrer"
              className="taskdetail-file-link"
            >
              Download
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileAttachments;
