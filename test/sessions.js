const axios = require("axios");

const API_URL = "http://localhost:5003/users"; 

const TEST_USER_ID = "attendee5"; 
const TEST_EVENT_ID = "3fA5Zy9epoD0KlPcIzN6";

const bookmarkEvent = async (userId, eventId) => {
    try {
        await axios.post(`${API_URL}/${userId}/bookmark-event/${eventId}`);
        console.log(`✅ Event ${eventId} bookmarked for user ${userId}.`);
    } catch (error) {
        console.error(`❌ Error bookmarking event ${eventId}:`, error.response?.data || error.message);
    }
};

const getBookmarkedEvents = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/${userId}/bookmarked-events`);
        console.log(`📌 Retrieved bookmarked events for user ${userId}:`, response.data.events);
    } catch (error) {
        console.error(`❌ Error retrieving bookmarked events:`, error.response?.data || error.message);
    }
};

const removeBookmarkedEvent = async (userId, eventId) => {
    try {
        await axios.delete(`${API_URL}/${userId}/bookmark-event/${eventId}`);
        console.log(`🗑️ Event ${eventId} removed from bookmarks.`);
    } catch (error) {
        console.error(`❌ Error removing event ${eventId}:`, error.response?.data || error.message);
    }
};

const testEventBookmarks = async () => {
    console.log("🚀 Testing event bookmarking...");

    await bookmarkEvent(TEST_USER_ID, TEST_EVENT_ID);
    await getBookmarkedEvents(TEST_USER_ID);
    await removeBookmarkedEvent(TEST_USER_ID, TEST_EVENT_ID);
    await getBookmarkedEvents(TEST_USER_ID);

    console.log("✅ Finished testing event bookmarking!");
};

testEventBookmarks();
