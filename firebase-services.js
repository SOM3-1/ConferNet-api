const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { db } = require("./firebaseConfig");
const setupSwagger = require("./swaggerConfig");
const { PORT } = require("./src/constants/constant");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

setupSwagger(app);

app.get("/", (req, res) => {
  res.send("Confernet API is running...");
});
const registerRoutes = require("./src/routes/register");
const usersRoutes = require("./src/routes/users");
const usersByRolesRoutes = require("./src/routes/users-by-roles");
const messagesRoutes =  require("./src/routes/messages");
const eventsRoutes =  require("./src/routes/events");

app.use("/register", registerRoutes);
app.use("/users", usersRoutes);
app.use("/users-by-roleid", usersByRolesRoutes);
app.use("/messages", messagesRoutes);
app.use("/events", eventsRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
