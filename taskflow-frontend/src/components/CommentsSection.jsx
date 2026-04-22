import { useEffect, useState, useRef, useContext } from "react";
import {
  getComments,
  addComment,
  deleteComment,
} from "../services/api";
import { AuthContext } from "../context/AuthContext";

function CommentsSection({ taskId }) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  const bottomRef = useRef(null);
  const { user } = useContext(AuthContext);

  const normalize = (str) => str?.toLowerCase().trim();

  const isOwner = (authorName) => {
    return normalize(authorName)?.includes(normalize(user?.name));
  };

  const loadComments = async () => {
    try {
      const res = await getComments(taskId);
      setComments(res.data);
    } catch (err) {
      console.error("Error loading comments:", err);
    }
  };

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const res = await getComments(taskId);
        setComments(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [taskId]);

  const handleAdd = async () => {
    if (!content.trim()) {
      alert("Write something first");
      return;
    }

    try {
      await addComment(taskId, { content });

      setContent("");
      await loadComments();

      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      console.error("Add comment error:", err.response || err);
      alert("Error adding comment");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteComment(id);
      await loadComments();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="mt-4">
      <h4>💬 Comments</h4>

      {loading ? (
        <p>Loading comments...</p>
      ) : (
        <>
          <div
            style={{
              maxHeight: "350px",
              overflowY: "auto",
              border: "1px solid #ddd",
              padding: "10px",
              borderRadius: "10px",
            }}
          >
            {comments.length === 0 && <p>No comments yet</p>}

            {comments.map((c) => (
              <div
                key={c.id}
                className="mb-3 p-2 rounded"
                style={{ background: "#f8f9fa" }}
              >
                <div className="d-flex justify-content-between">
                  <div>
                    <strong>{c.authorName}</strong>{" "}
                    <small className="text-muted">
                      {new Date(c.createdAt).toLocaleString()}
                    </small>
                  </div>

                  {/* ✅ DELETE BUTTON */}
                  {isOwner(c.authorName) && (
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(c.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>

                <p className="mt-2 mb-0">{c.content}</p>
              </div>
            ))}

            <div ref={bottomRef}></div>
          </div>

          <div className="mt-3 d-flex gap-2">
            <textarea
              className="form-control"
              rows="2"
              placeholder="Write a comment..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            <button className="btn btn-success" onClick={handleAdd}>
              Add
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default CommentsSection;