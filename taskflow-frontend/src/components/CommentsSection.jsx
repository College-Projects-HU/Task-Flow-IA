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
  const canComment = user?.canComment ?? true;

  const canDelete = (comment) => {
    return comment.authorId === user?.id || user?.role === 'Admin' || user?.role === 'ProjectManager';
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
    <div className="taskdetail-section">
      <div className="taskdetail-section-header">
        <h3>Comments</h3>
      </div>

      {loading ? (
        <p className="taskdetail-comments-empty">Loading comments...</p>
      ) : (
        <>
          <div className="taskdetail-comments-list">
            {comments.length === 0 && (
              <p className="taskdetail-comments-empty">No comments yet</p>
            )}

            {comments.map((c) => (
              <article key={c.id} className="taskdetail-comment-card">
                <div className="taskdetail-comment-head">
                  <div>
                    <strong>{c.authorName}</strong>{" "}
                    <small>
                      {new Date(c.createdAt).toLocaleString()}
                    </small>
                  </div>

                  {canDelete(c) && (
                    <button
                      type="button"
                      className="taskdetail-comment-delete"
                      onClick={() => handleDelete(c.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>

                <p>{c.content}</p>
              </article>
            ))}

            <div ref={bottomRef}></div>
          </div>

          <div className={`taskdetail-comment-composer ${!canComment ? "permission-locked-panel" : ""}`}>
            <textarea
              className="taskdetail-comment-input permission-locked-control"
              rows="3"
              placeholder="Write a comment..."
              value={content}
              disabled={!canComment}
              onChange={(e) => setContent(e.target.value)}
            />

            <button
              type="button"
              className="taskdetail-comment-submit permission-locked-control"
              onClick={handleAdd}
              disabled={!canComment}
            >
              Add
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default CommentsSection;
