require("dotenv").config();
const admin = require("firebase-admin");
const { db } = require("./../../firebaseConfig");
const { sendEmail } = require("./../utils/emailService");

const getTomorrowBounds = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 23, 59, 59);
  return {
    start: admin.firestore.Timestamp.fromDate(start),
    end: admin.firestore.Timestamp.fromDate(end)
  };
};

const formatDate = date =>
  date?.toDate?.() instanceof Date ? date.toDate().toDateString() : new Date(date).toDateString();

const sendRemindersForEvent = async (eventId, eventData) => {
  const speakerIds = Array.isArray(eventData.keynoteSpeakers) ? eventData.keynoteSpeakers : [];
  const moderatorIds = Array.isArray(eventData.moderators) ? eventData.moderators : [];

  const attendeesSnapshot = await db
    .collection("events")
    .doc(eventId)
    .collection("attendees")
    .get();

  const attendeeIds = attendeesSnapshot.docs.map(doc => doc.id);

  // 🔐 Validate user IDs
  const allUserIds = [...new Set([...speakerIds, ...moderatorIds, ...attendeeIds])];
  const validUserIds = allUserIds.filter(id => typeof id === "string" && id.trim().length > 0);

  if (validUserIds.length === 0) {
    console.warn(`⚠️ No valid user IDs found for event "${eventData.name}"`);
    return;
  }

  const userDocs = await Promise.all(
    validUserIds.map(id => db.collection("users").doc(id).get())
  );

  const users = userDocs
    .filter(doc => doc.exists)
    .map(doc => ({ id: doc.id, ...doc.data() }));

  const subject = `📢 Reminder: "${eventData.name}" is happening tomorrow`;

  const emails = users.map(user =>
    sendEmail({
      to: user.email,
      subject,
      text: `Hi ${user.name},

This is a friendly reminder that the event "${eventData.name}" is happening tomorrow.

🗓 Date: ${formatDate(eventData.startDate)}
📍 Venue: ${eventData.venue || "TBD"}

Please be prepared and check the app for more info.

— ConferNet Team`
    })
  );

  await Promise.all(emails);
  console.log(`✅ Reminders sent for "${eventData.name}"`);
};

const runReminderScript = async () => {
  try {
    const { start, end } = getTomorrowBounds();

    const snapshot = await db
      .collection("events")
      .where("startDate", ">=", start)
      .where("startDate", "<=", end)
      .get();

    if (snapshot.empty) {
      console.log("ℹ️ No events happening tomorrow.");
      return;
    }

    for (const doc of snapshot.docs) {
      const eventId = doc.id;
      const data = doc.data();

      if (!eventId || !data) {
        console.warn("⚠️ Skipping event due to invalid ID or data");
        continue;
      }

      await sendRemindersForEvent(eventId, data);
    }

    console.log("🎉 All reminders sent successfully!");
  } catch (err) {
    console.error("❌ Error running reminder script:", err.message);
  }
};

if (require.main === module) {
  runReminderScript();
}
