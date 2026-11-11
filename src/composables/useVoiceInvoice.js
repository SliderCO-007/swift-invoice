import { ref, computed, onUnmounted } from 'vue';
import { httpsCallable } from 'firebase/functions';
import { functions } from './useFirebase';
import { format } from 'date-fns';

const SILENCE_AUTO_STOP_MS = 5000;

/**
 * Merges two speech segments while eliminating Android Chrome's cumulative prefix/overlap duplication.
 * Example:
 *   mergeTwoTranscripts("invoice Curtis", "invoice Curtis home") -> "invoice Curtis home"
 *   mergeTwoTranscripts("invoice Curtis home", "Curtis home for new website") -> "invoice Curtis home for new website"
 */
export function mergeTwoTranscripts(prevText, nextText) {
  const a = String(prevText || '').replace(/\s+/g, ' ').trim();
  const b = String(nextText || '').replace(/\s+/g, ' ').trim();
  if (!a) return b;
  if (!b) return a;

  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();

  // Case 1: b is a cumulative superset of a (classic Android Chrome behavior)
  if (bLower.startsWith(aLower)) {
    return b;
  }

  // Case 2: a already ends with b (duplicate emission)
  if (aLower.endsWith(bLower)) {
    return a;
  }

  // Case 3: b is completely contained at the start of a (regression in interim result)
  if (aLower.startsWith(bLower)) {
    return a;
  }

  // Case 4: Word-level suffix/prefix overlap (e.g., a="invoice Curtis home", b="Curtis home for website")
  const wordsA = a.split(' ');
  const wordsB = b.split(' ');
  const maxOverlap = Math.min(wordsA.length, wordsB.length);

  for (let overlap = maxOverlap; overlap >= 1; overlap--) {
    const suffixA = wordsA.slice(wordsA.length - overlap).join(' ').toLowerCase();
    const prefixB = wordsB.slice(0, overlap).join(' ').toLowerCase();
    if (suffixA === prefixB) {
      return [...wordsA, ...wordsB.slice(overlap)].join(' ');
    }
  }

  return `${a} ${b}`;
}

/**
 * Compute a normalized similarity score (0..1) between two strings for client/catalog fuzzy matching.
 */
export function fuzzySimilarity(a, b) {
  if (!a || !b) return 0;
  const normA = String(a).toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const normB = String(b).toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
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
    if (
      tokensB.some(
        (tB) =>
          tB === tA ||
          (tA.length > 3 && tB.startsWith(tA)) ||
          (tB.length > 3 && tA.startsWith(tB))
      )
    ) {
      matches++;
    }
  }
  return matches / Math.max(tokensA.length, tokensB.length);
}

/**
 * Find the best fuzzy match in existing customers list.
 */
export function findBestCustomerMatch(nameQuery, customers = []) {
  if (!nameQuery || !Array.isArray(customers) || !customers.length) return null;
  let best = null;
  let bestScore = 0;
  for (const cust of customers) {
    if (!cust?.name) continue;
    const score = fuzzySimilarity(nameQuery, cust.name);
    if (score > bestScore && score >= 0.6) {
      bestScore = score;
      best = cust;
    }
  }
  return best;
}

/**
 * Find the best fuzzy match in existing catalog items list.
 */
export function findBestCatalogItemMatch(descQuery, catalogItems = []) {
  if (!descQuery || !Array.isArray(catalogItems) || !catalogItems.length) return null;
  let best = null;
  let bestScore = 0;
  for (const item of catalogItems) {
    if (!item?.description || item.type === 'expense-category') continue;
    const score = fuzzySimilarity(descQuery, item.description);
    if (score > bestScore && score >= 0.55) {
      bestScore = score;
      best = item;
    }
  }
  return best;
}

/**
 * Client-side fallback parser if the Cloud Function is unreachable (e.g. offline or local dev).
 */
