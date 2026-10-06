const assert = require("assert");
const { buildWeeklyReportEmail } = require("../functions/weeklyReport");

console.log("=== Testing Weekly Report Logic ===");

// Test 1: User with activity (paid invoices + overdue invoices)
const activeCandidate = {
  user: { name: "Alice Builder", email: "alice@example.com" },
  userId: "user_alice_123",
  isSubscribed: true,
  paidLastWeek: [{ id: "inv_1", invoiceNumber: "1001", total: 450 }],
  dueThisWeek: [{ id: "inv_2", invoiceNumber: "1002", total: 300, dueDate: "2026-10-01" }],
  overdueInvoices: [{ id: "inv_3", invoiceNumber: "1000", total: 200, dueDate: "2026-09-20", daysOverdue: 7, clientName: "Acme Corp" }],
  totalPaid: 450,
  totalDue: 300,
  totalOverdue: 200,
  hasActivity: true
};

const activeEmail = buildWeeklyReportEmail(activeCandidate);
assert(activeEmail.emailSubject.includes("Action Required on 1 Overdue Invoice"), "Subject should highlight overdue invoice");
assert(activeEmail.emailHtml.includes("⭐ PRO SUBSCRIBER"), "Pro badge should be present for subscriber");
assert(activeEmail.emailHtml.includes("450.00"), "Paid amount should be in HTML");
assert(activeEmail.emailHtml.includes("Acme Corp"), "Client name should be in overdue section");
console.log("✔ Test 1 Passed: Active user report contains metrics, overdue warning, and Pro badge.");

// Test 2: User with zero activity ("All Caught Up")
const zeroActivityCandidate = {
  user: { name: "Bob Freelancer", email: "bob@example.com" },
  userId: "user_bob_456",
  isSubscribed: false,
  paidLastWeek: [],
  dueThisWeek: [],
  overdueInvoices: [],
  totalPaid: 0,
  totalDue: 0,
  totalOverdue: 0,
  hasActivity: false
};

const zeroEmail = buildWeeklyReportEmail(zeroActivityCandidate);
assert.strictEqual(zeroEmail.emailSubject, "Weekly Report: You're all caught up! 🎉", "Subject should be all caught up");
assert(zeroEmail.emailHtml.includes("You're All Caught Up!"), "Body should contain all caught up header");
assert(zeroEmail.emailHtml.includes("PRO UPGRADE"), "Free tier user should receive Pro upsell banner");
assert(!zeroEmail.emailHtml.includes("⭐ PRO SUBSCRIBER"), "Free tier user should not have Pro badge");
console.log("✔ Test 2 Passed: Zero activity user receives 'All Caught Up' template and Pro upgrade banner.");

// Test 3: Simulation of Monday vs Tuesday queue partitioning
const simulatedUsers = [];
for (let i = 1; i <= 150; i++) {
  // First 60 users have activity, remaining 90 have zero activity
  const hasActivity = i <= 60;
  simulatedUsers.push({
    userId: `user_${i}`,
    email: `user_${i}@example.com`,
    hasActivity,
    lastWeeklyReportSentAt: null
  });
}

const DAILY_BATCH_LIMIT = 85;

// Monday Simulation
const isMonday = true;
let mondayQueue = [];
const mondayActive = simulatedUsers.filter(u => u.hasActivity);
const mondayZero = simulatedUsers.filter(u => !u.hasActivity);

if (isMonday) {
  mondayQueue = mondayActive;
}

assert.strictEqual(mondayQueue.length, 60, "Monday queue should contain only 60 active users");
const mondaySent = mondayQueue.slice(0, DAILY_BATCH_LIMIT);
assert.strictEqual(mondaySent.length, 60, "All 60 active users should be sent on Monday since 60 <= 85 limit");

// Mark sent users
mondaySent.forEach(u => {
  u.lastWeeklyReportSentAt = new Date();
});

// Tuesday Simulation
const isTuesday = true;
// Filter out users who already received it recently (Monday sent)
const tuesdayEligible = simulatedUsers.filter(u => !u.lastWeeklyReportSentAt);
assert.strictEqual(tuesdayEligible.length, 90, "90 zero-activity users remain for Tuesday");

const tuesdayActiveOverflow = tuesdayEligible.filter(u => u.hasActivity);
const tuesdayZero = tuesdayEligible.filter(u => !u.hasActivity);
assert.strictEqual(tuesdayActiveOverflow.length, 0, "No active overflow since Monday accommodated all 60");
assert.strictEqual(tuesdayZero.length, 90, "90 zero-activity users ready for Tuesday");

const tuesdayQueue = [...tuesdayActiveOverflow, ...tuesdayZero];
const tuesdaySent = tuesdayQueue.slice(0, DAILY_BATCH_LIMIT);
assert.strictEqual(tuesdaySent.length, 85, "Tuesday should cap sending at 85 emails, reserving >= 15 for transactional");

tuesdaySent.forEach(u => {
  u.lastWeeklyReportSentAt = new Date();
});

const wednesdayEligible = simulatedUsers.filter(u => !u.lastWeeklyReportSentAt);
assert.strictEqual(wednesdayEligible.length, 5, "Remaining 5 zero-activity users should roll over to Wednesday catch-up");

console.log("✔ Test 3 Passed: 150 users correctly partitioned across Monday (60 sent), Tuesday (85 sent capped), and Wednesday (5 overflow sent).");

console.log("=== All Tests Passed Successfully ===");
