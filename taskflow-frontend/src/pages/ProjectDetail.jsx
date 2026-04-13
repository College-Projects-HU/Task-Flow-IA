import { useParams } from 'react-router-dom';

export default function ProjectDetail() {
  const { id } = useParams();

  return (
    <div className="container mt-5">
      <h2>Project Details</h2>
      <p>Viewing details for project ID: <strong>{id}</strong></p>
    </div>
  );
}
