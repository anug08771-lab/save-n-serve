export type UserRole = "donor" | "ngo" | "volunteer" | "admin";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  points: number;
  badges: string[];
  isVerifiedNGO?: boolean;
  phone?: string;
  organizationName?: string;
  createdAt: string;
}

export interface AIQualityAssessment {
  qualityScore: number;     // 0-100
  spoilageDetected: boolean;
  safetyScore: number;      // 0-100
  spoilageSignsDetected: string[];
  suggestedConsumptionWindow: string; // e.g., "Must consume within 3 hours"
  matchingNgoRecommendation: string;
}

export interface Donation {
  id: string;
  foodName: string;
  foodType: "Veg" | "Non-Veg";
  quantity: string; // e.g., "10 kg", "2 trays"
  numberPeopleServed: number;
  pickupAddress: string;
  expiryTime: string; // ISO string
  description: string;
  imageUrl?: string;
  status: "Pending" | "Accepted" | "Picked Up" | "Delivered" | "Completed";
  createdAt: string;
  donorId: string;
  donorName: string;
  donorPhone?: string;
  
  // Handlers
  ngoId?: string;
  ngoName?: string;
  volunteerId?: string;
  volunteerName?: string;
  
  // AI enhancements
  aiAssessment?: AIQualityAssessment;
}

export interface RecommendedMatch {
  ngoId: string;
  ngoName: string;
  distanceKm: number;
  reason: string;
}

export interface Message {
  id: string;
  donationId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  role: UserRole;
  points: number;
  badgesCount: number;
}

export interface SystemStats {
  totalDonations: number;
  totalMealsSaved: number;
  foodWasteReductionKg: number;
  activeNGOsCount: number;
  activeVolunteersCount: number;
}
