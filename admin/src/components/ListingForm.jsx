/**
 * ListingForm.jsx – shared create/update form.
 * All fields from the brief (title, location, description, bedrooms,
 * bathrooms, guests, type, price, amenities, images, weekly discount,
 * cleaning fee, service fee, occupancy taxes) + robust validation with clear
 * inline error messages and image upload (Multer on the API).
 */
import { useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const TYPES = ['Entire apartment', 'Entire house', 'Private room', 'Shared room', 'Villa', 'Cabin', 'Loft', 'Studio'];
const AMENITIES = ['wifi', 'kitchen', 'free parking', 'pool', 'hot tub', 'air conditioning', 'workspace', 'gym', 'washer', 'breakfast'];

const NUM_FIELDS = ['price', 'guests', 'bedrooms', 'bathrooms', 'weeklyDiscount', 'cleaningFee', 'serviceFee', 'occupancyTaxes'];

const blank = {
  title: '', location: '', description: '', type: '', price: '', guests: '', bedrooms: '', bathrooms: '',
  weeklyDiscount: '0', cleaningFee: '0', serviceFee: '0', occupancyTaxes: '0',
  amenities: [], images: [], enhancedCleaning: false, selfCheckIn: false,
};

/** Convert a listing document into form state (strings for inputs). */
const toForm = (l) => ({
  title: l.title || '', location: l.location || '', description: l.description || '', type: l.type || '',
  price: String(l.price ?? ''), guests: String(l.guests ?? ''), bedrooms: String(l.bedrooms ?? ''), bathrooms: String(l.bathrooms ?? ''),
  weeklyDiscount: String(l.weeklyDiscount ?? 0), cleaningFee: String(l.cleaningFee ?? 0),
  serviceFee: String(l.serviceFee ?? 0), occupancyTaxes: String(l.occupancyTaxes ?? 0),
  amenities: l.amenities || [], images: l.images || [], enhancedCleaning: !!l.enhancedCleaning, selfCheckIn: !!l.selfCheckIn,
});

export default function ListingForm({ initial, existingId, onSaved }) {
  const { token } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState(initial ? toForm(initial) : blank);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const toggleAmenity = (a) =>
    setForm((f) => ({ ...f, amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a] }));

  const removeImage = (src) => setForm((f) => ({ ...f, images: f.images.filter((i) => i !== src) }));

  const onFiles = (e) => {
    const chosen = Array.from(e.target.files || []).slice(0, 6);
    setFiles(chosen);
    setPreviews(chosen.map((f) => URL.createObjectURL(f)));
  };

  /** Client-side validation with a message per field. */
  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.location.trim()) e.location = 'Location is required';
    if (!form.description.trim() || form.description.trim().length < 20) e.description = 'Description is required (min 20 characters)';
    if (!form.type) e.type = 'Select an accommodation type';
    if (form.price === '' || Number.isNaN(Number(form.price)) || Number(form.price) < 0) e.price = 'Price must be a number ≥ 0';
    ['guests', 'bedrooms', 'bathrooms'].forEach((k) => {
      if (form[k] === '' || !Number.isInteger(Number(form[k])) || Number(form[k]) < (k === 'guests' ? 1 : 0)) {
        e[k] = `${k.charAt(0).toUpperCase() + k.slice(1)} must be a whole number`;
      }
    });
    NUM_FIELDS.slice(4).forEach((k) => {
      if (form[k] === '' || Number.isNaN(Number(form[k])) || Number(form[k]) < 0) e[k] = 'Must be a number ≥ 0';
    });
    if (Number(form.weeklyDiscount) > 100) e.weeklyDiscount = 'Discount is a percentage (0–100)';
    if (form.amenities.length === 0) e.amenities = 'Select at least one amenity';
    if (form.images.length + files.length === 0) e.images = 'Add at least one image (upload or keep existing)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setServerError('');
    if (!validate()) {
      toast('Please fix the highlighted fields', 'error');
      return;
    }
    setBusy(true);
    try {
      const useMultipart = files.length > 0;
      let payload;
      if (useMultipart) {
        payload = new FormData();
        Object.entries(form).forEach(([k, v]) => {
          // images array is sent as a JSON string; files are appended below
          if (k === 'images') payload.append('images', JSON.stringify(form.images));
          // FIX: FormData turns an array into "wifi,kitchen,pool", which was saved
          // as ONE amenity. Appending each one separately gives the server a real array.
          else if (k === 'amenities') v.forEach((a) => payload.append('amenities', a));
          else payload.append(k, v);
        });
        files.forEach((f) => payload.append('images', f));
      } else {
        payload = { ...form, [ 'price']: Number(form.price), guests: Number(form.guests), bedrooms: Number(form.bedrooms), bathrooms: Number(form.bathrooms), weeklyDiscount: Number(form.weeklyDiscount), cleaningFee: Number(form.cleaningFee), serviceFee: Number(form.serviceFee), occupancyTaxes: Number(form.occupancyTaxes) };
      }
      const opts = useMultipart ? { method: existingId ? 'PUT' : 'POST', token, formData: payload } : { method: existingId ? 'PUT' : 'POST', token, body: payload };
      const saved = await api(existingId ? `/accommodations/${existingId}` : '/accommodations', opts);
      toast(existingId ? 'Listing updated successfully' : 'Listing created successfully');
      onSaved(saved);
    } catch (err) {
      setServerError(err.message);
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const field = (key, label, type = 'text', extra = {}) => (
    <label className={errors[key] ? 'field field-error' : 'field'}>
      <span>{label}</span>
      <input type={type} value={form[key]} onChange={set(key)} {...extra} />
      {errors[key] && <em className="field-msg">{errors[key]}</em>}
    </label>
  );

  return (
    <form className="listing-form" onSubmit={submit} noValidate>
      {serverError && <div className="banner banner-error">{serverError}</div>}

      <div className="form-grid">
        {field('title', 'Title *', 'text', { placeholder: 'Modern Apartment in New York' })}
        {field('location', 'Location *', 'text', { placeholder: 'New York', list: 'loc-suggestions' })}
        <datalist id="loc-suggestions">
          {['New York', 'Cape Town', 'Paris', 'Tokyo', 'Nairobi', 'Johannesburg'].map((l) => <option key={l} value={l} />)}
        </datalist>

        <label className={errors.type ? 'field field-error' : 'field'}>
          <span>Type *</span>
          <select value={form.type} onChange={set('type')}>
            <option value="">Select type…</option>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          {errors.type && <em className="field-msg">{errors.type}</em>}
        </label>

        {field('price', 'Price per night (R) *', 'number', { min: 0, step: '1' })}
        {field('guests', 'Guests *', 'number', { min: 1, step: '1' })}
        {field('bedrooms', 'Bedrooms *', 'number', { min: 0, step: '1' })}
        {field('bathrooms', 'Bathrooms *', 'number', { min: 0, step: '1' })}
        {field('weeklyDiscount', 'Weekly discount (%)', 'number', { min: 0, max: 100, step: '1' })}
        {field('cleaningFee', 'Cleaning fee (R)', 'number', { min: 0, step: '1' })}
        {field('serviceFee', 'Service fee (R)', 'number', { min: 0, step: '1' })}
        {field('occupancyTaxes', 'Occupancy taxes (R)', 'number', { min: 0, step: '1' })}
      </div>

      <label className={errors.description ? 'field field-error' : 'field'}>
        <span>Description *</span>
        <textarea rows={4} value={form.description} onChange={set('description')} placeholder="Describe the space, the neighbourhood, what makes it special…" />
        {errors.description && <em className="field-msg">{errors.description}</em>}
      </label>

      <fieldset className={errors.amenities ? 'field field-error' : 'field'}>
        <legend>Amenities *</legend>
        <div className="check-grid">
          {AMENITIES.map((a) => (
            <label key={a} className="check-item">
              <input type="checkbox" checked={form.amenities.includes(a)} onChange={() => toggleAmenity(a)} /> {a}
            </label>
          ))}
        </div>
        {errors.amenities && <em className="field-msg">{errors.amenities}</em>}
      </fieldset>

      <fieldset className={errors.images ? 'field field-error' : 'field'}>
        <legend>Images * (upload up to 6)</legend>
        <div className="img-previews">
          {form.images.map((src) => (
            <div className="img-thumb" key={src}>
              <img src={src} alt="listing" />
              <button type="button" className="img-remove" onClick={() => removeImage(src)} aria-label="Remove image">×</button>
            </div>
          ))}
          {previews.map((src, i) => (
            <div className="img-thumb" key={`new-${i}`}>
              <img src={src} alt="new upload" />
              <span className="img-new">new</span>
            </div>
          ))}
        </div>
        <input type="file" accept="image/*" multiple onChange={onFiles} />
        {errors.images && <em className="field-msg">{errors.images}</em>}
      </fieldset>

      <div className="check-row">
        <label className="check-item"><input type="checkbox" checked={form.enhancedCleaning} onChange={set('enhancedCleaning')} /> Enhanced cleaning</label>
        <label className="check-item"><input type="checkbox" checked={form.selfCheckIn} onChange={set('selfCheckIn')} /> Self check-in</label>
      </div>

      <div className="form-actions">
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : existingId ? 'Save changes' : 'Create listing'}</button>
      </div>
    </form>
  );
}
