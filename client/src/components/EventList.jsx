import { format } from 'date-fns';

const EventList = ({ events, onDelete, onEdit, currentUser }) => {
  if (events.length === 0) {
    return <div className="text-center text-gray-500 py-8">No events found. Add one to get started!</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <div key={event._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800">{event.event}</h3>
              <span className="text-sm text-gray-500">{format(new Date(event.date), 'MMMM do, yyyy')}</span>
            </div>
            {currentUser.displayName === event.organiser && (
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(event)}
                  className="text-blue-500 hover:text-blue-700 text-sm font-semibold"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(event._id)}
                  className="text-red-500 hover:text-red-700 text-sm font-semibold"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2 text-gray-600">
            <p className="flex items-center">
              <span className="font-semibold w-20">Time:</span>
              {event.startTime} - {event.endTime}
            </p>
            <p className="flex items-center">
              <span className="font-semibold w-20">Location:</span>
              {event.location}
            </p>
            <p className="flex items-center">
              <span className="font-semibold w-20">Items:</span>
              {event.requiredItems}
            </p>
            <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400 flex justify-between">
              <span>Organiser: {event.organiser}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventList;

