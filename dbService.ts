import fs from "fs";
import path from "path";
import admin from "firebase-admin";
import { UserProfile, Donation, Message, LeaderboardEntry, SystemStats } from "./src/types";

// Local Database storage location fallback
const DB_FILE = path.join(process.cwd(), "db.json");

// Default initial seed data to make the app interactive and robust out-of-the-box
const DEFAULT_USERS: UserProfile[] = [
  {
    id: "admin_user",
    name: "Anug (Admin Owner)",
    email: "anug08771@gmail.com",
    role: "admin",
    points: 1250,
    badges: ["System Architect", "Zero Hunger Champion", "Elite Overseer"],
    phone: "+91 98765 43210",
    organizationName: "Save N Serve HQ",
    createdAt: new Date().toISOString()
  },
  {
    id: "donor_green_garden",
    name: "Chef Maya",
    email: "maya@greengarden.com",
    role: "donor",
    points: 450,
    badges: ["Green Kitchen", "Star Supporter", "Spiritual Giver"],
    phone: "+91 87654 32109",
    organizationName: "Green Garden Bistro & Organic Café",
    createdAt: new Date().toISOString()
  },
  {
    id: "donor_imperial",
    name: "Rajesh Kumar",
    email: "events@imperialpalace.com",
    role: "donor",
    points: 820,
    badges: ["Royal Feast Giver", "Weekly Savior"],
    phone: "+91 76543 21098",
    organizationName: "Imperial Palace Hotel & Banquet",
    createdAt: new Date().toISOString()
  },
  {
    id: "ngo_feed_mumbai",
    name: "Director Priya Shah",
    email: "priya@feedmumbai.org",
    role: "ngo",
    points: 900,
    badges: ["Vetted Partner", "Meals For All", "Daily Kitchen"],
    isVerifiedNGO: true,
    phone: "+91 65432 10987",
    organizationName: "Feed Mumbai Foundation Charity",
    createdAt: new Date().toISOString()
  },
  {
    id: "ngo_hope_house",
    name: "Brother Michael",
    email: "michael@hopehouse.org",
    role: "ngo",
    points: 620,
    badges: ["Vetted Partner", "Youth Rescue", "Old Age Home Helper"],
    isVerifiedNGO: true,
    phone: "+91 54321 09876",
    organizationName: "Hope House Shelter & Community Kitchen",
    createdAt: new Date().toISOString()
  },
  {
    id: "volunteer_john",
    name: "John Swift",
    email: "john@volunteer.com",
    role: "volunteer",
    points: 540,
    badges: ["Lighting Delivery", "Weekend Warrior", "Safety Approved"],
    phone: "+91 43210 98765",
    organizationName: "Save N Serve Volunteer Crew",
    createdAt: new Date().toISOString()
  },
  {
    id: "volunteer_arjun",
    name: "Arjun Das",
    email: "arjun@volunteer.com",
    role: "volunteer",
    points: 710,
    badges: ["CO2 Reducer", "Night Rider", "Zero-Spill Pro"],
    phone: "+91 32109 87654",
    organizationName: "Save N Serve Volunteer Crew",
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_DONATIONS: Donation[] = [
  {
    id: "don_001",
    foodName: "Premium Basmati Biryani & Chana Masala",
    foodType: "Veg",
    quantity: "15 KG",
    numberPeopleServed: 50,
    pickupAddress: "Green Garden Bistro, Senapati Bapat Marg, Lower Parel, Mumbai",
    expiryTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    description: "Steam hot, packed in hygienic containers. Cooked under pristine temperature conditions, isolated from allergens.",
    imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    status: "Pending",
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    donorId: "donor_green_garden",
    donorName: "Green Garden Bistro & Organic Café",
    donorPhone: "+91 87654 32109",
    aiAssessment: {
      qualityScore: 94,
      spoilageDetected: false,
      safetyScore: 96,
      spoilageSignsDetected: [],
      suggestedConsumptionWindow: "Vibrant and safe. Consume within 6 hours. Store below 4°C.",
      matchingNgoRecommendation: "Ideal for Hope House Shelter due to nutritional balanced contents."
    }
  },
  {
    id: "don_002",
    foodName: "Assorted Breads, Butter Paneer, & Salads",
    foodType: "Veg",
    quantity: "25 KG",
    numberPeopleServed: 80,
    pickupAddress: "Imperial Palace Hotel, Outer Ring Road, Bandra West, Mumbai",
    expiryTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    description: "Prepared for a grand banquet event. Pure hygiene, unused buffet portions stored in warm chafing units.",
    imageUrl: "https://images.unsplash.com/photo-1585938338392-50a59970d2ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    status: "Accepted",
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    donorId: "donor_imperial",
    donorName: "Imperial Palace Hotel & Banquet",
    donorPhone: "+91 76543 21098",
    ngoId: "ngo_feed_mumbai",
    ngoName: "Feed Mumbai Foundation Charity",
    aiAssessment: {
      qualityScore: 88,
      spoilageDetected: false,
      safetyScore: 90,
      spoilageSignsDetected: [],
      suggestedConsumptionWindow: "Warm and safe. Consume within 3.5 hours to avoid staling of breads.",
      matchingNgoRecommendation: "Perfect size for Feed Mumbai Foundation's evening kitchen crowd."
    }
  },
  {
    id: "don_003",
    foodName: "Roasted Garlic Chicken Roast & Grilled Veggies",
    foodType: "Non-Veg",
    quantity: "12 KG",
    numberPeopleServed: 35,
    pickupAddress: "Luxe Caterers, Andheri Link Rd, Mumbai",
    expiryTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    description: "Cooked and blast chilled immediately to lock freshness. Suitable for immediate reheating.",
    imageUrl: "https://images.unsplash.com/photo-1598515214211-89d3e73ae83b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    status: "Delivered",
    createdAt: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    donorId: "donor_imperial",
    donorName: "Imperial Palace Hotel & Banquet",
    donorPhone: "+91 76543 21098",
    ngoId: "ngo_feed_mumbai",
    ngoName: "Feed Mumbai Foundation Charity",
    volunteerId: "volunteer_john",
    volunteerName: "John Swift",
    aiAssessment: {
      qualityScore: 92,
      spoilageDetected: false,
      safetyScore: 95,
      spoilageSignsDetected: [],
      suggestedConsumptionWindow: "Blast-chilled poultry. Must be reheated to 74°C. Consume within 8 hours.",
      matchingNgoRecommendation: "Feed Mumbai Foundation is fully equipped with heaters."
    }
  }
];

const DEFAULT_MESSAGES: Message[] = [
  {
    id: "msg_1",
    donationId: "don_002",
    senderId: "donor_imperial",
    senderName: "Chef Rajesh (Imperial Palace)",
    text: "Hi Priya, the boxes are labeled and waiting in the Banquet loading bay.",
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString()
  },
  {
    id: "msg_2",
    donationId: "don_002",
    senderId: "ngo_feed_mumbai",
    senderName: "Priya Shah (Feed Mumbai)",
    text: "Thank you Rajesh! I am assigning volunteer Arjun to pick it up. He should be there in 15 minutes.",
    timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString()
  }
];

interface SaveNServeDB {
  users: UserProfile[];
  donations: Donation[];
  messages: Message[];
}

// Global reference for active Firestore Instance (safely managed via try-clause)
let isFirestoreEnabled = false;
let db: admin.firestore.Firestore | null = null;

// Initialize admin SDK securely
try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    if (admin.apps.length === 0) {
      admin.initializeApp({
        projectId: config.projectId,
      });
    }
    db = admin.firestore(config.firestoreDatabaseId || "(default)");
    isFirestoreEnabled = true;
    console.log("Save N Serve Firebase admin initialized with DB:", config.firestoreDatabaseId);

    // Run async seeding in background
    seedFirestoreDatabase();
  }
} catch (err) {
  console.error("Firebase Admin setup bypassed or failed. Using high-fidelity local db.json. Error:", err);
}

