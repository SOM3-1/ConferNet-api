const axios = require("axios");

const API_URL = "http://localhost:5003/events"; 

const fetchAllEvents = async () => {
    try {
        const response = await axios.get(API_URL);
        const events = response.data.events || [];
        console.log(`Found ${events.length} events.`);
        return events;
    } catch (error) {
        console.error("Error fetching all events:", error.response?.data || error.message);
        return [];
    }
};

const fetchSingleEvent = async (eventId) => {
    try {
        const response = await axios.get(`${API_URL}/${eventId}`);
        console.log(`Event Retrieved: ${response.data.name}`);
        console.log(response.data);
    } catch (error) {
        console.error(`Error fetching event ${eventId}:`, error.response?.data || error.message);
    }
};

const testFetchingEvents = async () => {
    console.log("Fetching all events...");
    const events = await fetchAllEvents();

    if (events.length === 0) {
        console.log("No events found.");
        return;
    }

    const randomEvent = events[Math.floor(Math.random() * events.length)];
    console.log(`Fetching single event: ${randomEvent.eventId}`);
    await fetchSingleEvent(randomEvent.eventId);

    console.log("Finished fetching events!");
};

testFetchingEvents();
