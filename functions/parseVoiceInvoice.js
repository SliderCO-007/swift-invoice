const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineString } = require("firebase-functions/params");
const axios = require("axios");

const geminiApiKey = defineString("GEMINI_API_KEY", { default: "" });

/**
 * Simple normalized token / substring similarity score (0..1) for fallback fuzzy matching.
 */
function similarityScore(a, b) {
  if (!a || !b) return 0;
  const normA = String(a).toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
  const normB = String(b).toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
  if (!normA || !normB) return 0;
  if (normA === normB) return 1;
  if (normA.includes(normB) || normB.includes(normA)) {
    const shorter = Math.min(normA.length, normB.length);
    const longer = Math.max(normA.length, normB.length);
    return 0.75 + 0.25 * (shorter / longer);
  }
  const tokensA = normA.split(/\s+/).filter(Boolean);
  const tokensB = normB.split(/\s+/).filter(Boolean);
  if (!tokensA.length || !tokensB.length) return 0;
  let matches = 0;
  for (const tA of tokensA) {
    if (tokensB.some((tB) => tB === tA || (tA.length > 3 && tB.startsWith(tA)) || (tB.length > 3 && tA.startsWith(tB)))) {
      matches++;
    }
  }
  return matches / Math.max(tokensA.length, tokensB.length);
}

/**
 * Resolves common spoken relative due dates relative to todayDate (YYYY-MM-DD).
 */
function parseRelativeDueDate(text, todayDateStr) {
  const baseDate = todayDateStr ? new Date(`${todayDateStr}T12:00:00`) : new Date();
  if (isNaN(baseDate.getTime())) return null;

  const lower = text.toLowerCase();

  // "in X days" / "net X"
  const daysMatch = lower.match(/(?:due\s+in|in|net)\s+(\d+)\s*(?:days?)?/i);
  if (daysMatch) {
    const days = parseInt(daysMatch[1], 10);
    if (!isNaN(days) && days >= 0 && days <= 365) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + days);
      return d.toISOString().slice(0, 10);
    }
  }

  if (/\bdue\s+tomorrow\b/.test(lower)) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }

  if (/\bdue\s+(?:next\s+week|in\s+a\s+week)\b/.test(lower)) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  }

  const weekdays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  for (let i = 0; i < weekdays.length; i++) {
    const dayRegex = new RegExp(`\\b(?:due\\s+)?(next|this|on)?\\s*${weekdays[i]}\\b`, "i");
    const m = lower.match(dayRegex);
    if (m && lower.includes("due")) {
      const currentDay = baseDate.getDay();
      let diff = (i - currentDay + 7) % 7;
      if (diff === 0 || (m[1] && m[1].toLowerCase() === "next")) {
        diff += 7;
      }
      const d = new Date(baseDate);
      d.setDate(d.getDate() + diff);
      return d.toISOString().slice(0, 10);
    }
  }

  return null;
}

/**
 * Heuristic server-side fallback parser used only when GEMINI_API_KEY is not configured or unreachable.
 */
