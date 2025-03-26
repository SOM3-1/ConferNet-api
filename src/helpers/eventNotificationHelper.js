const { db } = require("./../../firebaseConfig");
const { sendEmail } = require("././../utils/emailService");

const notifyEventUsers = async (eventId, eventData, action = "updated") => {
  const speakerIds = eventData.keynoteSpeakers || [];
  const moderatorIds = eventData.moderators || [];

  const attendeesSnapshot = await db.collection("events")
    .doc(eventId)
    .collection("attendees")
    .get();

  const attendeeIds = attendeesSnapshot.docs.map(doc => doc.id);

  // Combine all userIds and deduplicate
  const userIds = [...new Set([...speakerIds, ...moderatorIds, ...attendeeIds])];

  const userDocs = await Promise.all(
    userIds.map(id => db.collection("users").doc(id).get())
  );

  const users = userDocs.filter(doc => doc.exists).map(doc => ({ id: doc.id, ...doc.data() }));

  const subject = `📣 Event "${eventData.name}" has been ${action}`;
  const message = (user, role) => `Hi ${user.name},

The event "${eventData.name}" you are part of has been ${action}.

📅 Date: ${eventData.startDate?.toDate?.().toDateString() || "TBD"}
📍 Venue: ${eventData.venue || "TBD"}

Please check the app for more details.

– ConferNet Team`;

  const emailPromises = users.map(user =>
    sendEmail({
      to: user.email,
      subject,
      text: message(user),
    })
  );

  await Promise.all(emailPromises);
};

module.exports = { notifyEventUsers };