export function localParseVoiceCommand(transcript, todayDate, customers = [], catalogItems = []) {
  const cleanText = String(transcript || '').trim();
  const lower = cleanText.toLowerCase();

  const status = /\b(estimate|quote)\b/i.test(cleanText) ? 'estimate' : 'pending';

  // 1. Check direct customer match in transcript first
  let matchedCustomer = null;
  for (const cust of customers) {
    if (!cust?.name) continue;
    const custLower = cust.name.toLowerCase();
    if (lower.includes(custLower)) {
      matchedCustomer = cust;
      break;
    }
    const parts = custLower.split(/\s+/).filter((p) => p.length > 2);
    if (parts.length > 0 && parts.every((p) => lower.includes(p))) {
      matchedCustomer = cust;
      break;
    }
  }

  let extractedClientName = '';
  if (!matchedCustomer) {
    const clientMatch = cleanText.match(
      /(?:invoice|bill|estimate|quote|charge|to|for)\s+(?:client\s+|customer\s+)?([a-zA-Z0-9&'.\-]+(?:\s+[a-zA-Z0-9&'.\-]+){0,3}?)(?=\s+(?:for|with|at|on|due|including|and|\d|\$)|[,.]|$)/i
    );
    if (clientMatch && clientMatch[1]) {
      extractedClientName = clientMatch[1]
        .replace(/^(?:for|to|client|customer|an?\s+invoice\s+for|create\s+an?\s+invoice\s+for)\s+/i, '')
        .trim();
      extractedClientName = extractedClientName
        .split(/\s+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }
    if (extractedClientName) {
      matchedCustomer = findBestCustomerMatch(extractedClientName, customers);
    }
  }

  const emailMatch = cleanText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  const phoneMatch = cleanText.match(/\b(\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})\b/);

  const client = matchedCustomer
    ? {
        name: matchedCustomer.name || '',
        email: emailMatch ? emailMatch[1] : matchedCustomer.email || '',
        phone: phoneMatch ? phoneMatch[1] : matchedCustomer.phone || '',
        address1: matchedCustomer.address1 || '',
        address2: matchedCustomer.address2 || '',
        city: matchedCustomer.city || '',
        state: matchedCustomer.state || '',
        zip: matchedCustomer.zip || '',
      }
    : {
        name: extractedClientName || '',
        email: emailMatch ? emailMatch[1] : '',
        phone: phoneMatch ? phoneMatch[1] : '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        zip: '',
      };

  // 2. Parse line items
  let itemsSegment = cleanText;
  const forIdx = lower.indexOf(' for ');
  if (forIdx !== -1) {
    itemsSegment = cleanText.slice(forIdx + 5);
    const secondForIdx = itemsSegment.toLowerCase().indexOf(' for ');
    if (secondForIdx !== -1 && secondForIdx < 45 && !/\d|\$/.test(itemsSegment.slice(0, secondForIdx))) {
      itemsSegment = itemsSegment.slice(secondForIdx + 5);
    }
  }

  itemsSegment = itemsSegment
    .replace(/\b(?:due\s+(?:on|in|next|this|tomorrow)[^,.]*|net\s+\d+[^,.]*)/gi, '')
    .replace(/\b(?:with\s+)?\d+(?:\.\d+)?%\s*(?:tax|discount)[^,.]*/gi, '')
    .trim();

  const rawChunks = itemsSegment
    .split(/(?:,\s*(?:and\s+)?|\s+and\s+(?=(?:\d+|a\s+|an\s+|one\s+|two\s+|three\s+|four\s+|five\s+|six\s+|seven\s+|eight\s+|nine\s+|ten\s+|\$))|\s+plus\s+)/i)
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

  const items = [];
  for (const chunk of rawChunks) {
    let qty = 1;
    let price = 0;
    let desc = chunk;

    const qtyHoursMatch = chunk.match(
      /^(\d+(?:\.\d+)?|a|an|one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:(hours?|hrs?|units?|days?|items?)\s+(?:of\s+)?)?(.+?)\s+(?:at|for|@)\s*\$?\s*(\d+(?:\.\d+)?)\s*(?:\/\s*hr|per\s+hour|an\s+hour|each|per\s+unit|apiece|dollars?)?$/i
    );
    const priceFirstMatch = chunk.match(/^(?:a|an|one)?\s*\$\s*(\d+(?:\.\d+)?)\s+(.+)$/i);
    const trailingPriceMatch = chunk.match(/^(.+?)\s+(?:for|at|@|-)\s*\$?\s*(\d+(?:\.\d+)?)\s*(?:dollars?)?$/i);

    if (qtyHoursMatch) {
      const rq = qtyHoursMatch[1].toLowerCase();
      qty = wordNumbers[rq] !== undefined ? wordNumbers[rq] : parseFloat(rq) || 1;
      desc = qtyHoursMatch[3].trim();
      price = parseFloat(qtyHoursMatch[4]) || 0;
    } else if (priceFirstMatch) {
      qty = 1;
      price = parseFloat(priceFirstMatch[1]) || 0;
      desc = priceFirstMatch[2].trim();
    } else if (trailingPriceMatch) {
      desc = trailingPriceMatch[1].trim();
      price = parseFloat(trailingPriceMatch[2]) || 0;
      const leadingQty = desc.match(
        /^(\d+(?:\.\d+)?|one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:hours?\s+of\s+)?(.+)$/i
      );
      if (leadingQty) {
        const rq = leadingQty[1].toLowerCase();
        qty = wordNumbers[rq] !== undefined ? wordNumbers[rq] : parseFloat(rq) || 1;
        desc = leadingQty[2].trim();
      }
    } else {
      const leadingQtyOnly = chunk.match(
        /^(\d+(?:\.\d+)?|one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:hours?\s+of\s+|hrs?\s+of\s+|units?\s+of\s+)?(.+)$/i
      );
      if (leadingQtyOnly) {
        const rq = leadingQtyOnly[1].toLowerCase();
        qty = wordNumbers[rq] !== undefined ? wordNumbers[rq] : parseFloat(rq) || 1;
        desc = leadingQtyOnly[2].trim();
      }
    }

    desc = desc.replace(/^(?:of|for)\s+/i, '').replace(/[,.]+$/, '').trim();
    if (!desc) continue;

    const matchedCatItem = findBestCatalogItemMatch(desc, catalogItems);
    const finalDescription = matchedCatItem
      ? matchedCatItem.description
      : desc.charAt(0).toUpperCase() + desc.slice(1);
    const finalPrice =
      price > 0 ? price : matchedCatItem && Number(matchedCatItem.price) > 0 ? Number(matchedCatItem.price) : 0;
    const isNonTaxable = /\b(no\s+tax|non[- ]?taxable|tax[- ]?free)\b/i.test(chunk);

    items.push({
      description: finalDescription,
      quantity: qty,
      price: finalPrice,
      taxable: isNonTaxable
        ? false
        : matchedCatItem?.taxable !== undefined
        ? matchedCatItem.taxable !== false
        : true,
      matchedItemId: matchedCatItem?.id || null,
    });
  }

  // 3. Relative due date
  let dueDate = null;
  const baseDate = todayDate ? new Date(`${todayDate}T12:00:00`) : new Date();
  const daysMatch = lower.match(/(?:due\s+in|in|net)\s+(\d+)\s*(?:days?)?/i);
  if (daysMatch) {
    const days = parseInt(daysMatch[1], 10);
    if (!isNaN(days) && days >= 0 && days <= 365) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + days);
      dueDate = format(d, 'yyyy-MM-dd');
    }
  } else if (/\bdue\s+tomorrow\b/.test(lower)) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + 1);
    dueDate = format(d, 'yyyy-MM-dd');
  } else if (/\bdue\s+(?:next\s+week|in\s+a\s+week)\b/.test(lower)) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + 7);
    dueDate = format(d, 'yyyy-MM-dd');
  } else {
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    for (let i = 0; i < weekdays.length; i++) {
      const dayRegex = new RegExp(`\\b(?:due\\s+)?(next|this|on)?\\s*${weekdays[i]}\\b`, 'i');
      const m = lower.match(dayRegex);
      if (m && lower.includes('due')) {
        const currentDay = baseDate.getDay();
        let diff = (i - currentDay + 7) % 7;
        if (diff === 0 || (m[1] && m[1].toLowerCase() === 'next')) diff += 7;
        const d = new Date(baseDate);
        d.setDate(d.getDate() + diff);
        dueDate = format(d, 'yyyy-MM-dd');
        break;
      }
    }
  }

  let taxRate = null;
  const taxMatch = cleanText.match(/(\d+(?:\.\d+)?)\s*%\s*tax/i);
  if (taxMatch) taxRate = parseFloat(taxMatch[1]);
  else if (/\bno\s+tax\b/i.test(cleanText)) taxRate = 0;

  let discount = null;
  let discountType = null;
  const pctDiscount = cleanText.match(/(\d+(?:\.\d+)?)\s*%\s*(?:discount|off)/i);
  const flatDiscount = cleanText.match(/\$\s*(\d+(?:\.\d+)?)\s*(?:discount|off)/i);
  if (pctDiscount) {
    discount = parseFloat(pctDiscount[1]);
    discountType = 'percentage';
  } else if (flatDiscount) {
    discount = parseFloat(flatDiscount[1]);
    discountType = 'flat';
  }

  return {
    matchedCustomerId: matchedCustomer?.id || null,
    client,
    items,
    issueDate: todayDate,
    dueDate,
    taxRate,
    discount,
    discountType,
    status,
    notes: null,
    summary: `Populated ${client.name ? `client "${client.name}"` : 'draft'} with ${items.length || 1} item(s).`,
  };
}