function fallbackParseVoiceInvoice(transcript, todayDate, customers = [], catalogItems = []) {
  const cleanText = String(transcript || "").trim();
  const lower = cleanText.toLowerCase();

  // 1. Status detection
  const status = /\b(estimate|quote)\b/i.test(cleanText) ? "estimate" : "pending";

  // 2. Match or extract client
  let matchedCustomer = null;
  let bestCustScore = 0;
  for (const cust of customers) {
    if (!cust || !cust.name) continue;
    const custNorm = cust.name.toLowerCase();
    if (lower.includes(custNorm)) {
      matchedCustomer = cust;
      bestCustScore = 1;
      break;
    }
    const tokens = custNorm.split(/\s+/).filter((t) => t.length > 2);
    if (tokens.length > 0 && tokens.every((t) => lower.includes(t))) {
      matchedCustomer = cust;
      bestCustScore = 0.9;
      break;
    }
  }

  let extractedClientName = "";
  if (!matchedCustomer) {
    const clientMatch = cleanText.match(
      /(?:invoice|bill|estimate|quote|charge|to|for)\s+(?:client\s+|customer\s+)?([A-Z][a-zA-Z0-9&'.\-]+(?:\s+[A-Z][a-zA-Z0-9&'.\-]+){0,3}?)(?=\s+(?:for|with|at|on|due|including|and|\d|\$)|[,.]|$)/i
    );
    if (clientMatch && clientMatch[1]) {
      extractedClientName = clientMatch[1]
        .replace(/^(?:for|to|client|customer|an?\s+invoice\s+for)\s+/i, "")
        .trim();
    }
    if (extractedClientName) {
      for (const cust of customers) {
        const score = similarityScore(extractedClientName, cust.name);
        if (score > bestCustScore && score >= 0.6) {
          bestCustScore = score;
          matchedCustomer = cust;
        }
      }
    }
  }

  const emailMatch = cleanText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  const phoneMatch = cleanText.match(/\b(\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})\b/);

  const client = matchedCustomer
    ? {
        name: matchedCustomer.name || "",
        email: emailMatch ? emailMatch[1] : matchedCustomer.email || "",
        phone: phoneMatch ? phoneMatch[1] : matchedCustomer.phone || "",
        address1: matchedCustomer.address1 || "",
        address2: matchedCustomer.address2 || "",
        city: matchedCustomer.city || "",
        state: matchedCustomer.state || "",
        zip: matchedCustomer.zip || "",
      }
    : {
        name: extractedClientName || "",
        email: emailMatch ? emailMatch[1] : "",
        phone: phoneMatch ? phoneMatch[1] : "",
        address1: "",
        address2: "",
        city: "",
        state: "",
        zip: "",
      };

  // 3. Extract line items
  const items = [];
  // Split clause after client name
  let itemsSegment = cleanText;
  const forIdx = lower.indexOf(" for ");
  if (forIdx !== -1) {
    itemsSegment = cleanText.slice(forIdx + 5);
    // If the first "for" was "invoice for <Client> for <Items>", advance to the second "for"
    const secondForIdx = itemsSegment.toLowerCase().indexOf(" for ");
    if (secondForIdx !== -1 && secondForIdx < 40 && !/\d|\$/.test(itemsSegment.slice(0, secondForIdx))) {
      itemsSegment = itemsSegment.slice(secondForIdx + 5);
    }
  }

  // Strip trailing due date / tax / discount clauses from itemsSegment
  itemsSegment = itemsSegment
    .replace(/\b(?:due\s+(?:on|in|next|this|tomorrow)[^,.]*|net\s+\d+[^,.]*)/gi, "")
    .replace(/\b(?:with\s+)?\d+(?:\.\d+)?%\s*(?:tax|discount)[^,.]*/gi, "")
    .trim();

  const rawChunks = itemsSegment
    .split(/(?:,\s*(?:and\s+)?|\s+and\s+(?=(?:\d+|a\s+|an\s+|one\s+|two\s+|three\s+|four\s+|five\s+|\$))|\s+plus\s+)/i)
    .map((s) => s.trim())
    .filter(Boolean);

  const wordNumbers = {
    a: 1,
    an: 1,
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
  };

  for (const chunk of rawChunks) {
    // Pattern A: "5 hours of web design at $100 an hour"
    let qty = 1;
    let price = 0;
    let desc = chunk;

    const qtyHoursMatch = chunk.match(
      /^(\d+(?:\.\d+)?|a|an|one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:(hours?|hrs?|units?|days?|items?)\s+(?:of\s+)?)?(.+?)\s+(?:at|for|@)\s*\$?\s*(\d+(?:\.\d+)?)\s*(?:\/\s*hr|per\s+hour|an\s+hour|each|per\s+unit|apiece|dollars?)?$/i
    );
    const priceFirstMatch = chunk.match(
      /^(?:a|an|one)?\s*\$\s*(\d+(?:\.\d+)?)\s+(.+)$/i
    );
    const trailingPriceMatch = chunk.match(
      /^(.+?)\s+(?:for|at|@|-)\s*\$?\s*(\d+(?:\.\d+)?)\s*(?:dollars?)?$/i
    );

    if (qtyHoursMatch) {
      const rawQty = qtyHoursMatch[1].toLowerCase();
      qty = wordNumbers[rawQty] !== undefined ? wordNumbers[rawQty] : parseFloat(rawQty) || 1;
      desc = qtyHoursMatch[3].trim();
      price = parseFloat(qtyHoursMatch[4]) || 0;
    } else if (priceFirstMatch) {
      qty = 1;
      price = parseFloat(priceFirstMatch[1]) || 0;
      desc = priceFirstMatch[2].trim();
    } else if (trailingPriceMatch) {
      desc = trailingPriceMatch[1].trim();
      price = parseFloat(trailingPriceMatch[2]) || 0;
      const leadingQty = desc.match(/^(\d+(?:\.\d+)?|one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:hours?\s+of\s+)?(.+)$/i);
      if (leadingQty) {
        const rq = leadingQty[1].toLowerCase();
        qty = wordNumbers[rq] !== undefined ? wordNumbers[rq] : parseFloat(rq) || 1;
        desc = leadingQty[2].trim();
      }
    }

    desc = desc.replace(/^(?:of|for)\s+/i, "").replace(/[,.]+$/, "").trim();
    if (!desc) continue;

    // Fuzzy match against catalogItems
    let bestItem = null;
    let bestItemScore = 0;
    for (const catItem of catalogItems) {
      if (!catItem || !catItem.description) continue;
      const score = similarityScore(desc, catItem.description);
      if (score > bestItemScore && score >= 0.55) {
        bestItemScore = score;
        bestItem = catItem;
      }
    }

    const finalDescription = bestItem ? bestItem.description : desc.charAt(0).toUpperCase() + desc.slice(1);
    const finalPrice = price > 0 ? price : bestItem && Number(bestItem.price) > 0 ? Number(bestItem.price) : 0;
    const isNonTaxable = /\b(no\s+tax|non[- ]?taxable|tax[- ]?free)\b/i.test(chunk);

    items.push({
      description: finalDescription,
      quantity: qty,
      price: finalPrice,
      taxable: isNonTaxable ? false : bestItem?.taxable !== undefined ? bestItem.taxable !== false : true,
      matchedItemId: bestItem ? bestItem.id || null : null,
    });
  }

  // 4. Tax & discount
  let taxRate = null;
  const taxMatch = cleanText.match(/(\d+(?:\.\d+)?)\s*%\s*tax/i);
  if (taxMatch) {
    taxRate = parseFloat(taxMatch[1]);
  } else if (/\bno\s+tax\b/i.test(cleanText)) {
    taxRate = 0;
  }

  let discount = null;
  let discountType = null;
  const pctDiscount = cleanText.match(/(\d+(?:\.\d+)?)\s*%\s*(?:discount|off)/i);
  const flatDiscount = cleanText.match(/\$\s*(\d+(?:\.\d+)?)\s*(?:discount|off)/i);
  if (pctDiscount) {
    discount = parseFloat(pctDiscount[1]);
    discountType = "percentage";
  } else if (flatDiscount) {
    discount = parseFloat(flatDiscount[1]);
    discountType = "flat";
  }

  const dueDate = parseRelativeDueDate(cleanText, todayDate);

  return {
    matchedCustomerId: matchedCustomer ? matchedCustomer.id || null : null,
    client,
    items,
    issueDate: todayDate || new Date().toISOString().slice(0, 10),
    dueDate,
    taxRate,
    discount,
    discountType,
    status,
    notes: null,
    summary: `Populated ${client.name ? `client "${client.name}"` : "draft"} with ${items.length || 1} line item(s).`,
  };
}

