import { useState } from 'react';

const EventForm = ({ onAdd, onCancel }) => {
  const [formData, setFormData] = useState({
    event: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    requiredItems: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAdd(formData);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-blue-100">
      <h3 className="text-lg font-bold mb-4 text-gray-800">Add New Event</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Event Title</label>
            <input type="text" name="event" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input type="date" name="date" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Time</label>
            <input type="time" name="startTime" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Time</label>
            <input type="time" name="endTime" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input type="text" name="location" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Required Items</label>
            <input type="text" name="requiredItems" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" onChange={handleChange} />
          </div>
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
          <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Create Event</button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;