// Background Firestore Seeder to ensure instant UX integrity
async function seedFirestoreDatabase() {
  if (!db) return;
  try {
    const usersColl = db.collection("users");
    const testFetch = await usersColl.limit(1).get();
    if (testFetch.empty) {
      console.log("Seeding base users collection in Firestore...");
      for (const u of DEFAULT_USERS) {
        await usersColl.doc(u.id).set(u);
      }
    }

    const donationsColl = db.collection("donations");
    const testDonations = await donationsColl.limit(1).get();
    if (testDonations.empty) {
      console.log("Seeding base donations collection in Firestore...");
      for (const d of DEFAULT_DONATIONS) {
        await donationsColl.doc(d.id).set(d);
      }
    }

    // Checking messages
    const docSnaps = await donationsColl.get();
    for (const dDoc of docSnaps.docs) {
      const msgsColl = db.collection("donations").doc(dDoc.id).collection("messages");
      const testMsgs = await msgsColl.limit(1).get();
      if (testMsgs.empty) {
        const matches = DEFAULT_MESSAGES.filter(m => m.donationId === dDoc.id);
        if (matches.length > 0) {
          console.log(`Seeding nested chat messages for donation ${dDoc.id}...`);
          for (const m of matches) {
            await msgsColl.doc(m.id).set(m);
          }
        }
      }
    }
  } catch (error) {
    console.warn("Firestore seeding failed or skipped:", error);
  }
}

