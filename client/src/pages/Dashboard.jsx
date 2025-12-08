import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../hooks/useEvents';
import EventList from '../components/EventList';
import EventForm from '../components/EventForm';
import EditEventModal from '../components/EditEventModal';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { events, loading, addEvent, deleteEvent, updateEvent } = useEvents();
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const handleAddEvent = async (eventData) => {
    const result = await addEvent(eventData);
    if (result.success) {
      setShowForm(false);
    } else {
      alert(result.message);
    }
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
  };

  const handleUpdateEvent = async (eventId, eventData) => {
    const result = await updateEvent(eventId, eventData);
    if (result.success) {
      setEditingEvent(null);
    } else {
      alert(result.message || 'Failed to update event');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    const result = await deleteEvent(eventId);
    if (!result.success) {
      alert(result.message || 'Failed to delete event');
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    date: '',
    time: '',
    location: ''
  });

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch =
      event.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDate = filters.date ? event.date === filters.date : true;
    const matchesTime = filters.time ? event.startTime === filters.time : true;
    const matchesLocation = filters.location ? event.location.toLowerCase().includes(filters.location.toLowerCase()) : true;

    return matchesSearch && matchesDate && matchesTime && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-blue-600">Family Organiser</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Welcome, <b>{user.username}</b>
                <span className="ml-2 px-2 py-1 bg-gray-100 rounded text-sm">{user.familyName}</span>
              </span>
              <button onClick={logout} className="text-sm text-red-600 hover:text-red-800 font-medium">Logout</button>
            </div>
          </div>
          <div className="pb-3 text-sm text-gray-600">
            <span className="font-medium">Family Code (share to invite):</span>
            <code className="ml-2 px-2 py-1 bg-yellow-100 rounded font-mono text-yellow-800">{user.familyCode}</code>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Family Events</h2>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm transition-colors"
            >
              + Add Event
            </button>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="col-span-1 md:col-span-4">
              <input
                type="text"
                placeholder="Search events by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Filter by Date</label>
              <input
                type="date"
                name="date"
                value={filters.date}
                onChange={handleFilterChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Filter by Time</label>
              <input
                type="time"
                name="time"
                value={filters.time}
                onChange={handleFilterChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Filter by Location</label>
              <input
                type="text"
                name="location"
                placeholder="Location..."
                value={filters.location}
                onChange={handleFilterChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-sm"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilters({ date: '', time: '', location: '' });
                }}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {showForm && (
          <EventForm onAdd={handleAddEvent} onCancel={() => setShowForm(false)} />
        )}

        {loading ? (
          <div className="text-center py-10">Loading events...</div>
        ) : (
          <EventList events={filteredEvents} onDelete={handleDeleteEvent} onEdit={handleEditEvent} currentUser={user} />
        )}

        {editingEvent && (
          <EditEventModal
            event={editingEvent}
            onSave={handleUpdateEvent}
            onCancel={() => setEditingEvent(null)}
          />
        )}
      </main>
    </div>
  );
};

export default Dashboard;

