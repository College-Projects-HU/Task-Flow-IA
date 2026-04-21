import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProjectTasks } from "../services/api";
import CommentsSection from "../components/CommentsSection";

function TaskDetailPage() {
  const { taskId } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);

        // 🔥 مؤقت (لو معندكش API مباشر للتاسك)
        const tasks = await getProjectTasks(1);

        const found = tasks.find((t) => t.id == taskId);

        setTask(found);
      } catch (err) {
        console.error("Error loading task:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

  // ⏳ loading
  if (loading) return <p>Loading...</p>;

  // ❌ لو مش موجود
  if (!task) return <p>Task not found</p>;

  return (
    <div className="container mt-4">
      <h2>{task.title}</h2>
      <p>{task.description}</p>

      <hr />

      {/* 💬 Comments */}
      <CommentsSection taskId={taskId} />
    </div>
  );
}

export default TaskDetailPage;