// --- LOCAL DB FALLBACK SYSTEM (Sync File Reader/Writer) ---
function initLocalDB(): SaveNServeDB {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (parsed.users && parsed.donations && parsed.messages) {
        const adminInd = parsed.users.findIndex((u: UserProfile) => u.email === "anug08771@gmail.com");
        if (adminInd === -1) {
          parsed.users.unshift(DEFAULT_USERS[0]);
          fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), "utf-8");
        }
        return parsed;
      }
    }
  } catch (err) {
    console.error("Local JSON recovery failed. Resetting...", err);
  }

  const defaultDB: SaveNServeDB = {
    users: DEFAULT_USERS,
    donations: DEFAULT_DONATIONS,
    messages: DEFAULT_MESSAGES
  };
  fs.writeFileSync(DB_FILE, JSON.stringify(defaultDB, null, 2), "utf-8");
  return defaultDB;
}

function writeLocalDB(data: SaveNServeDB) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Local JSON serializing failed:", err);
  }
}

// --- DUPLICATE/ORPHAN PROTECTION HELPER ---
function sanitizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_\-]/g, "");
}

export const dbService = {
  // --- USERS ---
  async getUsers(): Promise<UserProfile[]> {
    if (isFirestoreEnabled && db) {
      try {
        const snap = await db.collection("users").get();
        return snap.docs.map(doc => doc.data() as UserProfile);
      } catch (err) {
        console.error("Firestore retrieval failed. Bypassing to local:", err);
      }
    }
    const local = initLocalDB();
    return local.users;
  },

  async getUserByEmail(email: string): Promise<UserProfile | null> {
    const cleanEmail = email.toLowerCase().trim();
    if (isFirestoreEnabled && db) {
      try {
        const snap = await db.collection("users")
          .where("email", "==", cleanEmail)
          .limit(1)
          .get();
        if (!snap.empty) {
          return snap.docs[0].data() as UserProfile;
        }
        return null;
      } catch (err) {
        console.error("Firestore email select failed. Bypassing to local:", err);
      }
    }
    const local = initLocalDB();
    return local.users.find(u => u.email.toLowerCase() === cleanEmail) || null;
  },

  async getUserById(id: string): Promise<UserProfile | null> {
    if (isFirestoreEnabled && db) {
      try {
        const docSnap = await db.collection("users").doc(sanitizeId(id)).get();
        if (docSnap.exists) {
          return docSnap.data() as UserProfile;
        }
        return null;
      } catch (err) {
        console.error("Firestore primary lookup failed. Bypassing to local:", err);
      }
    }
    const local = initLocalDB();
    return local.users.find(u => u.id === id) || null;
  },

  async addUser(user: UserProfile): Promise<UserProfile> {
    const cleanMail = user.email.toLowerCase().trim();
    const cleanUser = { ...user, email: cleanMail };

    if (isFirestoreEnabled && db) {
      try {
        const exists = await this.getUserByEmail(cleanMail);
        if (exists) return exists;
        await db.collection("users").doc(sanitizeId(cleanUser.id)).set(cleanUser);
        return cleanUser;
      } catch (err) {
        console.error("Firestore create user failed:", err);
      }
    }

    const local = initLocalDB();
    const exists = local.users.find(u => u.email.toLowerCase() === cleanMail);
    if (exists) return exists;
    local.users.push(cleanUser);
    writeLocalDB(local);
    return cleanUser;
  },

  async updateUser(id: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    if (isFirestoreEnabled && db) {
      try {
        const docRef = db.collection("users").doc(sanitizeId(id));
        await docRef.update(updates as any);
        const fresh = await docRef.get();
        return fresh.data() as UserProfile;
      } catch (err) {
        console.error("Firestore user update bypassed due to error:", err);
      }
    }

    const local = initLocalDB();
    const ind = local.users.findIndex(u => u.id === id);
    if (ind === -1) return null;
    local.users[ind] = { ...local.users[ind], ...updates } as UserProfile;
    writeLocalDB(local);
    return local.users[ind];
  },

  // --- DONATIONS ---
  async getDonations(): Promise<Donation[]> {
    if (isFirestoreEnabled && db) {
      try {
        const snap = await db.collection("donations").orderBy("createdAt", "desc").get();
        return snap.docs.map(doc => doc.data() as Donation);
      } catch (err) {
        console.error("Firestore fetch donations failed:", err);
      }
    }
    const local = initLocalDB();
    // Sort descending
    return [...local.donations].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getDonationById(id: string): Promise<Donation | null> {
    if (isFirestoreEnabled && db) {
      try {
        const docSnap = await db.collection("donations").doc(sanitizeId(id)).get();
        if (docSnap.exists) {
          return docSnap.data() as Donation;
        }
        return null;
      } catch (err) {
        console.error("Firestore find donation failed:", err);
      }
    }
    const local = initLocalDB();
    return local.donations.find(d => d.id === id) || null;
  },

  async addDonation(donation: Donation): Promise<Donation> {
    if (isFirestoreEnabled && db) {
      try {
        await db.collection("donations").doc(sanitizeId(donation.id)).set(donation);
        return donation;
      } catch (err) {
        console.error("Firestore put donation failed:", err);
      }
    }
    const local = initLocalDB();
    local.donations.push(donation);
    writeLocalDB(local);
    return donation;
  },

  async updateDonation(id: string, updates: Partial<Donation>): Promise<Donation | null> {
    if (isFirestoreEnabled && db) {
      try {
        const docRef = db.collection("donations").doc(sanitizeId(id));
        await docRef.update(updates as any);
        const fresh = await docRef.get();
        return fresh.data() as Donation;
      } catch (err) {
        console.error("Firestore update donation failed:", err);
      }
    }
    const local = initLocalDB();
    const ind = local.donations.findIndex(d => d.id === id);
    if (ind === -1) return null;
    local.donations[ind] = { ...local.donations[ind], ...updates } as Donation;
    writeLocalDB(local);
    return local.donations[ind];
  },

  // --- NESTED CHAT MESSAGES ---
  async getMessages(donationId: string): Promise<Message[]> {
    if (isFirestoreEnabled && db) {
      try {
        const snap = await db.collection("donations")
          .doc(sanitizeId(donationId))
          .collection("messages")
          .orderBy("timestamp", "asc")
          .get();
        return snap.docs.map(doc => doc.data() as Message);
      } catch (err) {
        console.error("Firestore query messages failed:", err);
      }
    }
    const local = initLocalDB();
    return local.messages.filter(m => m.donationId === donationId);
  },

  async addMessage(message: Message): Promise<Message> {
    if (isFirestoreEnabled && db) {
      try {
        await db.collection("donations")
          .doc(sanitizeId(message.donationId))
          .collection("messages")
          .doc(sanitizeId(message.id))
          .set(message);
        return message;
      } catch (err) {
        console.error("Firestore nested message set failed:", err);
      }
    }
    const local = initLocalDB();
    local.messages.push(message);
    writeLocalDB(local);
    return message;
  },

  // --- LEADERBOARD ---
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const users = await this.getUsers();
    return users
      .map(u => ({
        userId: u.id,
        name: u.name,
        role: u.role,
        points: u.points,
        badgesCount: u.badges ? u.badges.length : 0
      }))
      .sort((a, b) => b.points - a.points);
  },

  async awardPoints(userId: string, quantity: number, badgeAward?: string): Promise<UserProfile | null> {
    if (isFirestoreEnabled && db) {
      try {
        const docRef = db.collection("users").doc(sanitizeId(userId));
        const current = await docRef.get();
        if (current.exists) {
          const userData = current.data() as UserProfile;
          const currentBadges = userData.badges ? [...userData.badges] : [];
          if (badgeAward && !currentBadges.includes(badgeAward)) {
            currentBadges.push(badgeAward);
          }
          const finalPoints = (userData.points || 0) + quantity;
          await docRef.update({
            points: finalPoints,
            badges: currentBadges
          });
          const fresh = await docRef.get();
          return fresh.data() as UserProfile;
        }
      } catch (err) {
        console.error("Firestore points mutation failed:", err);
      }
    }

    const local = initLocalDB();
    const ind = local.users.findIndex(u => u.id === userId);
    if (ind === -1) return null;

    const currentBadges = [...local.users[ind].badges];
    if (badgeAward && !currentBadges.includes(badgeAward)) {
      currentBadges.push(badgeAward);
    }
    local.users[ind] = {
      ...local.users[ind],
      points: local.users[ind].points + quantity,
      badges: currentBadges
    };
    writeLocalDB(local);
    return local.users[ind];
  },

  // --- SYSTEM STATS & METRICS ---
  async getStats(): Promise<SystemStats> {
    const donations = await this.getDonations();
    const users = await this.getUsers();

    const totalDonations = donations.length;
    let totalMealsSaved = 0;
    let foodWasteReductionKg = 0;

    donations.forEach(d => {
      totalMealsSaved += Number(d.numberPeopleServed) || 0;
      const numPart = parseFloat(d.quantity);
      foodWasteReductionKg += isNaN(numPart) ? 10 : numPart;
    });

    const activeNGOsCount = users.filter(u => u.role === "ngo" && u.isVerifiedNGO).length;
    const activeVolunteersCount = users.filter(u => u.role === "volunteer").length;

    return {
      totalDonations,
      totalMealsSaved,
      foodWasteReductionKg: Math.round(foodWasteReductionKg),
      activeNGOsCount,
      activeVolunteersCount
    };
  }
};
