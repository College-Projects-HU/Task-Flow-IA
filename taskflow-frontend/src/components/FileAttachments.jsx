import { useEffect, useState } from "react";
import { uploadAttachment, getAttachments } from "../services/api";

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

  return (
    <div className="mt-3">
      <h6>📎 Attachments</h6>

      {/* Upload Section */}
      <div className="d-flex gap-2 mb-2">
        <input
          type="file"
          className="form-control form-control-sm"
          onChange={(e) => setSelectedFile(e.target.files[0])}
        />

        <button
          className="btn btn-sm btn-light"
          onClick={handleUpload}
        >
          Upload
        </button>
      </div>

      {/* Progress */}
      {progress > 0 && (
        <small className="text-info">
          Uploading: {progress}%
        </small>
      )}

      {/* Files List */}
      <ul className="list-group mt-2">
        {files.length === 0 && (
          <li className="list-group-item bg-dark text-white border-secondary">
            No attachments yet
          </li>
        )}

        {files.map((file) => (
          <li
            key={file.id}
            className="list-group-item bg-dark text-white border-secondary d-flex justify-content-between align-items-center"
          >
            <span>
              {file.fileName} (
              {(file.fileSize / 1024).toFixed(1)} KB)
            </span>

            <a
              href={`http://localhost:5218/${file.filePath}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-sm btn-outline-light"
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