/**
 * Cloud Function: parseVoiceInvoice
 * Uses Gemini API with structured JSON output to extract invoice fields and fuzzy-match
 * against existing customers and catalog items.
 */
exports.parseVoiceInvoice = onCall({ enforceAppCheck: false }, async (request) => {
  const { auth, data } = request;

  if (!auth) {
    throw new HttpsError("unauthenticated", "Authentication is required to use Voice Invoice.");
  }

  const transcript = String(data?.transcript || "").trim();
  if (!transcript) {
    throw new HttpsError("invalid-argument", "A voice transcript is required.");
  }
  if (transcript.length > 3000) {
    throw new HttpsError("invalid-argument", "Voice command is too long (maximum 3000 characters).");
  }

  const todayDate = String(data?.todayDate || new Date().toISOString().slice(0, 10));
  const customers = Array.isArray(data?.customers) ? data.customers.slice(0, 200) : [];
  const catalogItems = Array.isArray(data?.catalogItems) ? data.catalogItems.slice(0, 200) : [];

  const apiKey = geminiApiKey.value() || process.env.GEMINI_API_KEY || "";

  if (!apiKey) {
    console.warn("GEMINI_API_KEY not configured; using server-side heuristic fallback parser.");
    return fallbackParseVoiceInvoice(transcript, todayDate, customers, catalogItems);
  }

  const systemPrompt = `You are an expert AI billing assistant for ScanGo Invoice, a mobile-first invoicing app for contractors, freelancers, and small businesses.
Your job is to parse a user's spoken voice command into a structured invoice draft JSON object.

Today's date is: ${todayDate}

RULES:
1. CLIENT FUZZY MATCHING & VERBAL BEST-GUESS:
   - Check the provided EXISTING_CUSTOMERS list for phonetic, partial, or semantic matches to the client name spoken by the user.
   - If a match is found, set "matchedCustomerId" to that customer's "id" and populate "client" with all of that customer's saved details (name, email, phone, address1, address2, city, state, zip), overriding only if the user explicitly spoke a newer email/phone/address.
   - If NO existing customer matches, set "matchedCustomerId" to null and populate "client.name" (and any spoken email, phone, or address) with a clean, properly capitalized verbal best-guess match from the transcript.
2. CATALOG ITEM FUZZY MATCHING & LINE ITEMS:
   - Extract each billable item, service, labor entry, or material mentioned by the user into the "items" array.
   - Check EXISTING_CATALOG_ITEMS for fuzzy or semantic matches.
   - If a catalog item matches:
     - Set "matchedItemId" to the catalog item's "id".
     - Use the catalog item's "description" (or enrich it if the user specified helpful extra context).
     - If the user explicitly spoke a price/rate, use the spoken price; otherwise use the catalog item's saved "price".
   - If no catalog item matches, set "matchedItemId" to null, write a clean professional "description", and extract the spoken "quantity" (default 1) and unit "price" (default 0).
   - Careful with hourly vs flat amounts: e.g. "5 hours of plumbing at $95 an hour" -> quantity: 5, price: 95. "3 hours of work for $300 total" -> quantity: 3, price: 100.
   - Set "taxable" to true by default, or false if the user says "no tax" or "non-taxable" for that item.
3. DATES, TAX, DISCOUNT, STATUS, NOTES:
   - Resolve relative due dates ("due next Friday", "due in 2 weeks", "Net 30", "due tomorrow") into an exact YYYY-MM-DD string based on Today's date (${todayDate}). If not mentioned, set "dueDate" to null.
   - Set "status" to "estimate" if the user asked for an estimate or quote; otherwise "pending".
   - Extract "taxRate" (number, e.g. 8.25) only if mentioned, otherwise null.
   - Extract "discount" (number) and "discountType" ("percentage" or "flat") only if mentioned, otherwise null.
   - Extract "notes" only if the user dictated a note or memo for the invoice, otherwise null.
   - Provide a concise 1-sentence "summary" describing what was matched and populated.`;

  const userPayload = JSON.stringify({
    spokenTranscript: transcript,
    todayDate,
    EXISTING_CUSTOMERS: customers.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email || "",
      phone: c.phone || "",
      address1: c.address1 || "",
      address2: c.address2 || "",
      city: c.city || "",
      state: c.state || "",
      zip: c.zip || "",
    })),
    EXISTING_CATALOG_ITEMS: catalogItems.map((i) => ({
      id: i.id,
      description: i.description,
      price: Number(i.price) || 0,
      taxable: i.taxable !== false,
    })),
  });

  const responseSchema = {
    type: "OBJECT",
    properties: {
      matchedCustomerId: { type: "STRING", nullable: true },
      client: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          email: { type: "STRING", nullable: true },
          phone: { type: "STRING", nullable: true },
          address1: { type: "STRING", nullable: true },
          address2: { type: "STRING", nullable: true },
          city: { type: "STRING", nullable: true },
          state: { type: "STRING", nullable: true },
          zip: { type: "STRING", nullable: true },
        },
        required: ["name"],
      },
      items: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            description: { type: "STRING" },
            quantity: { type: "NUMBER" },
            price: { type: "NUMBER" },
            taxable: { type: "BOOLEAN" },
            matchedItemId: { type: "STRING", nullable: true },
          },
          required: ["description", "quantity", "price", "taxable"],
        },
      },
      issueDate: { type: "STRING", nullable: true },
      dueDate: { type: "STRING", nullable: true },
      taxRate: { type: "NUMBER", nullable: true },
      discount: { type: "NUMBER", nullable: true },
      discountType: { type: "STRING", nullable: true },
      status: { type: "STRING", nullable: true },
      notes: { type: "STRING", nullable: true },
      summary: { type: "STRING", nullable: true },
    },
    required: ["client", "items"],
  };

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
    const response = await axios.post(
      endpoint,
      {
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: userPayload }],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
          responseSchema,
        },
      },
      {
        timeout: 20000,
      }
    );

    const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error("Empty response from Gemini API.");
    }

    const parsed = JSON.parse(rawText);
    return {
      matchedCustomerId: parsed.matchedCustomerId || null,
      client: {
        name: parsed.client?.name || "",
        email: parsed.client?.email || "",
        phone: parsed.client?.phone || "",
        address1: parsed.client?.address1 || "",
        address2: parsed.client?.address2 || "",
        city: parsed.client?.city || "",
        state: parsed.client?.state || "",
        zip: parsed.client?.zip || "",
      },
      items: Array.isArray(parsed.items)
        ? parsed.items.map((item) => ({
            description: String(item.description || "").trim(),
            quantity: Number(item.quantity) > 0 ? Number(item.quantity) : 1,
            price: Number(item.price) >= 0 ? Number(item.price) : 0,
            taxable: item.taxable !== false,
            matchedItemId: item.matchedItemId || null,
          }))
        : [],
      issueDate: parsed.issueDate || todayDate,
      dueDate: parsed.dueDate || null,
      taxRate: typeof parsed.taxRate === "number" ? parsed.taxRate : null,
      discount: typeof parsed.discount === "number" ? parsed.discount : null,
      discountType: parsed.discountType === "flat" || parsed.discountType === "percentage" ? parsed.discountType : null,
      status: parsed.status === "estimate" ? "estimate" : "pending",
      notes: parsed.notes || null,
      summary: parsed.summary || `Populated invoice draft from voice command.`,
    };
  } catch (err) {
    console.error("Gemini API error in parseVoiceInvoice, falling back to heuristic parser:", err?.response?.data || err.message);
    return fallbackParseVoiceInvoice(transcript, todayDate, customers, catalogItems);
  }
});

// Export helper for unit testing
exports._fallbackParseVoiceInvoice = fallbackParseVoiceInvoice;
