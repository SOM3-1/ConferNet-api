const axios = require("axios");
const admin = require("firebase-admin");

const API_URL = "http://localhost:5003/events";

const generateRandomDate = (daysFromNow) => {
    const now = new Date();
    now.setDate(now.getDate() + daysFromNow);
    return now.toISOString();
};

const organizers = [
    { organizerId: "organizer1", organizerName: "TechEvents Inc." },
    { organizerId: "organizer2", organizerName: "FutureCon" },
];

const generateEventData = (index) => {
    const startDate = generateRandomDate(index);
    const endDate = generateRandomDate(index + 1);

    return {
        name: `Tech Conference ${index + 1}`,
        description: `A cutting-edge tech conference about AI, Blockchain, and Web3 (Event ${index + 1})`,
        startDate: startDate,
        endDate: endDate,
        timezone: "America/New_York",
        venue: `Venue ${index + 1}`,
        address: `123 Event St, City ${index + 1}, Country ${index + 1}`,
        city: `City ${index + 1}`,
        country: `Country ${index + 1}`,
        venueMapUrl: `https://example.com/venue-map-${index + 1}.png`,
        organizerId: organizers[index % organizers.length].organizerId,
        organizerName: organizers[index % organizers.length].organizerName,
        contactEmail: `contact${index + 1}@techevents.com`,
        contactPhone: `+1-555-${9000 + index}`,
        keynoteSpeakers: [
            {
                speakerId: `speaker${index + 1}`,
                name: `Speaker ${index + 1}`,
                bio: `An expert in AI and emerging technologies.`,
                profilePicture: `https://example.com/speaker-${index + 1}.jpg`,
            },
        ],
        sessions: [`session${index + 1}`, `session${index + 2}`],
        registrationRequired: true,
        registrationFee: Math.random() * (500 - 50) + 50,
        currency: "USD",
        paymentMethods: ["Credit Card", "PayPal"],
        maxAttendees: Math.floor(Math.random() * (1000 - 100) + 100), 
    };
};

const createEvent = async (eventData) => {
    try {
        const response = await axios.post(API_URL, eventData);
        console.log(`Event Created: ${eventData.name} - ID: ${response.data.eventId}`);
    } catch (error) {
        console.error(`Error creating event ${eventData.name}:`, error.response?.data || error.message);
    }
};

const createMultipleEvents = async (numEvents = 5) => {
    console.log(`Creating ${numEvents} events...`);
    for (let i = 0; i < numEvents; i++) {
        const eventData = generateEventData(i);
        await createEvent(eventData);
    }
    console.log("Finished creating events!");
};

createMultipleEvents(10); 
