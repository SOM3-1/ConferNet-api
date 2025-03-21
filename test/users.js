const axios = require("axios");

const API_URL = "http://localhost:5003/users"; 

const getAllUsers = async () => {
  try {
    const response = await axios.get(API_URL);
    console.log(`Retrieved ${response.data.length} users:`);
    console.table(response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching all users:`, error.response?.data || error.message);
  }
};

const getUserById = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/${userId}`);
    console.log(`User details for ${userId}:`);
    console.log(response.data);
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error.response?.data || error.message);
  }
};

const testGetUsers = async () => {
  console.log("\nFetching all users...\n");
  const users = await getAllUsers();

  if (users && users.length > 0) {
    console.log("\nFetching details of the first user...\n");
    await getUserById(users[0].id);
  } else {
    console.log("No users found in the database.");
  }
};

testGetUsers();
