import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';


export const useEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchEvents = async () => {
    if (!user) return;
    try {
      const response = await api.post('/get-family-events', { familyId: user.familyId });
      setEvents(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching events:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchEvents();

    const socket = io(import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3002' : '/'));

    socket.emit('join_family', user.familyId);

    socket.on('refresh_events', () => {
      fetchEvents();
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const addEvent = async (eventData) => {
    try {
      const payload = {
        ...eventData,
        username: user.displayName,
        userfamily: user.familyId
      };
      await api.post('/new-event-entry', payload);
      return { success: true };
    } catch (error) {
      console.error("Error adding event:", error);
      return { success: false, message: error.response?.data?.msg || "Failed to add event" };
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      await api.post(`/delete-event/${eventId}`, {
        username: user.displayName,
        userfamily: user.familyId
      });
      await fetchEvents();
      return { success: true };
    } catch (error) {
      console.error("Error deleting event:", error);
      return { success: false, message: error.response?.data?.message || "Failed to delete event" };
    }
  };

  const updateEvent = async (eventId, eventData) => {
    try {
      const payload = {
        ...eventData,
        username: user.displayName,
        userfamily: user.familyId
      };
      await api.post(`/update-event/${eventId}`, payload);
      return { success: true };
    } catch (error) {
      console.error("Error updating event:", error);
      return { success: false, message: error.response?.data?.message || "Failed to update event" };
    }
  };

  return { events, loading, fetchEvents, addEvent, deleteEvent, updateEvent };
};

