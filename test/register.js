const axios = require("axios");

const API_URL = "http://localhost:5003/register";

const users = [
  {
    userId: "organizer1",
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    dob: "1985-04-10",
    role: 1,
    phoneNumber: "+1234567890",
    organization: "TechConf Inc.",
    jobTitle: "Event Manager",
    country: "United States",
    city: "San Francisco",
    bio: "Experienced event organizer for tech conferences.",
    profilePicture: "https://example.com/alice.jpg"
  },

  // Keynote Speakers
  {
    userId: "speaker1",
    name: "Dr. John Smith",
    email: "john.smith@example.com",
    dob: "1975-06-20",
    role: 2,
    phoneNumber: "+1987654321",
    organization: "AI Research Lab",
    jobTitle: "Chief Scientist",
    country: "United States",
    city: "New York",
    bio: "AI and ML researcher with 20 years of experience.",
    profilePicture: "https://example.com/john.jpg"
  },
  {
    userId: "speaker2",
    name: "Prof. Emily Davis",
    email: "emily.davis@example.com",
    dob: "1980-03-15",
    role: 2,
    phoneNumber: "+1456789123",
    organization: "Tech University",
    jobTitle: "Professor of Computer Science",
    country: "Canada",
    city: "Toronto",
    bio: "Keynote speaker and professor specializing in deep learning.",
    profilePicture: "https://example.com/emily.jpg"
  },

  // Attendees
  {
    userId: "attendee1",
    name: "Michael Brown",
    email: "michael.brown@example.com",
    dob: "1992-07-10",
    role: 3,
    phoneNumber: "+1987531597",
    country: "United States",
    city: "Chicago",
    bio: "Tech enthusiast attending the conference to learn more about AI.",
    profilePicture: "https://example.com/michael.jpg"
  },
  {
    userId: "attendee2",
    name: "Sophia Martinez",
    email: "sophia.martinez@example.com",
    dob: "1995-09-25",
    role: 3,
    phoneNumber: "+1321654987",
    country: "Mexico",
    city: "Mexico City",
    bio: "Interested in networking with AI professionals.",
    profilePicture: "https://example.com/sophia.jpg"
  },
  {
    userId: "attendee3",
    name: "David Wilson",
    email: "david.wilson@example.com",
    dob: "1990-05-30",
    role: 3,
    phoneNumber: "+1654321987",
    country: "United Kingdom",
    city: "London",
    bio: "Data scientist exploring new AI technologies.",
    profilePicture: "https://example.com/david.jpg"
  },
  {
    userId: "attendee4",
    name: "Olivia Taylor",
    email: "olivia.taylor@example.com",
    dob: "1997-12-05",
    role: 3,
    phoneNumber: "+1489321678",
    country: "Australia",
    city: "Sydney",
    bio: "University student passionate about deep learning.",
    profilePicture: "https://example.com/olivia.jpg"
  },
  {
    userId: "attendee5",
    name: "Daniel Hernandez",
    email: "daniel.hernandez@example.com",
    dob: "1993-11-20",
    role: 3,
    phoneNumber: "+1657984123",
    country: "Spain",
    city: "Barcelona",
    bio: "Tech entrepreneur interested in AI applications.",
    profilePicture: "https://example.com/daniel.jpg"
  }
];

const registerUser = async (user) => {
  try {
    const response = await axios.post(API_URL, user);
    console.log(`User registered: ${user.name} (${user.role})`);
  } catch (error) {
    console.error(`Error registering ${user.name}:`, error.response?.data || error.message);
  }
};

const registerAllUsers = async () => {
  for (const user of users) {
    await registerUser(user);
  }
};

registerAllUsers();
