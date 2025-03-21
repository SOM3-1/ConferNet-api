const axios = require("axios");

const API_URL = "http://localhost:5003/events"; 

const fetchAllEvents = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data.events || [];
    } catch (error) {
        console.error("Error fetching events:", error.response?.data || error.message);
        return [];
    }
};

const updateEvent = async (eventId) => {
    try {
        const updatedData = {
            name: `Updated Tech Conference ${Math.floor(Math.random() * 100)}`,
            description: "Updated description with more details about AI, Web3, and Blockchain.",
            registrationFee: Math.random() * (300 - 50) + 50, // New fee between $50-$300
        };

        const response = await axios.put(`${API_URL}/${eventId}`, updatedData);
        console.log(`Event Updated: ${eventId}`, updatedData);
    } catch (error) {
        console.error(`Error updating event ${eventId}:`, error.response?.data || error.message);
    }
};

const deleteEvent = async (eventId) => {
    try {
        await axios.delete(`${API_URL}/${eventId}`);
        console.log(`🗑️ Event Deleted: ${eventId}`);
    } catch (error) {
        console.error(`Error deleting event ${eventId}:`, error.response?.data || error.message);
    }
};

const testUpdateAndDelete = async () => {
    console.log("Fetching all events...");
    const events = await fetchAllEvents();

    if (events.length === 0) {
        console.log("No events found to update or delete.");
        return;
    }

    console.log(`Found ${events.length} events. Processing updates and deletions...`);

    const randomEvent = events[Math.floor(Math.random() * events.length)];
    await updateEvent(randomEvent.eventId);

    const eventsToDelete = events.slice(0, 3); 
    for (const event of eventsToDelete) {
        await deleteEvent(event.eventId);
    }

    console.log("Finished updating and deleting events!");
};

testUpdateAndDelete();
