const { db } = require("./../../firebaseConfig");
const { sendEmail } = require("././../utils/emailService");

const sendRoleEmails = async (userIds = [], role = "", eventDetails = {}) => {
  if (!userIds.length) return;

  const userSnapshots = await Promise.all(
    userIds.map(id => db.collection("users").doc(id).get())
  );

  const users = userSnapshots
    .filter(doc => doc.exists)
    .map(doc => ({ id: doc.id, ...doc.data() }));

  const emailPromises = users.map(user => {
    const subject = `🎤 You've been added as a ${role} for "${eventDetails.name}"`;
    const text = `Hi ${user.name},

You've been added as a ${role} for the event "${eventDetails.name}" scheduled from ${new Date(eventDetails.startDate.toDate()).toDateString()} to ${new Date(eventDetails.endDate.toDate()).toDateString()}.

📍 Venue: ${eventDetails.venue || "To Be Announced"}
📧 Contact: ${eventDetails.contactEmail || "N/A"}

Log in to manage your sessions or upload materials.

— ConferNet Team`;

    return sendEmail({
      to: user.email,
      subject,
      text,
    });
  });

  await Promise.all(emailPromises);
};

module.exports = { sendRoleEmails };