export function useVoiceInvoice() {
  const isListening = ref(false);
  const isParsing = ref(false);
  const transcript = ref('');
  const interimTranscript = ref('');
  const error = ref(null);

  const SpeechRecognitionClass =
    typeof window !== 'undefined'
      ? window.SpeechRecognition || window.webkitSpeechRecognition || null
      : null;

  const isSpeechSupported = computed(() => !!SpeechRecognitionClass);

  // Detect mobile browser (Android Chrome / iOS Safari) where continuous=true causes cumulative duplication
  const isMobileBrowser =
    typeof navigator !== 'undefined' &&
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent || '');

  let recognition = null;
  let baseTranscriptBeforeSession = '';
  let shouldKeepListening = false;
  let silenceTimer = null;

  const clearSilenceTimer = () => {
    if (silenceTimer) {
      clearTimeout(silenceTimer);
      silenceTimer = null;
    }
  };

  const resetSilenceTimer = () => {
    clearSilenceTimer();
    silenceTimer = setTimeout(() => {
      // 5-second pause reached -> automatically stop listening
      stopListening();
    }, SILENCE_AUTO_STOP_MS);
  };

  const initRecognition = () => {
    if (!SpeechRecognitionClass) return null;
    const rec = new SpeechRecognitionClass();
    rec.lang = (typeof navigator !== 'undefined' && navigator.language) || 'en-US';
    rec.interimResults = true;
    // Use continuous=false on mobile to prevent Android Chrome's cumulative prefix duplication buffer;
    // onend automatically restarts while within the 5-second pause window.
    rec.continuous = !isMobileBrowser;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      isListening.value = true;
      error.value = null;
      resetSilenceTimer();
    };

    rec.onresult = (event) => {
      resetSilenceTimer();

      let sessionFinal = '';
      let sessionInterim = '';

      for (let i = 0; i < event.results.length; i++) {
        const res = event.results[i];
        const textPiece = (res[0]?.transcript || '').trim();
        if (!textPiece) continue;

        if (res.isFinal) {
          sessionFinal = mergeTwoTranscripts(sessionFinal, textPiece);
        } else {
          sessionInterim = mergeTwoTranscripts(sessionInterim, textPiece);
        }
      }

      // If interim starts with sessionFinal, strip the already-finalized prefix from interim display
      if (
        sessionFinal &&
        sessionInterim &&
        sessionInterim.toLowerCase().startsWith(sessionFinal.toLowerCase())
      ) {
        sessionInterim = sessionInterim.slice(sessionFinal.length).trim();
      }

      transcript.value = mergeTwoTranscripts(baseTranscriptBeforeSession, sessionFinal);
      interimTranscript.value = sessionInterim;
    };

    rec.onerror = (event) => {
      if (event.error === 'no-speech') {
        // Silence during a mobile segment; let silenceTimer govern the 5s cutoff
        return;
      }
      if (event.error === 'aborted') {
        return;
      }
      shouldKeepListening = false;
      clearSilenceTimer();

      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        error.value =
          "Microphone access was blocked. Please allow microphone permissions in your browser, or tap the text box below and use your phone keyboard's dictation mic.";
      } else if (event.error === 'audio-capture') {
        error.value = 'No microphone was detected on this device.';
      } else {
        error.value = `Speech recognition error (${event.error}). You can also type or use keyboard dictation below.`;
      }
      isListening.value = false;
    };

    rec.onend = () => {
      // Commit any remaining interim text using deduplicating merge
      if (interimTranscript.value) {
        transcript.value = mergeTwoTranscripts(transcript.value, interimTranscript.value);
        interimTranscript.value = '';
      }
      baseTranscriptBeforeSession = transcript.value.trim();

      // If still within the 5-second pause window and user hasn't manually stopped, restart seamlessly on mobile
      if (shouldKeepListening && silenceTimer !== null) {
        try {
          recognition = initRecognition();
          recognition.start();
          return;
        } catch (restartErr) {
          // Fall through to stop cleanly
        }
      }

      clearSilenceTimer();
      shouldKeepListening = false;
      isListening.value = false;
    };

    return rec;
  };

  const startListening = () => {
    error.value = null;
    if (!SpeechRecognitionClass) {
      error.value =
        "Live browser speech recognition isn't supported in this browser. Tap the text field below and use your phone keyboard's microphone button to dictate!";
      return;
    }

    try {
      if (recognition && isListening.value) {
        stopListening();
        return;
      }
      shouldKeepListening = true;
      baseTranscriptBeforeSession = transcript.value.trim();
      interimTranscript.value = '';
      recognition = initRecognition();
      recognition.start();
      resetSilenceTimer();
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      error.value = 'Could not start microphone. Please try again.';
      shouldKeepListening = false;
      clearSilenceTimer();
      isListening.value = false;
    }
  };

  const stopListening = () => {
    shouldKeepListening = false;
    clearSilenceTimer();
    if (recognition) {
      try {
        recognition.stop();
      } catch (e) {
        // ignore
      }
    }
    if (interimTranscript.value) {
      transcript.value = mergeTwoTranscripts(transcript.value, interimTranscript.value);
      interimTranscript.value = '';
    }
    baseTranscriptBeforeSession = transcript.value.trim();
    isListening.value = false;
  };

  const toggleListening = () => {
    if (isListening.value) {
      stopListening();
    } else {
      startListening();
    }
  };

  const clearTranscript = () => {
    stopListening();
    transcript.value = '';
    interimTranscript.value = '';
    baseTranscriptBeforeSession = '';
    error.value = null;
  };

  /**
   * Sends the spoken transcript + existing customers & catalog items to the `parseVoiceInvoice`
   * Cloud Function (with local fuzzy-match enrichment and fallback).
   */
  const parseVoiceCommand = async (rawText, { customers = [], items = [] } = {}) => {
    stopListening();
    const finalTranscript = String(rawText || transcript.value || '').trim();
    if (!finalTranscript) {
      error.value = 'Please speak or enter your invoice details first.';
      return null;
    }

    isParsing.value = true;
    error.value = null;

    const todayDate = format(new Date(), 'yyyy-MM-dd');
    const cleanCustomers = (customers || []).map((c) => ({
      id: c.id,
      name: c.name || '',
      email: c.email || '',
      phone: c.phone || '',
      address1: c.address1 || '',
      address2: c.address2 || '',
      city: c.city || '',
      state: c.state || '',
      zip: c.zip || '',
    }));

    const cleanCatalogItems = (items || [])
      .filter((i) => i.type !== 'expense-category' && i.description)
      .map((i) => ({
        id: i.id,
        description: i.description,
        price: Number(i.price) || 0,
        taxable: i.taxable !== false,
      }));

    try {
      const callable = httpsCallable(functions, 'parseVoiceInvoice');
      const response = await callable({
        transcript: finalTranscript,
        todayDate,
        customers: cleanCustomers,
        catalogItems: cleanCatalogItems,
      });

      const result = response.data;
      if (!result || typeof result !== 'object') {
        throw new Error('Invalid response from AI parser.');
      }

      // Post-process & verify fuzzy customer match
      let matchedCust = null;
      if (result.matchedCustomerId) {
        matchedCust = cleanCustomers.find((c) => c.id === result.matchedCustomerId) || null;
      }
      if (!matchedCust && result.client?.name) {
        matchedCust = findBestCustomerMatch(result.client.name, cleanCustomers);
      }

      if (matchedCust) {
        result.matchedCustomerId = matchedCust.id;
        result.client = {
          name: matchedCust.name,
          email: result.client?.email || matchedCust.email || '',
          phone: result.client?.phone || matchedCust.phone || '',
          address1: result.client?.address1 || matchedCust.address1 || '',
          address2: result.client?.address2 || matchedCust.address2 || '',
          city: result.client?.city || matchedCust.city || '',
          state: result.client?.state || matchedCust.state || '',
          zip: result.client?.zip || matchedCust.zip || '',
        };
      }

      // Post-process & verify fuzzy catalog item matches
      if (Array.isArray(result.items)) {
        result.items = result.items.map((line) => {
          let matchedCat = null;
          if (line.matchedItemId) {
            matchedCat = cleanCatalogItems.find((i) => i.id === line.matchedItemId) || null;
          }
          if (!matchedCat && line.description) {
            matchedCat = findBestCatalogItemMatch(line.description, cleanCatalogItems);
          }
          if (matchedCat) {
            return {
              ...line,
              matchedItemId: matchedCat.id,
              description: line.description || matchedCat.description,
              price: Number(line.price) > 0 ? Number(line.price) : Number(matchedCat.price) || 0,
              taxable: line.taxable !== undefined ? line.taxable !== false : matchedCat.taxable !== false,
            };
          }
          return {
            description: line.description || 'Service / Item',
            quantity: Number(line.quantity) > 0 ? Number(line.quantity) : 1,
            price: Number(line.price) >= 0 ? Number(line.price) : 0,
            taxable: line.taxable !== false,
            matchedItemId: null,
          };
        });
      }

      return {
        ...result,
        rawTranscript: finalTranscript,
      };
    } catch (err) {
      console.warn('Cloud Function parseVoiceInvoice fallback triggered:', err?.message || err);
      const fallbackResult = localParseVoiceCommand(
        finalTranscript,
        todayDate,
        cleanCustomers,
        cleanCatalogItems
      );
      return {
        ...fallbackResult,
        rawTranscript: finalTranscript,
      };
    } finally {
      isParsing.value = false;
    }
  };

  onUnmounted(() => {
    stopListening();
  });

  return {
    isListening,
    isParsing,
    transcript,
    interimTranscript,
    error,
    isSpeechSupported,
    startListening,
    stopListening,
    toggleListening,
    clearTranscript,
    parseVoiceCommand,
  };
}
