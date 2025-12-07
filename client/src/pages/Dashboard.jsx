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

        {showForm && (
          <EventForm onAdd={handleAddEvent} onCancel={() => setShowForm(false)} />
        )}

        {loading ? (
          <div className="text-center py-10">Loading events...</div>
        ) : (
          <EventList events={events} onDelete={handleDeleteEvent} onEdit={handleEditEvent} currentUser={user} />
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

