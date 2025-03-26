const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const eventId = "0ghdRznFofOWlGClzEzh";
const userId = "speaker1";
const filePath = path.join(__dirname, "dummy.pdf"); 

const uploadFile = async () => {
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));

  try {
    const response = await axios.post(
      `http://localhost:5003/uploads/upload/${eventId}/${userId}`,
      form,
      {
        headers: form.getHeaders(),
      }
    );

    console.log("File uploaded successfully:");
    console.log(response.data);
  } catch (error) {
    console.error("Error uploading file:", error.response?.data || error.message);
  }
};

uploadFile();
