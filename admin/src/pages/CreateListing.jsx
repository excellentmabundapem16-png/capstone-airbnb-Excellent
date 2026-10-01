/** CreateListing.jsx – wraps ListingForm for the create flow. */
import { useNavigate } from 'react-router-dom';
import ListingForm from '../components/ListingForm';

export default function CreateListing() {
  const navigate = useNavigate();
  return (
    <main className="admin-page">
      <div className="page-head"><h1>Create listing</h1></div>
      <ListingForm onSaved={() => navigate('/listings')} />
    </main>
  );
}
