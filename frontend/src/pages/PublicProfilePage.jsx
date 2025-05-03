import { useParams } from 'react-router-dom';
import PublicProfileCard from '../components/PublicProfileCard';
import Navbar from '../components/Navbar';

function PublicProfilePage() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <PublicProfileCard userId={id} />
    </div>
  );
}

export default PublicProfilePage;
