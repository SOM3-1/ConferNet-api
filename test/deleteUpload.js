const axios = require("axios");

const eventId = "0ghdRznFofOWlGClzEzh";
const userId = "speaker1";
const fileUrl = "https://confernet.blob.core.windows.net/keynotespeakers-upload/unique-id-dummy.pdf"; // Replace with actual file URL

const deleteFile = async () => {
  try {
    const response = await axios.delete(
      `http://localhost:5003/uploads/delete/${eventId}/${userId}`,
      {
        data: { fileUrl },
        headers: { "Content-Type": "application/json" },
      }
    );
    console.log("File deleted successfully:", response.data);
  } catch (error) {
    console.error("Error deleting file:", error.response?.data || error.message);
  }
};

deleteFile();