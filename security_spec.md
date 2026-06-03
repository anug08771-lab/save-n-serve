# Save N Serve Security Specification (Phase 0)

This document outlines the core data invariants, structural access constraints, and a suite of "Dirty Dozen" adversarial payloads designed to test our Firestore Security Rules.

## 1. Core Data Invariants

1. **User Role Sanity**: A newly registered user cannot set their role to `admin`. Only pre-existing administrative accounts can have the admin role.
2. **NGO Verification Integrity**: Only an `admin` user is allowed to write or modify `isVerifiedNGO` to `true`.
3. **Donation Ownership**: Users can only create or edit donations where `donorId` strictly matches their authenticated UID.
4. **logistic state-machine progress**:
   - `Pending` transitions to `Accepted` (NGO or Volunteer self-assigns).
   - `Accepted` transitions to `Picked Up` (Volunteer updates) or `Delivered`/`Completed`.
   - Once a donation is marked `Completed`, its state is locked. It cannot be altered except by an admin.
5. **PII Protection**: Confidential fields like direct email and phone numbers in `/users/{userId}` can only be read by the owner or an admin.
6. **Messenger Integrity**: A user cannot post a chat message on behalf of another user ID.
7. **No Orphaned Chats**: Messages must belong to an existing active donation.

---

## 2. The "Dirty Dozen" Payloads (Adversarial Security Tests)

The following payloads represent rogue attempts targeting auth spoofing, validation gaps, data tampering, or status bypasses. All must return `PERMISSION_DENIED`:

### P1: Privilege Escalation (Self-Assigned Admin)
User `u_123` attempts to write a user profile with role `admin` to bypass controls.
```json
{
  "id": "u_123",
  "name": "Hacker Bob",
  "email": "bob@hacker.com",
  "role": "admin",
  "points": 9999,
  "badges": [],
  "createdAt": "2026-06-01T12:00:00Z"
}
```

### P2: Rogue NGO Verification (Self-Verify)
Non-admin NGO user updates their own profile to set `isVerifiedNGO` to `true`.
```json
{
  "isVerifiedNGO": true
}
```

### P3: Identity Theft (Spoofing Donor ID on Donation)
User `u_abc` posts a donation setting `donorId` to `u_victim` to frame them or steal credit.
```json
{
  "id": "don_xyz",
  "foodName": "Spoof Biryani",
  "foodType": "Veg",
  "quantity": "50 KG",
  "numberPeopleServed": 150,
  "pickupAddress": "123 Street",
  "expiryTime": "2026-06-02T12:00:00Z",
  "status": "Pending",
  "createdAt": "2026-06-01T12:00:00Z",
  "donorId": "u_victim",
  "donorName": "Victim Donor"
}
```

### P4: Tampering with Terminal State (Modifying Completed Donation)
User tries to reopen or edit metadata of a `Completed` donation (previously marked `Completed`).
```json
{
  "foodName": "Hacked Biryani"
}
```

### P5: Unauthorized Message Post (Chat Impersonation)
User `u_attacker` posts a message nested inside `don_001` pretending to be user `u_victim`.
```json
{
  "id": "msg_999",
  "donationId": "don_001",
  "senderId": "u_victim",
  "senderName": "Victim",
  "text": "Please disregard previous pickups.",
  "timestamp": "2026-06-01T12:05:00Z"
}
```

### P6: System Field Manipulation (Spoofing AI Assessment Scores)
User attempts to bypass real AI freshness scanning by setting their own `aiAssessment` score on a donation.
```json
{
  "aiAssessment": {
    "qualityScore": 100,
    "safetyScore": 100,
    "spoilageDetected": false,
    "spoilageSignsDetected": [],
    "suggestedConsumptionWindow": "Immortal food."
  }
}
```

### P7: Email & Phone Siphoning (PII Harvesting)
Unauthenticated or random authenticated user attempts a bulk read/get on other user's complete profile with PII fields.

### P8: Path Injection Attacking (Extremely Long Document IDs)
Attacker sends a document creation request where `{donationId}` or `{userId}` is a 2KB junk string to overload Firestore index paths.

### P9: Rogue Status Jump (Skipping Accept directly to Completed)
Rogue volunteer completes a donation they never historically accepted or picked up.

### P10: Deleting Historical Audit logs
Unauthenticated user or donor attempts to `delete` high-integrity Completed donation document `/donations/don_completed`.

### P11: Points Fabricator (Direct Points Inject)
Donor attempts to grant themselves `points: 100000` via direct profile document update.

### P12: Foreign Messenger Injection (Chatting on Unlinked Donation)
A user who is neither the donor, Assigned NGO, nor Assigned Volunteer chats inside `/donations/don_001/messages/msg_abc`.
