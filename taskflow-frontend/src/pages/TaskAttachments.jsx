import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { uploadAttachment, getAttachments } from "../services/api";

const TaskAttachments = () => {
  const { taskId } = useParams();

  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [progress, setProgress] = useState(0);

  const fetchFiles = async () => {
    try {
      const data = await getAttachments(taskId);
      setFiles(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [taskId]);

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
      fetchFiles();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="container text-white py-4">
      <h2>📎 Task Attachments</h2>

      {/* Upload */}
      <div className="d-flex gap-2 mb-3">
        <input
          type="file"
          className="form-control"
          onChange={(e) => setSelectedFile(e.target.files[0])}
        />

        <button className="btn btn-light" onClick={handleUpload}>
          Upload
        </button>
      </div>

      {progress > 0 && (
        <p className="text-info">Uploading: {progress}%</p>
      )}

      {/* Files */}
      <ul className="list-group">
        {files.length === 0 && (
          <li className="list-group-item bg-dark text-white">
            No files uploaded yet
          </li>
        )}

        {files.map((file) => (
          <li
            key={file.id}
            className="list-group-item bg-dark text-white d-flex justify-content-between"
          >
            <span>
              {file.fileName} (
              {(file.fileSize / 1024).toFixed(1)} KB)
            </span>

            <a
             href={file.url}
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

export default TaskAttachments;