import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProjectStats } from "../services/api";

function StatsPage() {
  const { id } = useParams();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getProjectStats(id);
        setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();
  }, [id]);

  if (!stats) return <p className="text-center mt-5">Loading...</p>;

  return (
    <div className="container mt-5">
      {/* 🔥 TITLE */}
      <h2 className="text-center mb-4">📊 Project Statistics</h2>

      {/* 🔥 STATS (تحت بعض) */}
      <div className="d-flex flex-column gap-3 mb-4">

        <div className="card shadow border-start border-4 border-primary p-3 text-center">
          <h6 className="text-muted">Total Tasks</h6>
          <h2 className="text-danger">{stats.totalTasks}</h2>
        </div>

        <div className="card shadow border-start border-4 border-success p-3 text-center">
          <h6 className="text-muted">Completed Tasks</h6>
          <h2 className="text-success">{stats.completedTasks}</h2>
        </div>

        <div className="card shadow border-start border-4 border-warning p-3 text-center">
          <h6 className="text-muted">In Progress Tasks</h6>
          <h2 className="text-warning">{stats.inProgressTasks}</h2>
        </div>

      </div>

      {/* 🔥 TABLE */}
      <div className="card shadow border-0">
        <div className="card-body">
          <h5 className="mb-3 text-center">👥 Team Performance</h5>

          <table className="table table-hover text-center align-middle">
            <thead className="table-dark">
              <tr>
                <th>Member</th>
                <th>Completed Tasks</th>
              </tr>
            </thead>

            <tbody>
              {stats.perMember && stats.perMember.length > 0 ? (
                stats.perMember.map((m, i) => (
                  <tr key={i}>
                    <td className="fw-semibold">{m.memberName}</td>

                    <td>
                      <span className="badge bg-success fs-6">
                        {m.completedTasks}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="text-muted">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StatsPage;