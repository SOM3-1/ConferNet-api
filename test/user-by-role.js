const axios = require("axios");

const API_URL = "http://localhost:5003/users-by-roleid/role"; 

const roles = [
  { roleId: 1, name: "Organizer" },
  { roleId: 2, name: "Keynote Speaker" },
  { roleId: 3, name: "Attendee" }
];

const getUsersByRole = async (roleId, roleName) => {
  try {
    const response = await axios.get(`${API_URL}/${roleId}`);
    console.log(`Users with role ${roleName} (${roleId}):`, response.data.users);
  } catch (error) {
    console.error(`Error fetching users for role ${roleName} (${roleId}):`, error.response?.data || error.message);
  }
};

// Fetch users for all roles
const fetchAllRoles = async () => {
  for (const role of roles) {
    await getUsersByRole(role.roleId, role.name);
  }
};

fetchAllRoles();
