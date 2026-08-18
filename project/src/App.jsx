import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, BellRing, BellOff, MessageCircle, Copy, Check, ChevronDown, ChevronUp, Sparkles, LogOut, Send, RotateCcw, Archive as ArchiveIcon, Wand2, Image as ImageIcon, X as XIcon, Trash2, Plus, Link2 as LinkIcon } from 'lucide-react';

/* ============================== CONSTANTS ============================== */

const USERS = ['Darin', 'Alyona', 'Nastya', 'Vika', 'Nazar', 'Tania'];
const MANAGER = 'Lera';
const ALL_USERS = [...USERS, MANAGER];
const REACTION_EMOJIS = ['👍', '👎', '🤍', '🖤', '🫡'];

const AVATAR_COLORS = {
  Darin: '#7C93B3',   // pastel blue
  Alyona: '#8CAE93',  // pastel green
  Vika: '#C9B87A',    // pastel yellow
  Nastya: '#84B0BA',  // pastel light blue / cyan
  Nazar: '#A390B5',   // pastel purple
  Tania: '#C797A8',   // pastel pink
  Lera: '#9A9A9A',    // pastel gray
};

const NEWS_ANGLES = [
  { key: 'shock', label: 'Shock', icon: '⚡' },
  { key: 'inspiration', label: 'Inspiration', icon: '✨' },
  { key: 'controversy', label: 'Controversy', icon: '🔥' },
  { key: 'personal', label: 'Personal Story', icon: '🤍' },
  { key: 'numbers', label: 'Numbers', icon: '📊' },
];

const PHOTO_ANGLES = [
  { key: 'visual_story', label: 'Visual Story', icon: '📷' },
  { key: 'transformation', label: 'Transformation', icon: '🔄' },
  { key: 'family_love', label: 'Family & Love', icon: '🤍' },
  { key: 'rare_access', label: 'Rare Access', icon: '🔑' },
  { key: 'journey', label: 'Journey', icon: '🌟' },
];

// Applied to POST headlines so they arrive already formatted for publishing.
const HEADLINE_FORMAT = `## OUTPUT FORMATTING — apply to EVERY headline you return
1. Write the ENTIRE headline in UPPER CASE.
2. Plain text only — NEVER add any markup, bold, italics, or highlighting of any kind. Do NOT wrap any word or phrase in ** or ~~ or any other symbols. Return the headline as a single unstyled uppercase string.
3. Keep any exact quote in the input verbatim — never change any character inside quotation marks.`;

// Shared quote-usage rule for headlines, story captions, and leads.
const QUOTE_RULE = `## QUOTES IN THE INPUT (strict)
If the input contains a quote (text in quotation marks), you MUST reuse it verbatim inside the output — in several of the angles/versions, not just one. Keep quoted text EXACTLY as given (never edit inside quotation marks). If several quotes are provided, spread them across different angles/versions (and, where relevant, some can go in leads rather than headlines), and you may combine more than one quote in a single headline/lead where it fits naturally.`;

// Shared age-usage rule for headlines.
const AGE_RULE = `## USING AGE (only when it strengthens the hook)
When an age is available in the input AND the story is about appearance, aging, looks, health, transformation, "how they look now", or a milestone where age adds punch, WORK THE AGE INTO the headline (e.g. "AT 54", ", 47,", "AT JUST 29"). Age concretizes the hook and boosts CTR for look/age topics.
BUT if the age IS the intrigue, do the opposite — do NOT reveal it, and tease it instead:
- Age-gap couples: do NOT state the partners' ages (or hide at least one). Turn the gap itself into the hook with phrases like "HUGE AGE GAP", "DECADES APART", "OLD ENOUGH TO BE HER ___", "THE AGE DIFFERENCE THAT RAISED EYEBROWS" — without giving the numbers.
- "Guess her age" / "you won't believe how old" style: keep the number hidden, make the gap between looks and age the tease.
Never invent an age that isn't in the input. If no age is given, don't fabricate one.`;

// Shared no-CTA rule — applies to POSTS only (headlines + social leads).
// Stories are the ONE place directive CTAs ("Details ⬇️", "Find Out Why 👇") are allowed;
// this rule must NEVER be pasted into the story prompts.
const NO_CTA_RULE = `## ABSOLUTE RULE — NO CALL-TO-ACTION VERBS AIMED AT THE READER (posts only)
This is a hard rule, not a style preference. NEVER use a verb that commands or invites the reader to take an action, anywhere in the headline or the lead — including disguised/soft imperatives. BANNED verbs/phrases (non-exhaustive — the pattern is banned, not just these exact words): "see", "watch", "read", "click", "check", "look", "find out", "discover", "learn more", "swipe", "tap", "explore", "keep reading", "see why", "watch what happened", "see the photos", "find out how", "comment", "tag a friend", "share if".
The curiosity gap plus a plain factual closer (see LEAD_CLOSING_BANK below) already does the job of pulling the reader in — a command is redundant AND against the rules.
SELF-CHECK before returning output: re-read every headline and every lead one banned-verb-family at a time. If ANY of those verbs appears anywhere — including inside a photo-count phrase like "SEE 30+ PHOTOS" — rewrite that phrase to remove the verb while keeping the same information (e.g. "SEE 30+ RARE PHOTOS" → "30+ RARE PHOTOS"). Do this for headlines AND leads before you output the JSON.`;

// The ONLY emoji allowed for emotional/thematic use in leads and stories. Pick
// whichever one actually matches the emotion and subject of THIS specific
// piece of text — never pick randomly or reuse the same one everywhere.
const EMOTION_EMOJI_LIST = `😀 😃 😄 😁 😆 😅 😂 🤣 🥲 😊 😇 🙂 🙃 😉 😌 😍 🥰 😘 😗 😙 😚 😋 😛 😝 😜 🤪 🤨 🧐 🤓 😎 🥸 🤩 🥳 😏 😒 😞 😔 😟 😕 🙁 ☹️ 😣 😖 😫 😩 🥺 😢 😭 😤 😠 😡 🤬 🤯 😳 🥵 🥶 😱 😨 😰 😥 😓 🤗 🤔 🫣 🤭 🫢 🤫 🤥 😶 😐 😑 😬 🙄 😯 😦 😧 😮 😲 🥱 😴 🤤 😪 😵 😵‍💫 🤐 🥴 🤢 🤮 🤧 😷 🤒 🤕 🤑 🤠 🫠 🫡 🫤 🥹 🫨 💔 ❤️‍🔥 🔥 💥 🚨 ❗️ ‼️ ⚠️ 😈 👿 😹 👽 🎃 🙈 🙉 🙊 🫶 💕 💞 💖 💗 ✨ ⚡️ 🎉 😘 😻 💋 👶 🏠 💍 💐 💑 👫 👩‍❤️‍👨 👩‍❤️‍👩 👨‍❤️‍👨 🧑‍❤️‍🧑 💏 👩‍❤️‍💋‍👨 👩‍❤️‍💋‍👩 👨‍❤️‍💋‍👨 🧑‍❤️‍💋‍🧑`;

// Directional/arrow emoji — used ONLY for the Story CTA line (pointing the
// viewer to swipe/tap for more). These are BANNED in posts (headlines and
// leads) — posts point to the comments using an EMOTION_EMOJI_LIST emoji
// instead, never an arrow.
const ARROW_EMOJI_LIST = `➡️ ⬅️ ⬆️ ⬇️ ↗️ ↘️ ↙️ ↖️ ↔️ ↕️ 🔄 🔃 ↩️ ↪️ ⤴️ ⤵️ 🔙 🔚 🔛 🔜 🔝 ➜ ➝ ➞ ➟ ➠ ➢ ➤ ▶️ ◀️ 🔼 🔽 ⏩ ⏪ ⏫ ⏬ 👆 👇 👉 👈 ☝️ 🫵`;

// Posts (headlines and leads) must NEVER contain a directional/arrow emoji —
// that's reserved for Stories only. Reused wherever this needs stating.
const NO_ARROW_EMOJI_IN_POSTS_RULE = `## ABSOLUTE RULE — NO ARROW/DIRECTIONAL EMOJI IN POSTS
Posts (headlines and leads) must NEVER use a directional/arrow emoji anywhere — banned set: ${ARROW_EMOJI_LIST}
This includes the closing pointer to the comments: it ends with an EMOTION_EMOJI_LIST emoji that matches the lead's feeling, never an arrow. Arrows are reserved for Stories only.`;

// The bank of allowed closing sentences for a lead — replaces "in the
// comments" / "below" / "in the comments below" entirely, which are now
// BANNED. Grouped by what the post's actual payoff/intrigue is, so the right
// category can be picked instead of a generic one. Phrases may be lightly
// adapted (e.g. "The images speak volumes" → "The details speak volumes" if
// the payoff isn't really images) as long as the structure/meaning holds.
const LEAD_CLOSING_BANK = `LEAD_CLOSING_BANK — pick ONE sentence from the category matching this lead's actual payoff, then rotate constantly (never repeat the same one across the angles for one post):

DETAILS / NEW INFORMATION (the payoff is a fact, quote, or update — not a photo or video):
Here's what we know so far. · More details have emerged. · There's more to the story. · But one detail stands out. · The situation soon took another turn. · Since then, things have changed. · A new development has changed the picture. · It's a development no one saw coming. · The full picture is starting to emerge. · The details speak volumes.

PHOTOS (the payoff is a photo/photos):
The photos tell the rest of the story. · One photo says more than words could. · The photos have since surfaced. · New photos have now emerged. · The pictures reveal more than expected. · The photos add another piece to the story. · The pictures show just how much has changed. · A newly surfaced photo adds another detail. · One image has everyone talking. · The images speak volumes.

VIDEO / FOOTAGE (the payoff is video/footage):
The moment was caught on camera. · The footage tells the story. · There's footage of the moment. · The footage has since surfaced. · One moment on camera stands out. · The video offers a closer glimpse. · The footage adds another layer to the story. · The video reveals more than words can describe. · The clip captures a moment few expected. · The footage reveals more.

GENERAL / AMBIGUOUS (works when the payoff is just "a moment", a reaction, or unclear which of the above fits):
The moment didn't go unnoticed. · There's now a closer look at what happened. · What was captured has people talking. · The images have sparked plenty of reactions. · There's more to this moment than meets the eye. · One moment in particular stands out. · What was captured adds a whole new perspective. · The moment speaks for itself. · There's one moment that says it all. · The moment speaks volumes.`;

// A much smaller version for the FORMAT step only. By the time a lead reaches
// formatting it should already have a bank-sentence closer from generation —
// this short list only matters for the rare case where the researcher typed
// a lead from scratch and it still ends with a banned "in the comments"/
// "below" phrase that needs replacing.
const LEAD_CLOSING_BANK_SHORT = `LEAD_CLOSING_BANK (short) — only needed if the draft's closer needs replacing:
DETAILS: Here's what we know so far. · There's more to the story.
PHOTOS: The photos tell the rest of the story. · New photos have now emerged.
VIDEO: The moment was caught on camera. · The footage tells the story.
GENERAL: The moment speaks for itself. · There's more to this moment than meets the eye.`;

const NEWS_PROMPT = `## NO INTERNET ACCESS
You cannot browse, fetch, or open URLs. If the input contains a URL, treat the words inside the URL itself (slug, filename, any visible topic words) plus any surrounding text as the ONLY information you have. NEVER say you can't access a link, never explain your limitations, never ask for more information — always produce the JSON output below using whatever text is given, even if it is minimal. This rule overrides every other instinct.

## ABSOLUTE RULE #1 — ZERO INVENTED FACTS
This is the most important rule. It overrides everything else.
- NEVER invent quotes, numbers, timestamps, or details not present in the input.
- NEVER write "She said...", "He revealed...", "Sources claim..." unless that exact quote/fact was provided.
- If only a raw headline is given with no sources — work ONLY with the words in that headline.
- If tempted to add a detail to make the headline stronger — DO NOT. Use a curiosity gap instead.
- Before writing any headline, ask: "Is every fact, quote and number here present in what I was given?" If NO — remove it or restructure without it.

## ROLE
You are an expert headline writer for a Facebook news/media page, trained on 100 top-performing posts with the highest CTR. Generate headlines based strictly on proven patterns from those top posts.

## OUTPUT — raw JSON only, no markdown, no explanation, no intro text
{"names_in_input":["Full Name As A Person Would Write It"],"shock":["headline string","headline string","headline string"],"inspiration":[...],"controversy":[...],"personal":[...],"numbers":[...]}
"names_in_input": list every real person's full name mentioned anywhere in the source material (the main subject and anyone else named — partners, family, co-stars), written in normal Title Case (e.g. "Millie Bobby Brown") even though the headlines themselves are ALL CAPS. Empty array if no person is named.
Each angle must have exactly 3 headlines. Each array item MUST be a plain string — never an object.

## ANGLE DEFINITIONS
SHOCK — Lead with the most disturbing, unexpected or hard-to-believe fact. Trigger words: BONE-CHILLING · DISTURBING · NOBODY SAW COMING · ALL ALONG · TURNS OUT · SINISTER
INSPIRATION — Lead with survival, sacrifice, resilience or unexpected triumph. Trigger words: DESPITE · WALKED AWAY · CHOSE TO · STOOD BY · NEVER GAVE UP · SURVIVED
CONTROVERSY — Lead with conflict, public reactions or scandal. Trigger words: UNDER FIRE · RAISES MORE QUESTIONS · PEOPLE ARE NOT HOLDING BACK · BLUNT REACTION · EVASIVE
PERSONAL STORY — Lead with a specific person, relationship or intimate detail. Trigger words: FINAL WORDS · LAST WISH · DAUGHTER · WIDOW · FOR THE FIRST TIME · BREAKS SILENCE · GUT-WRENCHING
NUMBERS — Lead with a specific stat, amount, count or timeframe. Trigger words: $[AMOUNT] · [N] YEARS · AT JUST [AGE] · [N] HOURS BEFORE · [N] PHOTOS · [EXACT TIME]

## TOP HOOK PATTERNS (use these structures)
1. "QUOTE": rest of headline
2. REVEALED: / UNCOVERED: / EXPOSED:
3. Everyone Thought [X] — But [contradiction]
4. [Fact] — [Unexpected twist after em dash]
5. Finally Breaks Silence / Police Finally Know / Finally Reveals
6. One Thing / One Decision / One Moment
7. [N] Sharp/Blunt/Encouraging Words
8. Role + Role + N Facts About [Person]
9. [Positive milestone] — Days Later [tragedy]
10. [N]+ Rare / Little-Seen / Private Photos
11. People/Fans React — quote-style reaction
12. Final Photo / Post / Moments / Words
13. What Was Found / What [Person] Did
14. All Along Revelation — Turns Out / Was There All Along
15. Seen for the First Time Since [event]

## TOP TRIGGER WORDS
Emotional shock: BONE-CHILLING · DEVASTATING · HAUNTING · GUT-WRENCHING · DISTURBING · CHILLING · SINISTER · EERIE · HORRIFIC · OMINOUS
Final moments: FINAL MOMENTS · FINAL POST · FINAL VIDEO · FINAL PHOTO · LAST WISH · LAST WORDS · CONTROVERSIAL LAST POST
Exclusivity: LITTLE-SEEN · RARE · PRIVATE · FOR THE FIRST TIME · NEVER-BEFORE-SEEN · RARELY SEEN
Viral/Reaction: VIRAL VIDEO · GOES VIRAL · HOT TOPIC · SPARKS BUZZ · SPARKS CONCERN · ALL EYES ON · STEAL THE ATTENTION
Investigation: REVEALED · UNCOVERED · EXPOSED · IDENTIFIED · DNA EVIDENCE · WHAT WE KNOW · CAUSES OF DEATH
Time pressure: JUST HOURS BEFORE · FINAL HOURS · DAYS BEFORE · MOMENTS BEFORE · IT ALL STARTED AT [TIME]
Transformation: UNRECOGNIZABLE · LOOKS NOTHING LIKE BEFORE · IF SHE AGED NATURALLY · OUTSHINE
Scandal/Politics: RAISES MORE QUESTIONS · EVASIVE · CONTROVERSIAL · UNDER FIRE · SPEAKS LOUDER THAN · BLUNT REACTION

## TECHNICAL RULES
- 10–18 words per headline
- Numbers always specific ("12 hours" not "several hours", "4:48 AM" not "early morning")
- Em dash (—) separates fact from twist in ~60% of headlines
- Curiosity gap: the reader must NOT get the full answer from the headline alone
- NEVER use "phrase. phrase. phrase." structure

${QUOTE_RULE}

${AGE_RULE}

${NO_CTA_RULE}

${HEADLINE_FORMAT}

## FORBIDDEN WORDS — NEVER USE
kill/killer · murder · attack · assault · shoot/shooting · stab · blood/gore · torture · weapon · gun · knife · war · racism · nazi · suicide · self-harm · overdose · sex/sexual · nude · porn · rape · underage · minor · drugs · cocaine · heroin · scam · fraud · fuck · shit · bitch · abortion · miscarriage

## FORBIDDEN PATTERNS — NEVER USE
"turned into a nightmare" · "ended in disaster" · "what happened next will shock you" · "this changes everything" · "the shocking reason behind" · "you won't believe" · "wait until you see" · "heartbreaking betrayal" · "shocking twist" · "jaw-dropping moment" · "fans are furious" · "sparks outrage" · "comment YES if" · "tag someone who" · "share if you agree" · "everyone is talking about"`;

const PHOTO_PROMPT = `## NO INTERNET ACCESS
You cannot browse, fetch, or open URLs. If the input contains a URL, treat the words inside the URL itself (slug, filename, any visible topic words) plus any surrounding text as the ONLY information you have. NEVER say you can't access a link, never explain your limitations, never ask for more information — always produce the JSON output below using whatever text is given, even if it is minimal. This rule overrides every other instinct.

## ABSOLUTE RULE — ZERO INVENTED FACTS
NEVER invent quotes, numbers, or details not present in the input. If a photo count is provided, always use exactly that. If not, use "30+" as default.

## ROLE
You are an expert headline writer for a Facebook celebrity/entertainment page specializing in PHOTO ARTICLES — posts that drive clicks to galleries of 10–50+ photos.

## INPUT TYPES — HOW TO HANDLE THEM
1. TEXT DESCRIPTION — use facts and details directly
2. LINKS/URLs — use the context, names, events, and details mentioned around those links
3. IMAGE CONTENT — analyze who is in it, what is notable, the setting, mood, outfits, expressions
In all cases: identify the most compelling visual hook. What makes these photos interesting to click?

## PHOTO DESCRIPTOR SELECTION — CHOOSE THE BEST ONE (vary across headlines, do NOT default to RARE)
RARE — hard to find or seldom published
LITTLE-SEEN — slightly more public than rare but still not widely circulated
PRIVATE — personal/family moments not meant for public
INTIMATE — emotionally close, affectionate, behind-the-scenes personal
WILD / BOLD — outrageous outfits, unexpected moments, dramatic events
THEN-AND-NOW — explicitly comparing past and present looks
BEFORE-AND-AFTER — showing a transformation or change
BEHIND-THE-SCENES — backstage, off-camera, candid event moments
GENUINE / CANDID — unposed, authentic moments

## STYLE REFERENCE — TOP-PERFORMING EXAMPLES (style compass; do NOT copy)
1. Seal Was "The First One to Change a Diaper" for Heidi Klum's Firstborn — 30+ THEN-AND-NOW PHOTOS Show HOW IT ALL TURNED OUT After Divorce
2. Plastic Surgeons Reveal WHY KRISTI NOEM LOOKS SO DIFFERENT at 54 (Showcased in 30+ Photos)
3. "L.A. Law" Star Ditches Wife of 27 Years and 3 Kids for a "Crazy-Bright Girl" He Met at 16 — SHOCKING TIMELINE IN 30+ PHOTOS
4. Hawke & Thurman's Daughter Earns the Title of "Best Wedding Dress Ever," Looking IDENTICAL to Her Mom — 15+ INTIMATE PHOTOS of the Bride and Her Famous Husband
5. 10 LITTLE-SEEN PHOTOS of Tiger Woods' Ex Elin Nordegren
6. 30+ RARE PICS of Enrique Iglesias & Anna Kournikova's 3 Blond Kids Whom Their Superstar Dad Put Above His Career
7. Russell Wilson Was a Rising NFL Star When He Found His Faith With a Heartbroken Single Mom — 40+ PRIVATE IMAGES Show the American's "Favorite" Family of Six
8. Cancer Survivor, Single Dad, TV Icon — HOW HE LOOKS NOW AT 59 IN 30+ PICS

## OUTPUT — raw JSON only, no markdown, no explanation
{"names_in_input":["Full Name As A Person Would Write It"],"visual_story":["headline string","headline string","headline string"],"transformation":[...],"family_love":[...],"rare_access":[...],"journey":[...]}
"names_in_input": list every real person's full name mentioned anywhere in the source material, written in normal Title Case (e.g. "Millie Bobby Brown") even though the headlines themselves are ALL CAPS. Empty array if no person is named.
Each angle must have exactly 3 headlines. Each array item MUST be a plain string — never an object.

## PHOTO ARTICLE ANGLE DEFINITIONS
VISUAL STORY — The photos ARE the story. Lead with what the reader will SEE.
TRANSFORMATION — Before/after, then/now, on-screen vs real life. Visual contrast.
FAMILY & LOVE — Intimate family moments, kids, relationships. Warmth drives clicks.
RARE ACCESS — Exclusivity, hard to find, never-before-seen access.
JOURNEY — Life arc, career path, role-stacked bio framing.

## CRITICAL PHOTO ARTICLE RULES
1. PHOTO COUNT IS MANDATORY — every headline must END with a specific photo count + descriptor + PHOTOS/PICS/IMAGES (e.g. "30+ RARE PHOTOS", "15+ INTIMATE PICS", "IN 30+ PICS", "(30+ Photos)").
2. PHOTO COUNT POSITION — always at the END, after an em dash or in parentheses.
3. PHOTO TYPE VOCABULARY — use exactly one descriptor per headline; vary across headlines.
4. NO NEWS TRIGGERS — avoid DISTURBING · BONE-CHILLING · SINISTER · EXPOSED · SHOCKING (unless paired with TIMELINE/PHOTOS); those belong to news, not galleries.
5. WARMTH IS ALLOWED — photo articles can be warm, admiring, nostalgic. Not everything needs to be dark.
6. ROLE STACKING WORKS GREAT — "Cancer Survivor, Single Dad, TV Icon — HOW HE LOOKS NOW IN 30+ PICS".
7. 12–20 words per headline (slightly longer than news because the photo count adds words).
8. Structures: "[Role] + [Role] + [Role] — [N]+ PHOTOS of [Person]'s Journey" · "From [humble origin] to [peak achievement] — [N]+ PICS" · "[Person]'s [adjective] Life in [N]+ Photos That [describe arc]".

${QUOTE_RULE}

${AGE_RULE}

${NO_CTA_RULE}

${HEADLINE_FORMAT}
(For photo articles: keep the trailing photo count + descriptor + PHOTOS/PICS in UPPER CASE like the rest of the headline.)

## FORBIDDEN WORDS — NEVER USE
kill/killer · murder · attack · assault · shoot/shooting · stab · blood/gore · torture · weapon · gun · knife · war · racism · nazi · suicide · self-harm · overdose · sex/sexual · nude · porn · rape · underage · minor · drugs · cocaine · heroin · scam · fraud · fuck · shit · bitch · abortion · miscarriage`;

const ANGLE_LEADS_PROMPT = `## NO INTERNET ACCESS
You cannot browse, fetch, or open URLs. Never say you can't access something — always produce the JSON output below using whatever text is given.

## ROLE & GOAL
Facebook social-media writer for a news/entertainment publisher. For EACH angle you receive one lead to write — the caption that appears above the image. There is ONE lead per angle, and it should work with any of that angle's headlines (write to the angle's shared intrigue, not to one specific headline's wording).
The post's whole job is to move readers into the COMMENTS, where the article link lives. The headline already carries the hook. Your lead must (a) add emotional value — deepen the feeling, curiosity or stakes — and (b) end with its OWN pointer toward the comments, phrased as a fact (see MANDATORY CLOSING below), never as a command. Prefer an ADDITIONAL, different angle on the pull rather than just repeating the headline's hook — give the reader a second, fresh reason to want what's in the comments.

## WHAT EACH LEAD MUST CONTAIN
- 2–4 sentences that amplify the angle's hook and add an emotional layer (curiosity, surprise, warmth, or mild concern) — never just restate the headline
- A clear pull toward the comments/link, framed as a factual pointer (not a copy of the headline's hook, and never a command — see NO_CTA rule below)
- Grounded-tabloid tone: punchy, opinionated but measured, never taking sides on blame or guilt
- English only

## FORMATTING (already apply it — do NOT return a plain draft)
- Sentence case overall, with 1–3 of the MOST intriguing words in CAPS for punch (emphasize the intrigue, never a person's name). A few CAPS words for the whole lead is enough — never overdo it.
- PLAIN TEXT ONLY: do NOT use any markup characters. Never output ** or ~~ or markdown of any kind in a lead. Emphasis in leads is done ONLY by writing words in CAPS.
- EMOJI AFTER EVERY SENTENCE — MANDATORY, NO EXCEPTIONS: every single sentence in the lead ends with one emoji chosen from ${EMOTION_EMOJI_LIST}, immediately after that sentence's punctuation, matching THAT sentence's specific emotion/content. This includes the LAST sentence (the MANDATORY CLOSING sentence below) — it is never left bare. If a lead has 3 sentences, it has 3 emoji, one per sentence, never bunched at the end and never skipped on any sentence.
- Never reuse the same emoji twice within one lead — each sentence gets a DIFFERENT emoji that fits it specifically.
- SELF-CHECK before returning: count the sentences in your draft, then count the emoji. If the numbers don't match — including if the very last sentence has none — fix it before you output the JSON.

${NO_CTA_RULE}

${NO_ARROW_EMOJI_IN_POSTS_RULE}

## MANDATORY CLOSING — pick ONE sentence from LEAD_CLOSING_BANK, never invent your own closer
Every lead MUST end with exactly one sentence chosen from LEAD_CLOSING_BANK below, immediately followed by its own emoji per the rule above (chosen from ${EMOTION_EMOJI_LIST}, matching the lead's feeling — NEVER an arrow, see the arrow ban above). This closing sentence is not exempt from the per-sentence emoji rule — it always gets one too.
- FIRST decide what this post's actual payoff is — new details/facts, photos, video/footage, or just "a moment" in general — and pick the matching category from the bank. Do not default to the DETAILS category just because it's listed first.
- You may lightly adapt a bank sentence's wording to fit better (e.g. "The images speak volumes" → "The details speak volumes" if the payoff isn't really images) as long as the structure and meaning stay the same. Do not write a wholly new sentence that isn't based on the bank.
- BANNED, no exceptions: "in the comments", "in the comments below", "below" used as a location pointer, "comment below", or any rephrasing of these — the bank sentences replace that function entirely; none of them should ever be edited to reintroduce this wording.
- ALTERNATE constantly across the angles you're writing for this post: never reuse the same closer sentence twice, and don't lean on one category every time — mix categories when the content allows it.

${LEAD_CLOSING_BANK}

## QUESTIONS
- Only include a question if it's genuinely relevant and natural for that specific lead. Do NOT force a question into every lead — many strong leads have none. A question still counts as a sentence and still needs its own trailing emoji.

${QUOTE_RULE}

## ABSOLUTE RULE — ZERO INVENTED FACTS
Never invent quotes, numbers, or details not present in the matching headline (except quotes explicitly provided in the input, which you must reuse verbatim).

## FORBIDDEN PHRASES
"no one saw this coming" · "you won't believe" · "absolutely shocking" · "jaw-dropping" · "this changes everything" · "the internet is losing it" · "we are speechless" · "comment below" · "in the comments" · "in the comments below" · "tag a friend" · "click the link" · "share if" · "read more" · "see more" · "find out" · "watch"

## INPUT & OUTPUT
You receive a JSON object whose keys are angle names and whose values are arrays of that angle's headlines. Return a JSON object with the SAME keys, each value a SINGLE lead string for that angle.
Return ONLY raw JSON, e.g.: {"shock":"lead string","inspiration":"lead string", ...}
Every value must be a plain string.`;

const FORMAT_PROMPT = `## ROLE
Copy editor finalizing one Facebook headline and one Social Lead for publishing, exactly as the researcher selected and edited them.

${NO_CTA_RULE}

${NO_ARROW_EMOJI_IN_POSTS_RULE}

## TEXT CLEANUP RULES (apply to both the headline and the lead)
These are mechanical corrections, not style choices — always apply them, they don't count as "rewording":
- NBSP (non-breaking space) → a regular space.
- Broken apostrophes from typos (e.g. "she;s", "don;t") → a real apostrophe ("she's", "don't").
- Double (or more) spaces → a single space.
- A hyphen or en dash used as a sentence break between words (" - " or " – ") → an em dash (" — "). A repeated dash ("——") → a single em dash.
- Any curly/smart quote or other quote style (" " „ « ») → a straight double quote ("). A doubled straight quote ("") → a single straight quote (").
- Punctuation moves INSIDE the closing quote mark: "text". → "text." — this is about where the period/comma sits relative to the quote mark, NOT the quoted words themselves, so it does not conflict with never touching the quoted text (see HEADLINE rule 4 / LEAD rule 2 below).
- No space directly before a closing quote mark: day. " → day."
- Add a space after . , : ; ! ? / \\ when one is missing and a letter immediately follows (don't touch cases followed by a digit or another punctuation mark, like decimals, times, or "...").
- Gibberish (e.g. "kjkk") or non-English words — fix or translate based on context so the sentence reads as intended English.
- Trim any other redundant/stray whitespace.
- Never remove an existing comma (including introductory commas), and never remove a "?" or "!" that's inside direct speech/a quote.
- Preserve the original length and sentence structure, and preserve existing paragraphs/line breaks — do not split or merge sentences, and do not shorten.

## AVOID BANNED WORDS AND CLICKBAIT PATTERNS
Beyond grammar, also watch for: slurs/offensive language, sexual content terms, self-harm/suicide/eating-disorder terms, graphic violence/weapons terms, and generic clickbait clichés ("the shocking truth", "you won't believe", "what happened next", "doctors don't want you to know", "nobody expected this", "one photo has everyone talking", and similar vague-hype phrasing). If the researcher's draft already contains one of these, that's a real content-policy issue — do not silently launder it by just rewording it into something equally clickbait-y; keep your edit minimal and let the researcher know by leaving the flagged wording recognizable rather than paraphrasing around it, since a separate check will flag it for them to fix themselves.

## HEADLINE RULES
1. Write the entire headline in UPPER CASE.
2. Fix grammar, spelling, and awkward/non-native phrasing ONLY. Never reword, restructure, or change word choice beyond correcting a genuine error. If nothing is wrong, change nothing.
3. EXCEPTION to rule 2: the NO_CTA_RULE above is a mandatory content rule, not a style choice — if the researcher's draft contains a call-to-action verb aimed at the reader (see banned list above), remove/rewrite just that word or phrase (minimal fix, keep everything else the researcher wrote) even though this goes beyond a pure grammar fix.
4. NEVER touch or "fix" the WORDS inside quotation marks — the quoted text itself must stay exactly as given, even if imperfect. If the input the researcher wrote contains a provided quote, keep its words verbatim (the TEXT CLEANUP RULES above about quote-mark style and punctuation placement still apply — those aren't the quoted words, just the surrounding formatting).
5. Plain text only — NEVER add bold, yellow, or any other highlighting/markup. Do not wrap any word or phrase in ** or ~~ or any other symbols. If the researcher's draft already has markup in it, strip it out (return plain unstyled text).

## SOCIAL LEAD RULES
1. Sentence case overall (proper nouns normal) — EXCEPT 1–3 of the most intriguing words in CAPS. Do not overdo it.
2. Fix grammar and awkward/non-native phrasing only. Do not restructure or add new claims. Same quoted-words exception as headline rule 4 above.
3. EXCEPTION: same as the headline exception above — if the researcher's draft lead contains a banned call-to-action verb (see NO_CTA_RULE above), remove/rewrite just that word or phrase even though it goes beyond a pure grammar fix.
4. EMOJI AFTER EVERY SENTENCE — MANDATORY, NO EXCEPTIONS: every single sentence in the lead ends with one emoji chosen from ${EMOTION_EMOJI_LIST}, immediately after that sentence's punctuation, matching THAT sentence's specific emotion/content — never the same emoji twice in one lead. If the researcher's draft has a sentence with no trailing emoji (this includes the very last sentence), ADD one that fits before returning — this is a content rule, not a style choice, so it overrides "don't restructure" from rule 2. If the draft has an arrow emoji anywhere, remove it (see arrow ban above) and replace with a fitting emoji from the list.
5. The lead MUST end with exactly one sentence from LEAD_CLOSING_BANK below (pick the category matching whether the payoff is details, photos, video, or general — light adaptation of a bank sentence's wording is fine, inventing a new one is not). This closing sentence is NOT exempt from rule 4 — it always gets its own trailing emoji too, never left bare.
6. EXCEPTION to "don't restructure" (rule 2): if the researcher's draft still ends with "in the comments", "in the comments below", "below" as a location pointer, or "comment below" — this wording is banned, not a style choice. Replace it with a fitting LEAD_CLOSING_BANK sentence (plus its own trailing emoji per rule 4) even though this goes beyond a pure grammar fix.
7. Keep a question ONLY if it's genuinely relevant; don't add one just to have one. A question still counts as a sentence and still needs its own trailing emoji.

${LEAD_CLOSING_BANK_SHORT}

## ABSOLUTE RULE
Never invent facts. Only edit what is given, minimally (aside from the CTA-verb exceptions above).

## OUTPUT
Return ONLY raw JSON: {"headline": "...", "lead": "..."}`;

/* ---------- STORIES ---------- */

const STORY_ANGLES = [
  { key: 'mystery', label: 'Mystery', icon: '🕵️' },
  { key: 'transformation', label: 'Transformation', icon: '🔄' },
  { key: 'reaction', label: 'Shocking Reaction', icon: '😱' },
  { key: 'hidden', label: 'Hidden Detail', icon: '🔍' },
  { key: 'question', label: 'Question', icon: '❓' },
];

const STORY_GEN_PROMPT = `## NO INTERNET ACCESS
You cannot browse, fetch, or open URLs. If the input contains a URL, work only from the words in it and any surrounding text. Never say you can't access a link — always return the JSON below.

## ROLE
You help create and improve Facebook STORIES captions / Story text overlays for celebrity, political, and human-interest content. Goal: maximize CTR, curiosity, engagement, and pageview clicks.

## CORE RULES
- Fix grammar and spelling.
- Do NOT change text inside quotation marks. Do NOT add quotation marks if none exist. Use double straight quotation marks only.
- Sentence case, with only the most intriguing words/phrases in UPPERCASE.
- Must sound natural to American English speakers.
- Never invent facts. Never invent quotes. Use a quote-based hook only if an exact quote is provided.

## TASK
Create 5 UNIQUE Story captions, each far stronger than the original for CTR, curiosity, engagement, creativity. Do not simply reword the original.
Find the single most surprising fact first, then build all 5 around that ONE core hook, each with a strong information gap (reader understands the topic but must click to learn the answer). Avoid vague hooks like "Fans are talking...".
Use DIFFERENT hook styles across the five: mystery, transformation, shocking reaction, hidden detail, question, rare appearance, where-are-they-now.

## STORY FORMAT (each version)
- Exactly 2 lines. Line 1 = hook. Line 2 = CTA (e.g. "Details ⬇️", "Photos 👇", "Find Out Why 👇", "Explanation ⬇️", "See More 👇").
- 65–110 characters total.
- 2–3 important words in ALL CAPS for emphasis. Do NOT highlight a person's name or filler words this way — reserve the CAPS for the intrigue-carrying words.
- Plain text only — NEVER add ~~yellow~~ markup, **bold** markup, or any other highlighting/markup. Emphasis is done ONLY via the ALL CAPS words above.

## EMOJI RULES (adaptive — do NOT use a fixed template)
- Use exactly 2 emoji per version.
- The CTA line (line 2) ALWAYS ends with a directional emoji chosen from this list: ${ARROW_EMOJI_LIST}
- The OTHER emoji is an emotional/contextual one, chosen ONLY from this list — ${EMOTION_EMOJI_LIST} — matching THIS hook's emotion and subject — but its PLACEMENT must vary creatively version to version: sometimes at the very start of the hook, sometimes mid-sentence right after the key word, sometimes at the end of the hook line. Do NOT always put it after the first sentence. Choose the placement that best punches up the hook.
- Never reuse the same emotional emoji across all five versions; vary both the emoji and its position.
- Never more than 2 emoji total; never both on the same line.

${QUOTE_RULE}

${AGE_RULE}

## OUTPUT
Return ONLY raw JSON, exactly 5 versions, each a 2-line string with a real line break (\\n) between hook and CTA, plus a names_in_input field:
{"names_in_input":["Full Name As A Person Would Write It"],"mystery":"line1\\nline2","transformation":"line1\\nline2","reaction":"line1\\nline2","hidden":"line1\\nline2","question":"line1\\nline2"}
"names_in_input": every real person's full name mentioned anywhere in the source material, in normal Title Case. Empty array if none.
Each of the 5 keys is the hook style used for that version.`;

const STORY_SNIPPET_PROMPT = `## NO INTERNET ACCESS
You cannot browse or open URLs. Work only from the text given. Never say you can't access a link — always return the JSON below.

## ROLE
Recommend the best Story IMAGE (snippet) for this story. Base it only on the given text; never invent facts.

## INCLUDE
- Who should appear
- Framing (close-up, portrait, multiple people)
- Expression
- A detail worth highlighting
- Whether a two-photo layout would improve curiosity
- What should be AVOIDED because it reveals too much

## TRANSFORMATION RULE
For appearance / weight-loss / plastic-surgery / aging / "unrecognizable" stories: NEVER use the shocking "after" photo as the main Story image. Use the familiar "before" image to build curiosity. If using two photos, blur or crop the second so readers must click to see the full reveal.

## OUTPUT
Return ONLY raw JSON: {"recommendation":"2-4 short sentences of concrete visual direction"}`;

const STORY_FORMAT_PROMPT = `## ROLE
Copy editor finalizing ONE Facebook Story caption exactly as the researcher wrote/edited it.

## RULES
1. Fix grammar and spelling only. Never reword or restructure. If nothing is wrong, change nothing.
2. NEVER touch text inside quotation marks. Do NOT add quotation marks if none exist. Use double straight quotes only.
3. Sentence case overall, with the most intriguing 2–3 words in ALL CAPS for emphasis — that is the ONLY emphasis mechanism. Do not put a person's name in CAPS this way.
4. Keep it 2 lines (hook line, then CTA line) if it already is; preserve the line break.
5. Plain text only — NEVER add bold, yellow, or any other highlighting/markup. Do not wrap any word or phrase in ** or ~~ or any other symbols. If the researcher's draft already has markup in it, strip it out (return plain unstyled text, keeping any CAPS words as-is).
6. Emoji: keep exactly 2 — one emotional/contextual emoji from ${EMOTION_EMOJI_LIST} on the hook line (matching its emotion/subject), and one directional CTA emoji from ${ARROW_EMOJI_LIST} on the CTA line. If the hook line has no emotional emoji, add one that fits from the list; if there are more than 2, trim to this structure; if either emoji isn't from its correct list, replace it with one that is. Never highlight/format emoji.

## ABSOLUTE RULE
Never invent facts or quotes. Only edit minimally.

## OUTPUT
Return ONLY raw JSON: {"caption":"line1\\nline2, plain text with CAPS emphasis only"}`;

/* ============================== HELPERS ============================== */

function initials(name) { return name.slice(0, 2).toUpperCase(); }
function avatarColor(name) { return AVATAR_COLORS[name] || '#6b6560'; }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

// Read an image file, resize it down (longest side <= maxDim) and JPEG-compress,
// returning a small base64 data URL — keeps shared storage from bloating.
function fileToResizedDataUrl(file, maxDim = 1100, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width >= height && width > maxDim) { height = Math.round(height * maxDim / width); width = maxDim; }
        else if (height > width && height > maxDim) { width = Math.round(width * maxDim / height); height = maxDim; }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        try { resolve(canvas.toDataURL('image/jpeg', quality)); }
        catch (e) { reject(e); }
      };
      img.onerror = () => reject(new Error('Not a readable image'));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  if (diff < 172800) return 'yesterday';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function extractMentions(text) {
  const found = new Set();
  ALL_USERS.forEach((n) => {
    const re = new RegExp('@' + n + '\\b', 'i');
    if (re.test(text)) found.add(n);
  });
  return Array.from(found);
}

// --- Request throttling & retry -------------------------------------------
// Cap how many API requests run at once from this tab, and retry on rate limits.
// This keeps bursts (many researchers generating together) from failing outright.
const MAX_CONCURRENT = 4;
let _active = 0;
const _queue = [];
function _acquire() {
  if (_active < MAX_CONCURRENT) { _active++; return Promise.resolve(); }
  return new Promise((resolve) => _queue.push(resolve));
}
function _release() {
  _active = Math.max(0, _active - 1);
  const next = _queue.shift();
  if (next) { _active++; next(); }
}
const _sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(body, timeoutMs, onStatus) {
  const MAX_NETWORK_FAILS = 5; // give up only on repeated genuine network/timeout errors
  const MAX_RATE_WAIT_MS = 45 * 1000; // cap rate-limit waiting per call at 45s — layered auto-retries above this call (see withAutoRetry) pick up from here with a fresh, visible attempt instead of one long silent wait
  let networkFails = 0;
  let rateWaited = 0;
  let rateStep = 0;
  let sentOnce = false;
  while (true) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      if (onStatus) onStatus(sentOnce ? 'retrying' : 'sending', {});
      sentOnce = true;
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timer);
      // Rate limited / transient overload → wait and keep trying (does NOT count as a failure).
      if (res.status === 429 || res.status === 529 || res.status === 503) {
        if (rateWaited >= MAX_RATE_WAIT_MS) throw new Error('The service stayed busy for a while. Tap Retry to keep going.');
        const retryAfter = parseFloat(res.headers.get('retry-after'));
        const waitMs = Number.isFinite(retryAfter) ? retryAfter * 1000 : Math.min(20000, 1500 * Math.pow(2, rateStep)) + Math.random() * 500;
        rateStep++;
        rateWaited += waitMs;
        if (onStatus) onStatus('busy', { waitMs });
        await _sleep(waitMs);
        continue;
      }
      return res;
    } catch (e) {
      clearTimeout(timer);
      networkFails++;
      const isTimeout = e.name === 'AbortError';
      if (networkFails >= MAX_NETWORK_FAILS) {
        throw new Error(isTimeout ? 'Timed out repeatedly — tap Retry.' : 'Network trouble — check your connection, then tap Retry.');
      }
      if (onStatus) onStatus('busy', { waitMs: 1200 * networkFails });
      await _sleep(1200 * networkFails);
      continue;
    }
  }
}

async function callClaude(system, userContent, maxTokens = 1500, timeoutMs = 30000, model = 'claude-sonnet-4-6', onStatus = null) {
  if (_active >= MAX_CONCURRENT && onStatus) onStatus('queued', { position: _queue.length + 1 });
  await _acquire();
  let res;
  try {
    res = await fetchWithRetry({ model, max_tokens: maxTokens, system, cache_control: { type: 'ephemeral' }, messages: [{ role: 'user', content: userContent }] }, timeoutMs, onStatus);
  } finally {
    _release();
  }
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || 'API error');
  const block = (data.content || []).find((b) => b.type === 'text');
  const text = block?.text || '';

  // Find the JSON object. Prefer a complete {...}, but if the response was cut
  // off (no closing brace), grab from the first { to the end and try to repair.
  let jsonStr = null;
  const complete = text.match(/\{[\s\S]*\}/);
  if (complete) {
    jsonStr = complete[0];
  } else {
    const start = text.indexOf('{');
    if (start !== -1) jsonStr = text.slice(start);
  }
  if (jsonStr === null) throw new Error('No JSON in response' + (text ? ': ' + text.slice(0, 160) : ' (empty response)'));

  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    const repaired = tryRepairJson(jsonStr);
    if (repaired) return repaired;
    throw new Error('Response looked cut off and could not be parsed as JSON.');
  }
}

// Best-effort repair of a truncated JSON object: cut back to the last complete
// string/element and balance the open braces/brackets so we salvage a partial result.
function tryRepairJson(s) {
  for (let end = s.length; end > 1; end--) {
    let candidate = s.slice(0, end).trim();
    // trim a dangling comma
    candidate = candidate.replace(/,\s*$/, '');
    // balance quotes: count unescaped quotes; if odd, drop the trailing partial string
    let q = 0;
    for (let i = 0; i < candidate.length; i++) {
      if (candidate[i] === '"' && candidate[i - 1] !== '\\') q++;
    }
    if (q % 2 !== 0) {
      const lastQuote = candidate.lastIndexOf('"');
      if (lastQuote === -1) continue;
      candidate = candidate.slice(0, lastQuote).replace(/,\s*("[^"]*"\s*:\s*)?$/, '').replace(/,\s*$/, '');
    }
    // count and append missing closers
    let braces = 0, brackets = 0, inStr = false, esc = false;
    for (const ch of candidate) {
      if (esc) { esc = false; continue; }
      if (ch === '\\') { esc = true; continue; }
      if (ch === '"') inStr = !inStr;
      else if (!inStr) {
        if (ch === '{') braces++;
        else if (ch === '}') braces--;
        else if (ch === '[') brackets++;
        else if (ch === ']') brackets--;
      }
    }
    if (inStr) continue;
    let fixed = candidate.replace(/,\s*$/, '');
    fixed += ']'.repeat(Math.max(0, brackets)) + '}'.repeat(Math.max(0, braces));
    try {
      const parsed = JSON.parse(fixed);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch (e) { /* keep trimming */ }
  }
  return null;
}

function renderBoldMarkup(text) {
  if (text === null || text === undefined || text === '') return null;
  return String(text).split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-amber-300 font-semibold">{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

// Renders @mentions (highlighted) AND turns any http(s):// or www. URL into a
// real clickable link, opened in a new tab. Trims common trailing punctuation
// (., ,, ), !, ?) off a URL so "check this out https://x.com/y." doesn't pull
// the period into the link.
function renderCommentText(text) {
  const str = String(text == null ? '' : text);
  const tokenRe = /(@[A-Za-z]+|https?:\/\/[^\s]+|www\.[^\s]+)/g;
  return str.split(tokenRe).filter((p) => p !== undefined && p !== '').map((part, i) => {
    if (/^(https?:\/\/|www\.)/i.test(part)) {
      const trailingMatch = part.match(/[.,;:!?)]+$/);
      const trail = trailingMatch ? trailingMatch[0] : '';
      const display = trail ? part.slice(0, part.length - trail.length) : part;
      const href = /^https?:\/\//i.test(display) ? display : `https://${display}`;
      return (
        <React.Fragment key={i}>
          <a href={href} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
            className="text-amber-300 underline hover:text-amber-200 break-all">{display}</a>{trail}
        </React.Fragment>
      );
    }
    const name = part.slice(1);
    if (part.startsWith('@') && ALL_USERS.includes(name)) {
      return <span key={i} className="text-amber-300 font-medium">{part}</span>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

// Render story markup: **bold** (white/bold) and ~~yellow~~ (yellow), preserving line breaks.
function renderStoryMarkup(text) {
  if (text === null || text === undefined || text === '') return null;
  return String(text).split('\n').map((line, li) => (
    <React.Fragment key={li}>
      {li > 0 && <br />}
      {line.split(/(\*\*[^*]+\*\*|~~[^~]+~~)/g).filter(Boolean).map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="font-semibold text-neutral-50">{part.slice(2, -2)}</strong>;
        if (part.startsWith('~~') && part.endsWith('~~')) return <span key={i} style={{ color: '#e0b83a' }} className="font-semibold">{part.slice(2, -2)}</span>;
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </React.Fragment>
  ));
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Convert **bold** markup to <b> HTML (with escaping) so pasting into Excel/Docs keeps bold.
function markupToHtml(text) {
  return String(text == null ? '' : text).split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part) => {
    if (part.startsWith('**') && part.endsWith('**')) return '<b>' + escapeHtml(part.slice(2, -2)) + '</b>';
    return escapeHtml(part);
  }).join('');
}

// Story markup -> HTML: **bold** => <b>, ~~yellow~~ => colored span; line breaks => <br>.
function storyMarkupToHtml(text) {
  return String(text == null ? '' : text).split('\n').map((line) =>
    line.split(/(\*\*[^*]+\*\*|~~[^~]+~~)/g).filter(Boolean).map((part) => {
      if (part.startsWith('**') && part.endsWith('**')) return '<b>' + escapeHtml(part.slice(2, -2)) + '</b>';
      if (part.startsWith('~~') && part.endsWith('~~')) return '<span style="color:#d4a017;font-weight:bold">' + escapeHtml(part.slice(2, -2)) + '</span>';
      return escapeHtml(part);
    }).join('')
  ).join('<br>');
}

// Strip all story markup for a plain-text fallback.
function stripStoryMarkup(text) {
  return String(text == null ? '' : text).replace(/\*\*([^*]+)\*\*/g, '$1').replace(/~~([^~]+)~~/g, '$1');
}

// SAFETY NET: the prompts have a hard ban on highlighting a person's name, but the
// model still slips up sometimes (e.g. "**JAKE BONGIOVI'S LOOK**"). Rather than rely
// on prompt-following alone, deterministically strip the **bold**/~~yellow~~ markup
// from any highlighted span that contains one of the real names from the source
// material — keeping the words, just removing the highlight. Case-insensitive so it
// still catches an ALL-CAPS headline even though `names` are given in natural case.
function stripNameHighlights(text, names) {
  if (!text || !names || !names.length) return text;
  const tokens = new Set();
  names.forEach((n) => {
    const full = String(n || '').trim();
    if (!full) return;
    tokens.add(full);
    // Also catch a bare first/last name or possessive ("Jake's", "Bongiovi") being
    // highlighted on its own, not just the full name.
    full.split(/\s+/).forEach((part) => {
      const clean = part.replace(/[^A-Za-z'-]/g, '');
      if (clean.length > 2) tokens.add(clean);
    });
  });
  const tokenList = Array.from(tokens).sort((a, b) => b.length - a.length);
  if (!tokenList.length) return text;
  const namePattern = new RegExp(tokenList.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'i');
  return String(text).replace(/(\*\*[^*]+\*\*|~~[^~]+~~)/g, (span) => {
    const inner = span.slice(2, -2);
    return namePattern.test(inner) ? inner : span;
  });
}

// SAFETY NET (mechanical): the FORMAT_PROMPT asks the model to apply these
// text-cleanup rules, but they're purely mechanical string operations — no
// judgment needed — so we also apply them deterministically here rather than
// trusting the model got every one of them right on every generation.
function sanitizeFormattedText(text) {
  if (text === null || text === undefined) return text;
  let t = String(text);
  t = t.replace(/\u00A0/g, ' ');                          // NBSP -> regular space
  t = t.replace(/[\u201C\u201D\u201E]/g, '"').replace(/[\u00AB\u00BB]/g, '"');      // curly/other double quotes -> straight
  t = t.replace(/""+/g, '"');                              // doubled straight quotes -> one
  t = t.replace(/[\u2018\u2019]/g, "'");                             // curly single quotes -> straight apostrophe
  t = t.replace(/([A-Za-z]);(s|t|re|ve|ll|d|m)\b/g, "$1'$2"); // "she;s" -> "she's"
  t = t.replace(/[ \t]{2,}/g, ' ');                         // double+ spaces -> one (keep line breaks intact)
  t = t.replace(/ [-\u2013] /g, ' \u2014 ');                // " - " / " – " between words -> " — "
  t = t.replace(/\u2014{2,}/g, '\u2014');                   // repeated em dashes -> one
  t = t.replace(/([.,:;!?\/\\])(?=[A-Za-z])/g, '$1 ');      // add space after punctuation if a letter follows directly
  t = t.replace(/\s+"/g, (m, offset, str) => {              // no space directly before a CLOSING quote
    // Treat as closing only if the quote isn't immediately followed by a letter
    // (an opening quote is almost always followed by a word character).
    const after = str[offset + m.length] || '';
    return /[A-Za-z0-9]/.test(after) ? m : '"';
  });
  t = t.replace(/[ \t]+\n/g, '\n').replace(/\n[ \t]+/g, '\n'); // trim spaces around line breaks
  t = t.replace(/^[ \t]+|[ \t]+$/g, '');                    // trim leading/trailing horizontal whitespace only (keep line breaks)
  return t;
}

// Banned-word categories a researcher should never accidentally publish. This
// list is intentionally broad (offensive language, sexual content, self-harm,
// violence/weapons, harassment, scams, sensitive medical terms) — flagging is
// a visual warning for a human to review, not an automatic block, since some
// legitimate news coverage legitimately needs to reference these topics.
const BANNED_WORD_LIST = [
  'fuck', 'fucked', 'fucking', 'shit', 'cunt', 'bitch', 'asshole', 'slutty', 'retarded',
  'rape', 'porn', 'pornography', 'erotic', 'explicit', 'nsfw', 'nude', 'escort', 'prostitute', 'prostitution', 'stripper', 'fetish', 'kink',
  'child abuse', 'grooming', 'predator', 'jailbait', 'barely legal',
  'nazi', 'fascist', 'supremacy', 'white supremacy', 'extremist',
  'cocaine', 'heroin', 'meth', 'crack', 'weed', 'marijuana', 'drug dealer', 'addict', 'addiction', 'drunk', 'drunken', 'drugs',
  'suicide', 'self-harm', 'self harm', 'self-injury', 'self injury', 'overdose', 'hanging', 'eating disorder', 'anorexia', 'bulimia',
  'attack', 'assault', 'blood', 'bloody', 'kill', 'killer', 'murder', 'shoot', 'shooting', 'stab', 'beating', 'punch', 'choke', 'strangle', 'threat', 'threatening', 'gore', 'torture', 'mutilation', 'execution', 'massacre', 'kidnap', 'abduction', 'hostage', 'riot', 'arson',
  'war', 'invasion', 'weapon', 'gun', 'firearm', 'knife', 'rifle', 'pistol', 'ammunition', 'grenade', 'explosive', 'militia',
  'aggressive', 'bully', 'bullying', 'harass', 'harassment', 'abuse', 'abusive', 'racism', 'hate', 'hatred', 'idiot', 'dumb', 'stupid', 'psycho',
  'scam', 'fraud', 'extortion', 'blackmail', 'hoax', 'ponzi scheme', 'money laundering', 'bribery', 'illegal',
  'abortion', 'amputation', 'miscarriage',
];

// Generic clickbait clichés — same idea, flag for human review rather than
// auto-block. Bracket placeholders like [x] / [celebrity] in the phrases the
// researcher gave become a wildcard match against any short run of words.
const CLICKBAIT_PHRASE_LIST = [
  'surprising discovery', 'untold reason', 'what happened next', 'instant karma', 'karma strikes',
  'the truth revealed', 'discovered the truth', 'old family secret', 'dark family history', 'fans notice one',
  '"12 days ago he', 'massive surprise', "proof they don't want", 'the most dangerous secret', 'what nobody tells you',
  "science can't explain", 'you have to see this', 'jaw-dropping secret', "they don't want you to know", 'hidden agenda',
  'what they found will shock you', 'most unbelievable', "big pharma doesn't tell", 'this will shock you', 'everything you knew was wrong',
  'the secret to success', 'exposed scam', "you won't believe", "doctors don't want you to know", 'the shocking truth',
  "click before it's gone", 'results will blow your mind', 'change your life forever', 'must see before deleted', 'heart melts',
  "wasn't what fans expected", 'fans just noticed one surprising detail', 'shares an unexpected update', 'makes a rare appearance',
  'the real reason behind', 'finally addresses the rumors', 'nobody expected', 'one photo has everyone talking', "fans can't stop talking about",
  'leaves fans wondering after unexpected post', 'in an unexpected turn', "that's when everything changed", 'people noticed the same thing',
  "it didn't take long for fans to react", "here's what really happened", 'no one saw this coming', 'nobody was prepared for',
  'it caught everyone off guard', 'completely unexpected', 'out of nowhere', '"gross"', '"appalling"',
];

function containsBannedWords(text) {
  if (!text) return false;
  const lower = String(text).toLowerCase();
  return BANNED_WORD_LIST.some((w) => new RegExp('\\b' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i').test(lower));
}

function containsClickbaitPhrase(text) {
  if (!text) return false;
  const lower = String(text).toLowerCase();
  return CLICKBAIT_PHRASE_LIST.some((p) => lower.includes(p.toLowerCase()));
}

// Small red warning strip shown above a headline/lead field when either check fires.
function ContentWarnings({ text }) {
  const banned = containsBannedWords(text);
  const clickbait = containsClickbaitPhrase(text);
  if (!banned && !clickbait) return null;
  return (
    <div className="mb-1.5 space-y-0.5">
      {banned && <p className="text-xs text-rose-400 font-medium">⚠ Banned words detected — change your text</p>}
      {clickbait && <p className="text-xs text-rose-400 font-medium">⚠ Clickbait detected — change your text</p>}
    </div>
  );
}

// Copy rich text (HTML + plain fallback) to the clipboard. Returns true on success.
async function copyRich(html, plain) {
  // 1) Modern API with explicit HTML + plain flavors (works on the real deployed site).
  try {
    if (navigator.clipboard && window.ClipboardItem && window.isSecureContext) {
      await navigator.clipboard.write([new window.ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([plain], { type: 'text/plain' }),
      })]);
      return true;
    }
  } catch (e) { /* fall through */ }
  // 2) Rich execCommand fallback. The element must be actually rendered (not opacity:0
  //    or display:none) or some browsers copy plain text only. Park it off-screen instead.
  try {
    const div = document.createElement('div');
    div.contentEditable = 'true';
    div.innerHTML = html;
    div.style.position = 'fixed';
    div.style.left = '-99999px';
    div.style.top = '0';
    div.style.whiteSpace = 'pre-wrap';
    document.body.appendChild(div);
    const range = document.createRange();
    range.selectNodeContents(div);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    const ok = document.execCommand('copy');
    sel.removeAllRanges();
    document.body.removeChild(div);
    return ok;
  } catch (e) { return false; }
}

/* ============================== STORAGE ============================== */
// Real backend now (window.storage only exists inside Claude.ai artifacts).
// The server keeps EACH post as its own record (see api/board.js), so two
// people editing two different posts at the same time never overwrite each
// other — only two edits to the exact same post at the exact same instant
// could still race, which is a much narrower and rarer case.

async function boardApi(action, payload) {
  const res = await fetch('/api/board', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...payload }),
  });
  if (!res.ok) {
    let msg = `Board API error (${res.status})`;
    try { const j = await res.json(); if (j?.error) msg = j.error; } catch (e) { /* ignore */ }
    throw new Error(msg);
  }
  return res.json();
}

/* ============================== PUSH NOTIFICATIONS ============================== */

async function pushApi(action, payload) {
  const res = await fetch('/api/push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...payload }),
  });
  if (!res.ok) {
    let msg = `Push API error (${res.status})`;
    try { const j = await res.json(); if (j?.error) msg = j.error; } catch (e) { /* ignore */ }
    throw new Error(msg);
  }
  return res.json();
}

// Web Push wants the VAPID public key as a Uint8Array, not the base64url
// string the server hands back — this is the standard conversion.
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

function isIOSDevice() {
  return /iP(hone|ad|od)/.test(navigator.userAgent);
}
function isStandaloneDisplay() {
  return window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
}

/* ============================== SMALL UI PIECES ============================== */

function Avatar({ name, size = 'w-7 h-7 text-xs' }) {
  return (
    <div
      className={`${size} rounded-full flex items-center justify-center font-medium text-neutral-900 shrink-0`}
      style={{ backgroundColor: avatarColor(name) }}
    >
      {initials(name)}
    </div>
  );
}

function Dots() {
  return (
    <span className="inline-flex gap-1 items-center">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" style={{ animationDelay: '.15s' }}></span>
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" style={{ animationDelay: '.3s' }}></span>
    </span>
  );
}

function ModeBadge({ mode }) {
  const label = mode === 'photo' ? 'Post' : 'Post';
  return <span className="text-xs px-2 py-0.5 rounded border border-neutral-700 bg-neutral-800 text-neutral-400">{label}</span>;
}

// Textarea that auto-grows to fit its content so the whole text is always visible.
// While the user is actively typing (focused), it holds its own local value so a
// background refresh can't momentarily overwrite what's being typed.
const AutoTextarea = React.forwardRef(function AutoTextarea({ value, minHeight = 40, className = '', onChange, ...props }, forwardedRef) {
  const innerRef = useRef(null);
  const setRefs = (node) => {
    innerRef.current = node;
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };
  const [focused, setFocused] = useState(false);
  const [local, setLocal] = useState(value || '');

  // Sync down from props only when NOT focused (i.e. not mid-edit).
  useEffect(() => { if (!focused) setLocal(value || ''); }, [value, focused]);

  const resize = () => {
    const el = innerRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.max(minHeight, el.scrollHeight) + 'px';
  };
  useEffect(() => { resize(); }, [local]);
  useEffect(() => {
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <textarea
      ref={setRefs}
      value={focused ? local : (value || '')}
      rows={1}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onChange={(e) => { setLocal(e.target.value); onChange && onChange(e); }}
      onInput={resize}
      style={{ minHeight, overflow: 'hidden', resize: 'none' }}
      className={className}
      {...props}
    />
  );
});

/* ============================== LOGIN ============================== */

function LoginScreen({ onSelect }) {
  const researchers = ALL_USERS.filter((n) => n !== MANAGER);
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
            <span className="text-neutral-900 font-serif italic text-2xl">CD</span>
          </div>
          <h1 className="text-neutral-100 text-lg font-medium tracking-wide">The Content Desk</h1>
          <p className="text-neutral-500 text-sm mt-1">let's work</p>
        </div>
        <p className="text-neutral-600 text-xs uppercase tracking-widest mb-3 text-center">Who are you?</p>
        <div className="grid grid-cols-3 gap-3">
          {researchers.map((name) => (
            <button
              key={name}
              onClick={() => onSelect(name)}
              className="flex flex-col items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-xl py-5 hover:border-amber-600 transition-colors"
            >
              <Avatar name={name} size="w-10 h-10 text-sm" />
              <span className="text-neutral-200 text-sm">{name}</span>
            </button>
          ))}
        </div>
        <div className="flex justify-center mt-3">
          <button
            onClick={() => onSelect(MANAGER)}
            className="flex flex-col items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-xl py-5 hover:border-amber-600 transition-colors w-1/3 px-2"
          >
            <Avatar name={MANAGER} size="w-10 h-10 text-sm" />
            <span className="text-neutral-200 text-sm">{MANAGER}</span>
            <span className="text-amber-400 text-xs">manager</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================== NEW POST FORM ============================== */

function NewPostForm({ onCreate, kind = 'post' }) {
  const isStory = kind === 'story';
  const [mode, setMode] = useState('news');
  const [rawInput, setRawInput] = useState('');
  const [intrigue, setIntrigue] = useState('');
  const [photoCount, setPhotoCount] = useState('');
  const [photoSubtype, setPhotoSubtype] = useState('transformation');
  const [error, setError] = useState('');

  function submit() {
    if (!rawInput.trim()) { setError('Add a headline, article text, URL, or topic first.'); return; }
    setError('');
    onCreate({ kind, mode, rawInput: rawInput.trim(), intrigue: intrigue.trim(), photoCount: photoCount.trim(), photoSubtype });
    setRawInput('');
    setIntrigue('');
    setPhotoCount('');
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3 md:p-5 mb-4">
      {!isStory && (
        <div className="flex gap-0 mb-4 border border-neutral-800 rounded-lg overflow-hidden w-fit">
          <button onClick={() => setMode('news')} className={`px-4 py-2 text-sm ${mode === 'news' ? 'bg-amber-200 text-neutral-900 font-medium' : 'text-neutral-500 hover:bg-neutral-800'}`}>News/Evergreen article</button>
          <button onClick={() => setMode('photo')} className={`px-4 py-2 text-sm ${mode === 'photo' ? 'bg-amber-200 text-neutral-900 font-medium' : 'text-neutral-500 hover:bg-neutral-800'}`}>Photo article</button>
        </div>
      )}

      <label className="text-xs uppercase tracking-wider text-neutral-500 mb-2 block">
        {isStory ? 'Raw draft, link, or topic for the story' : (mode === 'photo' ? 'Person, story or topic for the photo article' : 'Raw headline, article text, URL, or topic')}
      </label>
      <AutoTextarea
        value={rawInput}
        minHeight={90}
        onChange={(e) => setRawInput(e.target.value)}
        placeholder={isStory ? 'Paste a draft caption, a link, or describe the story…' : 'Paste a raw headline, article text, URL, or describe the story…'}
        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-3 text-sm text-neutral-100 placeholder-neutral-600 outline-none focus:border-amber-500"
      />

      <label className="text-xs uppercase tracking-wider text-neutral-500 mb-2 mt-4 block">{isStory ? 'Core hook' : 'Intrigue'} <span className="text-neutral-700 normal-case">(optional)</span></label>
      <AutoTextarea
        value={intrigue}
        minHeight={56}
        onChange={(e) => setIntrigue(e.target.value)}
        placeholder={isStory ? 'The single hook all 5 story versions should revolve around…' : 'The core hook all headlines should build around…'}
        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-3 text-sm text-neutral-100 placeholder-neutral-600 outline-none focus:border-amber-500"
      />

      {!isStory && mode === 'photo' && (
        <div className="flex gap-3 mt-4 flex-wrap">
          <div className="flex-1 min-w-40">
            <label className="text-xs uppercase tracking-wider text-neutral-500 mb-2 block">Photo count</label>
            <input value={photoCount} onChange={(e) => setPhotoCount(e.target.value)} placeholder="e.g. 30+"
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2.5 text-sm text-neutral-100 placeholder-neutral-600 outline-none focus:border-amber-500" />
          </div>
          <div className="flex-1 min-w-40">
            <label className="text-xs uppercase tracking-wider text-neutral-500 mb-2 block">Subtype</label>
            <select value={photoSubtype} onChange={(e) => setPhotoSubtype(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2.5 text-sm text-neutral-100 outline-none focus:border-amber-500">
              <option value="transformation">Transformation / look change</option>
              <option value="family">Family / kids / relationship</option>
              <option value="love_story">Love story / couple</option>
              <option value="career">Career journey / rise to fame</option>
              <option value="outfits">Outfits / red carpet / style</option>
              <option value="then_now_cast">Then &amp; now / cast reunion</option>
              <option value="biography">Biography / life story</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      )}

      {error && <p className="text-rose-400 text-xs mt-3">{error}</p>}

      <button onClick={submit}
        className="mt-4 bg-amber-200 text-neutral-900 rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-amber-100 flex items-center gap-2">
        <Sparkles className="w-4 h-4" /> {isStory ? 'Generate 5 story versions' : 'Generate angles'}
      </button>
    </div>
  );
}

/* ============================== COMMENTS ============================== */

function CommentBox({ onSubmit }) {
  const [draft, setDraft] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);

  function handleChange(e) {
    const val = e.target.value;
    setDraft(val);
    const m = val.match(/@([A-Za-z]*)$/);
    if (m) { setShowMentions(true); setQuery(m[1].toLowerCase()); } else { setShowMentions(false); }
  }
  function pick(name) {
    const newValue = draft.replace(/@([A-Za-z]*)$/, '@' + name + ' ');
    setDraft(newValue);
    setShowMentions(false);
    const el = ref.current;
    if (el) {
      // The textarea buffers its own local value while focused (so background
      // refreshes never clobber in-progress typing) — setDraft() alone won't
      // reach it in that state. Write through the DOM directly, the same way
      // React itself would, so the change is picked up immediately either way.
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
      setter.call(el, newValue);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.focus();
    }
  }
  function submit() {
    if (!draft.trim()) return;
    onSubmit(draft.trim());
    setDraft('');
    setShowMentions(false);
  }
  const suggestions = ALL_USERS.filter((n) => n.toLowerCase().startsWith(query));

  return (
    <div className="relative mt-2">
      {showMentions && suggestions.length > 0 && (
        <div className="absolute bottom-full mb-1 left-0 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl overflow-hidden z-20 w-40">
          {suggestions.map((n) => (
            <button key={n} onMouseDown={(e) => e.preventDefault()} onClick={() => pick(n)} className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-700">
              <Avatar name={n} size="w-5 h-5 text-xs" /> {n}
            </button>
          ))}
        </div>
      )}
      <div className="flex gap-2 items-end">
        <AutoTextarea
          ref={ref}
          value={draft}
          minHeight={40}
          onChange={handleChange}
          onKeyDown={(e) => {
            // Plain Enter = send. Shift+Enter = new line (let the textarea handle it normally).
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
          }}
          placeholder="Write a comment or @mention someone… (Shift+Enter for a new line)"
          className="flex-1 bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder-neutral-600 outline-none focus:border-amber-500"
        />
        <button onClick={submit} className="px-3 py-2 bg-amber-200 text-neutral-900 rounded-lg hover:bg-amber-100 shrink-0">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function CommentThread({ post, currentUser, onAddComment, onEditComment, onToggleReaction, onOpen, forceOpen }) {
  const [open, setOpen] = useState(false);
  const [pickerOpenFor, setPickerOpenFor] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState('');
  const comments = post.comments || [];

  useEffect(() => {
    if (forceOpen) { setOpen(true); onOpen(post.id); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceOpen]);

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) onOpen(post.id);
  }

  function pick(commentId, emoji) {
    onToggleReaction(post.id, commentId, emoji);
    setPickerOpenFor(null);
  }

  function startEdit(c) {
    setEditingId(c.id);
    setEditDraft(c.text);
  }
  function saveEdit(commentId) {
    const trimmed = editDraft.trim();
    if (trimmed) onEditComment(post.id, commentId, trimmed);
    setEditingId(null);
  }

  return (
    <div className="mt-4 pt-3 border-t border-neutral-800">
      <button onClick={toggle} className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-300">
        <MessageCircle className="w-3.5 h-3.5" /> Comments {comments.length > 0 && `(${comments.length})`}
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>
      {open && (
        <div className="mt-3">
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {comments.length === 0 && <p className="text-neutral-700 text-xs italic">No comments yet — leave an idea or note.</p>}
            {comments.map((c) => {
              const usedEmojis = REACTION_EMOJIS.filter((emoji) => Object.values(c.reactions || {}).includes(emoji));
              const isEditing = editingId === c.id;
              return (
                <div key={c.id} className="flex gap-2 items-start">
                  <Avatar name={c.author} size="w-6 h-6 text-xs" />
                  <div className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-medium text-neutral-300">{c.author}</span>
                      <span className="text-xs text-neutral-700">{timeAgo(c.createdAt)}</span>
                      {c.editedAt && <span className="text-xs text-neutral-700 italic">(edited)</span>}
                      {c.author === currentUser && !isEditing && (
                        <button onClick={() => startEdit(c)} className="text-xs text-neutral-600 hover:text-amber-300 ml-auto">Edit</button>
                      )}
                    </div>
                    {isEditing ? (
                      <div className="mt-1">
                        <AutoTextarea value={editDraft} minHeight={40}
                          onChange={(e) => setEditDraft(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1.5 text-sm text-neutral-100 outline-none focus:border-amber-500" />
                        <div className="flex gap-2 mt-1.5">
                          <button onClick={() => saveEdit(c.id)} className="text-xs border border-amber-700 rounded px-2 py-1 text-amber-300 hover:bg-amber-700 hover:text-neutral-900">Save</button>
                          <button onClick={() => setEditingId(null)} className="text-xs border border-neutral-700 rounded px-2 py-1 text-neutral-400 hover:border-neutral-500">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-200 mt-0.5 whitespace-pre-wrap break-words">{renderCommentText(c.text)}</p>
                    )}
                    {!isEditing && (
                    <div className="relative flex items-center gap-1 mt-1.5">
                      {usedEmojis.map((emoji) => {
                        const count = Object.values(c.reactions || {}).filter((r) => r === emoji).length;
                        const mine = (c.reactions || {})[currentUser] === emoji;
                        return (
                          <button key={emoji} onClick={() => onToggleReaction(post.id, c.id, emoji)}
                            className={`text-xs rounded-full px-1.5 py-0.5 border leading-none flex items-center gap-0.5 ${mine ? 'border-amber-500 bg-amber-500/10' : 'border-neutral-800 hover:border-neutral-600'}`}>
                            <span>{emoji}</span><span className={mine ? 'text-amber-300' : 'text-neutral-500'}>{count}</span>
                          </button>
                        );
                      })}
                      <button onClick={() => setPickerOpenFor(pickerOpenFor === c.id ? null : c.id)}
                        className="text-xs rounded-full w-5 h-5 flex items-center justify-center border border-neutral-800 text-neutral-600 hover:border-neutral-600 hover:text-neutral-300 leading-none">
                        +
                      </button>
                      {pickerOpenFor === c.id && (
                        <div className="absolute bottom-full left-0 mb-1 flex gap-1 bg-neutral-800 border border-neutral-700 rounded-full px-2 py-1 shadow-xl z-20">
                          {REACTION_EMOJIS.map((emoji) => (
                            <button key={emoji} onClick={() => pick(c.id, emoji)} className="text-sm hover:scale-125 transition-transform">
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <CommentBox onSubmit={(text) => onAddComment(post.id, text)} />
        </div>
      )}
    </div>
  );
}

/* ============================== TOPICS ============================== */

function TopicCompactCard({ topic, currentUser, canEdit, onOpen, onDelete }) {
  const thumbsUp = Object.values(topic.reactions || {}).filter((r) => r === '👍').length;
  const thumbsDown = Object.values(topic.reactions || {}).filter((r) => r === '👎').length;
  const commentCount = (topic.comments || []).length;
  const isDraft = topic.status === 'draft';
  const isMine = topic.author === currentUser;

  return (
    <div onClick={onOpen}
      className={`relative shrink-0 w-40 h-28 rounded-xl border p-2.5 cursor-pointer flex flex-col justify-between transition-colors ${isDraft ? 'border-dashed border-amber-700 bg-amber-500/5 hover:border-amber-500' : 'border-neutral-800 bg-neutral-900 hover:border-neutral-600'}`}>
      {canEdit && isMine && (
        <button onClick={(e) => { e.stopPropagation(); onDelete(topic.id); }}
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-neutral-800 border border-neutral-600 text-neutral-300 flex items-center justify-center hover:bg-rose-700 hover:border-rose-600 hover:text-white z-10">
          <XIcon className="w-3 h-3" />
        </button>
      )}
      <div className="flex items-center gap-1.5">
        <Avatar name={topic.author} size="w-4 h-4 text-[9px]" />
        {isDraft && <span className="text-[10px] text-amber-400 uppercase tracking-wide">Draft</span>}
      </div>
      <p className="text-xs text-neutral-300 line-clamp-3 flex-1 mt-1 break-words">
        {topic.text ? topic.text : <span className="italic text-neutral-600">Empty topic…</span>}
      </p>
      <div className="flex items-center gap-2 text-[11px] text-neutral-500 mt-1">
        {topic.link && <LinkIcon className="w-3 h-3" />}
        {(topic.snippetImages || []).length > 0 && <ImageIcon className="w-3 h-3" />}
        {(thumbsUp > 0 || thumbsDown > 0) && <span>👍{thumbsUp} 👎{thumbsDown}</span>}
        {commentCount > 0 && <span className="flex items-center gap-0.5"><MessageCircle className="w-3 h-3" />{commentCount}</span>}
      </div>
    </div>
  );
}

function TopicModal({ topic, currentUser, canEdit, onClose, onEditField, onMarkReady, onAddSnippetImages, onRemoveSnippetImage, onDelete, onToggleTopicReaction, onAddComment, onEditComment, onToggleReaction, onOpenComments }) {
  const [uploadingSnippet, setUploadingSnippet] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const isMine = topic.author === currentUser;
  const isDraft = topic.status === 'draft';
  const canEditContent = canEdit && isMine;
  const myReaction = (topic.reactions || {})[currentUser];
  const thumbsUp = Object.values(topic.reactions || {}).filter((r) => r === '👍').length;
  const thumbsDown = Object.values(topic.reactions || {}).filter((r) => r === '👎').length;

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 sm:p-6">
      <div onClick={(e) => e.stopPropagation()} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 max-w-lg w-full max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Avatar name={topic.author} />
            <span className="text-sm text-neutral-300">{topic.author}</span>
            <span className="text-xs px-2 py-0.5 rounded border border-neutral-700 bg-neutral-800 text-neutral-400">Topic</span>
            {isDraft && <span className="text-xs px-2 py-0.5 rounded border border-amber-700 bg-amber-500/10 text-amber-300">Draft — only you can see this</span>}
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full hover:bg-neutral-800 text-neutral-500 flex items-center justify-center shrink-0">
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {canEditContent ? (
          <AutoTextarea value={topic.text} minHeight={70}
            onChange={(e) => onEditField(topic.id, 'text', e.target.value)}
            placeholder="What's the topic idea?"
            className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder-neutral-600 outline-none focus:border-amber-500" />
        ) : (
          <p className="text-sm text-neutral-200 whitespace-pre-wrap break-words">{renderCommentText(topic.text)}</p>
        )}

        {canEditContent ? (
          <input value={topic.link || ''} onChange={(e) => onEditField(topic.id, 'link', e.target.value)}
            placeholder="Add a link (optional)"
            className="w-full mt-2 bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder-neutral-600 outline-none focus:border-amber-500" />
        ) : topic.link ? (
          <p className="mt-2 text-sm break-all">{renderCommentText(topic.link)}</p>
        ) : null}

        <div className="mt-3">
          {canEditContent ? (
            <div
              onDragOver={(e) => { e.preventDefault(); if (!dragOver) setDragOver(true); }}
              onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
              onDrop={async (e) => { e.preventDefault(); setDragOver(false); const files = e.dataTransfer.files; if (!files || !files.length) return; setUploadingSnippet(true); await onAddSnippetImages(topic.id, files); setUploadingSnippet(false); }}
              className={"rounded-lg border border-dashed transition-colors p-3 " + (dragOver ? "border-amber-500 bg-amber-500/10" : "border-neutral-700")}>
              {(topic.snippetImages && topic.snippetImages.length > 0) && (
                <div className="flex flex-wrap gap-2 mb-2.5">
                  {topic.snippetImages.map((src, i) => (
                    <div key={i} className="relative">
                      <img src={src} alt="" onClick={() => setLightbox(src)} className="w-20 h-20 object-cover rounded-lg border border-neutral-700 cursor-zoom-in" />
                      <button onClick={() => onRemoveSnippetImage(topic.id, i)} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-neutral-800 border border-neutral-600 text-neutral-300 text-xs flex items-center justify-center hover:bg-rose-700 hover:border-rose-600 hover:text-white">✕</button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs text-neutral-500">{uploadingSnippet ? <><Dots /> Adding…</> : (dragOver ? 'Drop photos here' : 'Drag photos here, or')}</span>
                {!uploadingSnippet && (
                  <label className="text-xs border border-neutral-700 rounded-lg px-3 py-1.5 text-neutral-400 hover:border-amber-500 hover:text-amber-300 cursor-pointer inline-flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" /> Browse
                    <input type="file" accept="image/*" multiple className="hidden"
                      onChange={async (e) => { const files = Array.from(e.target.files || []); e.target.value = ''; setUploadingSnippet(true); await onAddSnippetImages(topic.id, files); setUploadingSnippet(false); }} />
                  </label>
                )}
              </div>
            </div>
          ) : (
            (topic.snippetImages && topic.snippetImages.length > 0) && (
              <div className="flex flex-wrap gap-2">
                {topic.snippetImages.map((src, i) => (
                  <img key={i} src={src} alt="" onClick={() => setLightbox(src)} className="w-20 h-20 object-cover rounded-lg border border-neutral-700 cursor-zoom-in" />
                ))}
              </div>
            )
          )}
        </div>

        {canEditContent && isDraft && (
          <button onClick={() => { onMarkReady(topic.id); onClose(); }}
            className="mt-3 text-sm bg-amber-200 text-neutral-900 rounded-lg px-4 py-2 font-medium hover:bg-amber-100 flex items-center gap-1.5">
            <Check className="w-4 h-4" /> Ready — show to everyone
          </button>
        )}

        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-neutral-800">
          <button onClick={() => onToggleTopicReaction(topic.id, '👍')}
            className={`text-sm rounded-full px-3 py-1 border flex items-center gap-1 ${myReaction === '👍' ? 'border-amber-500 bg-amber-500/10 text-amber-300' : 'border-neutral-700 text-neutral-400 hover:border-neutral-500'}`}>
            👍 {thumbsUp}
          </button>
          <button onClick={() => onToggleTopicReaction(topic.id, '👎')}
            className={`text-sm rounded-full px-3 py-1 border flex items-center gap-1 ${myReaction === '👎' ? 'border-amber-500 bg-amber-500/10 text-amber-300' : 'border-neutral-700 text-neutral-400 hover:border-neutral-500'}`}>
            👎 {thumbsDown}
          </button>
          {canEditContent && (
            <button onClick={() => { onDelete(topic.id); onClose(); }}
              className="ml-auto text-xs text-neutral-600 hover:text-rose-400">Delete topic</button>
          )}
        </div>

        <CommentThread post={topic} currentUser={currentUser} onAddComment={onAddComment} onEditComment={onEditComment} onToggleReaction={onToggleReaction} onOpen={onOpenComments} forceOpen={true} />
      </div>

      {lightbox && (
        <div onClick={(e) => { e.stopPropagation(); setLightbox(null); }}
          className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-6 cursor-zoom-out">
          <img src={lightbox} alt="topic preview" className="max-w-full max-h-full rounded-lg shadow-2xl" />
        </div>
      )}
    </div>
  );
}

function TopicsRow({ topics, currentUser, isOwn, onCreateTopic, onEditField, onMarkReady, onAddSnippetImages, onRemoveSnippetImage, onDelete, onToggleTopicReaction, onAddComment, onEditComment, onToggleReaction, onOpenComments, jumpToPostId, onJumpHandled }) {
  const [openTopicId, setOpenTopicId] = useState(null);
  const openTopic = topics.find((t) => t.id === openTopicId);

  // Coming here from a notification click (jumpTo sets this at the App level) —
  // if it points at one of THIS board's topics, open it automatically instead
  // of leaving the person to find it themselves in the strip.
  useEffect(() => {
    if (jumpToPostId && topics.some((t) => t.id === jumpToPostId)) {
      setOpenTopicId(jumpToPostId);
      onJumpHandled && onJumpHandled();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jumpToPostId, topics]);

  return (
    <div className="mb-6 max-w-6xl">
      <div className="text-sm font-medium text-neutral-400 mb-3">Topics</div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {isOwn && (
          <button onClick={() => { const id = onCreateTopic(); setOpenTopicId(id); }}
            className="shrink-0 w-40 h-28 rounded-xl border border-dashed border-neutral-700 flex flex-col items-center justify-center gap-1 text-neutral-500 hover:border-amber-500 hover:text-amber-300">
            <Plus className="w-5 h-5" />
            <span className="text-xs">New topic</span>
          </button>
        )}
        {topics.map((t) => (
          <TopicCompactCard key={t.id} topic={t} currentUser={currentUser} canEdit={isOwn} onOpen={() => setOpenTopicId(t.id)} onDelete={onDelete} />
        ))}
        {topics.length === 0 && !isOwn && (
          <div className="shrink-0 text-xs text-neutral-700 italic flex items-center px-2">No topics yet.</div>
        )}
      </div>
      {openTopic && (
        <TopicModal
          topic={openTopic}
          currentUser={currentUser}
          canEdit={isOwn}
          onClose={() => setOpenTopicId(null)}
          onEditField={onEditField}
          onMarkReady={onMarkReady}
          onAddSnippetImages={onAddSnippetImages}
          onRemoveSnippetImage={onRemoveSnippetImage}
          onDelete={onDelete}
          onToggleTopicReaction={onToggleTopicReaction}
          onAddComment={onAddComment}
          onEditComment={onEditComment}
          onToggleReaction={onToggleReaction}
          onOpenComments={onOpenComments}
        />
      )}
    </div>
  );
}

/* ============================== POST CARD ============================== */

function StoryBody({ post, canEdit, copiedHl, onEditField, onTogglePinHeadline, onToggleSuggestions, onFormat, onArchive, onCopyCaption, onAddSnippetImages, onRemoveSnippetImage, setLightbox, dragOver, setDragOver, uploadingSnippet, setUploadingSnippet }) {
  const versions = post.storyVersions || {};
  const keys = Object.keys(versions);
  const pinned = post.pinnedHeadlines || [];
  return (
    <div>
      {/* WORKING AREA — your story caption */}
      {post.storyVersions && (
        <div className="space-y-3 mb-4 bg-neutral-950 border border-purple-900/40 rounded-xl p-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs uppercase tracking-wider text-neutral-500">Your story caption{pinned.length > 0 && <span className="text-neutral-600 normal-case tracking-normal"> · {pinned.length} pinned</span>}</label>
              {canEdit && post.draftHeadline && (
                <button onClick={() => onEditField(post.id, 'draftHeadline', '')} className="text-xs text-neutral-600 hover:text-rose-400">clear</button>
              )}
            </div>
            <AutoTextarea value={post.draftHeadline || ''} disabled={!canEdit} minHeight={64}
              onChange={(e) => onEditField(post.id, 'draftHeadline', e.target.value)}
              placeholder={canEdit ? 'Pin versions below to collect them here, then rewrite into your final 2-line caption…' : ''}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder-neutral-700 outline-none focus:border-amber-500 disabled:opacity-70" />
          </div>

          {/* SNIPPET */}
          <div className="border-t border-neutral-800/70 pt-3">
            <label className="text-xs uppercase tracking-wider text-neutral-500 mb-1.5 block">Snippet note</label>
            <AutoTextarea value={post.snippetNote || ''} disabled={!canEdit} minHeight={44}
              onChange={(e) => onEditField(post.id, 'snippetNote', e.target.value)}
              placeholder={canEdit ? 'Your notes on the image to use…' : ''}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder-neutral-700 outline-none focus:border-amber-500 disabled:opacity-70" />

            {canEdit ? (
              <div
                onDragOver={(e) => { e.preventDefault(); if (!dragOver) setDragOver(true); }}
                onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
                onDrop={async (e) => { e.preventDefault(); setDragOver(false); const files = e.dataTransfer.files; if (!files || !files.length) return; setUploadingSnippet(true); await onAddSnippetImages(post.id, files); setUploadingSnippet(false); }}
                className={"mt-2.5 rounded-lg border border-dashed transition-colors p-3 " + (dragOver ? "border-amber-500 bg-amber-500/10" : "border-neutral-700")}>
                {(post.snippetImages && post.snippetImages.length > 0) && (
                  <div className="flex flex-wrap gap-2 mb-2.5">
                    {post.snippetImages.map((src, i) => (
                      <div key={i} className="relative">
                        <img src={src} alt="" onClick={() => setLightbox(src)} className="w-24 h-24 object-cover rounded-lg border border-neutral-700 cursor-zoom-in" />
                        <button onClick={() => onRemoveSnippetImage(post.id, i)} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-neutral-800 border border-neutral-600 text-neutral-300 text-xs flex items-center justify-center hover:bg-rose-700 hover:border-rose-600 hover:text-white">✕</button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs text-neutral-500">{uploadingSnippet ? <><Dots /> Adding…</> : (dragOver ? 'Drop photos here' : 'Drag photos here, or')}</span>
                  {!uploadingSnippet && (
                    <label className="text-xs border border-neutral-700 rounded-lg px-3 py-1.5 text-neutral-400 hover:border-amber-500 hover:text-amber-300 cursor-pointer inline-flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5" /> Browse
                      <input type="file" accept="image/*" multiple className="hidden"
                        onChange={async (e) => { const files = Array.from(e.target.files || []); e.target.value = ''; setUploadingSnippet(true); await onAddSnippetImages(post.id, files); setUploadingSnippet(false); }} />
                    </label>
                  )}
                </div>
              </div>
            ) : (
              (post.snippetImages && post.snippetImages.length > 0) && (
                <div className="flex flex-wrap gap-2 mt-2.5">
                  {post.snippetImages.map((src, i) => (
                    <img key={i} src={src} alt="" onClick={() => setLightbox(src)} className="w-24 h-24 object-cover rounded-lg border border-neutral-700 cursor-zoom-in" />
                  ))}
                </div>
              )
            )}
          </div>

          {canEdit && (
            <div className="flex gap-2 flex-wrap items-center pt-1">
              <button onClick={() => onFormat(post.id)}
                disabled={!post.draftHeadline || post.formatting || post.status === 'archived'}
                className="text-xs border border-amber-700 rounded-lg px-3 py-1.5 text-amber-300 hover:bg-amber-700 hover:text-neutral-900 disabled:opacity-40 flex items-center gap-1.5">
                {post.formatting ? <><Dots /> {post.formatStatus || "Formatting…"}</> : <><Wand2 className="w-3.5 h-3.5" /> Format for publish</>}
              </button>
              {!post.draftHeadline && <span className="text-xs text-neutral-600">write or pin a caption to format</span>}
              {post.isFormatted && !post.formatting && <span className="text-xs text-emerald-500">✓ ready to copy</span>}
            </div>
          )}
        </div>
      )}

      {/* FORMATTED CAPTION OUTPUT */}
      {post.isFormatted && post.formattedCaption && (
        <div className="mb-4 bg-neutral-950 border border-amber-900 rounded-lg p-3">
          <div className="text-xs uppercase tracking-wider text-neutral-600 mb-1">Final story caption</div>
          <ContentWarnings text={post.formattedCaption} />
          {canEdit ? (
            <AutoTextarea value={stripStoryMarkup(post.formattedCaption || '')} minHeight={52}
              onChange={(e) => onEditField(post.id, 'formattedCaption', e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1.5 text-sm text-neutral-100 leading-relaxed outline-none focus:border-amber-500" />
          ) : (
            <p className="text-sm text-neutral-100 leading-relaxed">{renderStoryMarkup(post.formattedCaption)}</p>
          )}
          {canEdit && <p className="text-xs text-neutral-600 mt-1.5">Edited something above? Tap <span className="text-amber-300">Format for publish</span> again to re-clean it up.</p>}
          <div className="flex gap-2 mt-2">
            <button onClick={onCopyCaption}
              className="text-xs border border-neutral-700 rounded px-2.5 py-1 text-neutral-400 hover:border-amber-500 hover:text-amber-300 flex items-center gap-1.5">
              {copiedHl ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy caption</>}
            </button>
            {canEdit && post.status === 'active' && (
              <button onClick={() => onArchive(post.id)}
                className="text-xs border border-emerald-700 rounded-lg px-3 py-1.5 text-emerald-400 hover:bg-emerald-700 hover:text-neutral-900 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> Mark complete & remove
              </button>
            )}
          </div>
        </div>
      )}

      {/* OPTIONS — 5 story versions + suggested image */}
      {post.storyVersions && post.status !== 'archived' && (
        <div>
          <button onClick={() => onToggleSuggestions(post.id)} className="text-xs text-neutral-500 hover:text-neutral-300 mb-2 flex items-center gap-1">
            {post.suggestionsCollapsed ? '▸ Show suggestions' : '▾ Hide suggestions'}
          </button>
          {!post.suggestionsCollapsed && (
            <div className="space-y-2">
              {keys.map((k) => {
                const v = String(versions[k] == null ? '' : versions[k]);
                const isPinned = pinned.includes(v);
                return (
                  <div key={k} className="bg-neutral-950 border border-neutral-800 rounded-xl p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs uppercase tracking-wider text-neutral-600 mb-1">{STORY_ANGLES.find((a) => a.key === k)?.label || k}</div>
                        <div className="text-sm text-neutral-200 leading-relaxed">{renderStoryMarkup(v)}</div>
                      </div>
                      {canEdit && (
                        <button onClick={(e) => { onTogglePinHeadline(post.id, v); e.currentTarget.blur(); }}
                          className={"shrink-0 text-xs rounded px-2 py-1 border " + (isPinned ? "border-amber-500 text-amber-300 bg-amber-500/10" : "border-neutral-700 text-neutral-400 hover:border-amber-500 hover:text-amber-300")}>
                          {isPinned ? "★ Pinned" : "☆ Pin"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {post.snippetRec && (
                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3">
                  <div className="text-xs uppercase tracking-wider text-neutral-500 mb-1 flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5" /> Suggested image</div>
                  <div className="text-xs text-neutral-400 leading-relaxed whitespace-pre-wrap">{post.snippetRec}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PostCard({ post, currentUser, canEdit, onTogglePinHeadline, onTogglePinLead, onToggleSuggestions, onEditField, onAddSnippetImages, onRemoveSnippetImage, onFormat, onArchive, onRetry, onAddComment, onEditComment, onToggleReaction, onOpenComments, jumpToPostId, onJumpHandled }) {
  const [showOriginal, setShowOriginal] = useState(false);
  const [copiedHl, setCopiedHl] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [uploadingSnippet, setUploadingSnippet] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [manualCopy, setManualCopy] = useState(null);
  const manualRef = useRef(null);
  const cardRef = useRef(null);
  const isJumpTarget = jumpToPostId === post.id;
  useEffect(() => {
    if (isJumpTarget) {
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      onJumpHandled && onJumpHandled();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isJumpTarget]);
  function selectManual() {
    const el = manualRef.current;
    if (!el) return;
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
  useEffect(() => {
    if (manualCopy !== null) {
      const t = setTimeout(selectManual, 60);
      return () => clearTimeout(t);
    }
  }, [manualCopy]);
  const [copiedLead, setCopiedLead] = useState(false);
  const angles = post.mode === 'photo' ? PHOTO_ANGLES : NEWS_ANGLES;
  const pinnedHeadlines = post.pinnedHeadlines || [];
  const pinnedLeads = post.pinnedLeads || [];

  async function copy(which) {
    let html, plain;
    if (which === 'hl') {
      html = storyMarkupToHtml(post.formattedHeadline || '');
      plain = stripStoryMarkup(post.formattedHeadline || '');
    } else {
      html = escapeHtml(stripStoryMarkup(post.formattedLead || '')).replace(/\n/g, '<br>');
      plain = stripStoryMarkup(post.formattedLead || '');
    }
    // Only the native Clipboard API reliably carries HTML (bold) into Excel/Sheets.
    // execCommand can silently downgrade to plain text, so if the native API isn't
    // available (e.g. this sandboxed preview) we open the manual rich modal instead —
    // that guarantees the bold survives the paste.
    let ok = false;
    try {
      if (navigator.clipboard && window.ClipboardItem && window.isSecureContext) {
        await navigator.clipboard.write([new window.ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([plain], { type: 'text/plain' }),
        })]);
        ok = true;
      }
    } catch (e) { ok = false; }

    if (ok) {
      if (which === 'hl') { setCopiedHl(true); setTimeout(() => setCopiedHl(false), 1800); }
      else { setCopiedLead(true); setTimeout(() => setCopiedLead(false), 1800); }
    } else {
      setManualCopy({ html, text: plain });
    }
  }

  async function copyStoryCaption() {
    const html = storyMarkupToHtml(post.formattedCaption || '');
    const plain = stripStoryMarkup(post.formattedCaption || '');
    let ok = false;
    try {
      if (navigator.clipboard && window.ClipboardItem && window.isSecureContext) {
        await navigator.clipboard.write([new window.ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([plain], { type: 'text/plain' }),
        })]);
        ok = true;
      }
    } catch (e) { ok = false; }
    if (ok) { setCopiedHl(true); setTimeout(() => setCopiedHl(false), 1800); }
    else { setManualCopy({ html, text: plain }); }
  }

  return (
    <div ref={cardRef} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3 md:p-5 mb-4">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Avatar name={post.author} />
          <span className="text-sm text-neutral-300">{post.author}</span>
          {post.kind === 'story'
            ? <span className="text-xs px-2 py-0.5 rounded border border-neutral-700 bg-neutral-800 text-neutral-400">Story</span>
            : <ModeBadge mode={post.mode} />}
          {post.status === 'archived' && (
            <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-500 flex items-center gap-1">
              <ArchiveIcon className="w-3 h-3" /> Archived
            </span>
          )}
        </div>
        <span className="text-xs text-neutral-600">{timeAgo(post.createdAt)}</span>
      </div>

      <button onClick={() => setShowOriginal((v) => !v)} className="text-xs text-neutral-600 hover:text-neutral-300 mb-2">
        {showOriginal ? '▾ Hide original input' : '▸ View original input'}
      </button>
      {showOriginal && (
        <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 mb-3 text-xs text-neutral-500 whitespace-pre-wrap">
          {post.rawInput}
          {post.intrigue && <div className="mt-2 text-amber-500">{post.kind === 'story' ? 'Hook' : 'Intrigue'}: {post.intrigue}</div>}
        </div>
      )}

      {/* GENERATING / ERROR STATE (shared) */}
      {post.generating && (
        <div className="flex items-center gap-2 text-sm text-neutral-500 py-4">
          <Dots /> {post.genStatus || (post.kind === 'story' ? 'Generating story versions…' : 'Generating headlines…')}
        </div>
      )}
      {!post.generating && post.genError && (
        <div className="text-sm text-rose-400 py-3">
          Still failed after 3 automatic attempts: {post.genError}
          {canEdit && (
            <button onClick={() => onRetry(post.id)}
              className="ml-3 text-xs border border-neutral-700 rounded px-2 py-1 text-neutral-400 hover:border-amber-500 hover:text-amber-300">
              Retry
            </button>
          )}
        </div>
      )}

      {/* ============ STORY BODY ============ */}
      {post.kind === 'story' && !post.generating && !post.genError && (
        <StoryBody post={post} canEdit={canEdit} copiedHl={copiedHl}
          onEditField={onEditField} onTogglePinHeadline={onTogglePinHeadline}
          onToggleSuggestions={onToggleSuggestions} onFormat={onFormat} onArchive={onArchive}
          onCopyCaption={copyStoryCaption} onAddSnippetImages={onAddSnippetImages}
          onRemoveSnippetImage={onRemoveSnippetImage} setLightbox={setLightbox}
          dragOver={dragOver} setDragOver={setDragOver} uploadingSnippet={uploadingSnippet} setUploadingSnippet={setUploadingSnippet} />
      )}

      {/* ============ POST BODY ============ */}
      {post.kind !== 'story' && (<>
      
      {/* WORKING AREA — your own headline & lead (pinned suggestions land here to edit) */}
      {!post.generating && !post.genError && post.angles && (
        <div className="space-y-3 mb-4 bg-neutral-950 border border-amber-900/40 rounded-xl p-3">
          {/* Draft */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs uppercase tracking-wider text-neutral-500">Your headline{pinnedHeadlines.length > 0 && <span className="text-neutral-600 normal-case tracking-normal"> · {pinnedHeadlines.length} pinned</span>}</label>
              {canEdit && post.draftHeadline && (
                <button onClick={() => onEditField(post.id, 'draftHeadline', '')} className="text-xs text-neutral-600 hover:text-rose-400">clear</button>
              )}
            </div>
            <AutoTextarea value={post.draftHeadline || ''} disabled={!canEdit} minHeight={56}
              onChange={(e) => onEditField(post.id, 'draftHeadline', e.target.value)}
              placeholder={canEdit ? 'Pin headlines below to collect them here, then rewrite into your final version…' : ''}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder-neutral-700 outline-none focus:border-amber-500 disabled:opacity-70" />
            <ContentWarnings text={post.draftHeadline} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs uppercase tracking-wider text-neutral-500">Your social lead{pinnedLeads.length > 0 && <span className="text-neutral-600 normal-case tracking-normal"> · {pinnedLeads.length} pinned</span>}</label>
              {canEdit && post.draftLead && (
                <button onClick={() => onEditField(post.id, 'draftLead', '')} className="text-xs text-neutral-600 hover:text-rose-400">clear</button>
              )}
            </div>
            <AutoTextarea value={post.draftLead || ''} disabled={!canEdit} minHeight={88}
              onChange={(e) => onEditField(post.id, 'draftLead', e.target.value)}
              placeholder={canEdit ? 'Pin leads below to collect them here, then rewrite into your final version…' : ''}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder-neutral-700 outline-none focus:border-amber-500 disabled:opacity-70" />
            <ContentWarnings text={post.draftLead} />
          </div>

          {/* SNIPPET — post image idea + reference photos */}
          <div className="border-t border-neutral-800/70 pt-3">
            <label className="text-xs uppercase tracking-wider text-neutral-500 mb-1.5 block flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" /> Snippet — post image &amp; idea
            </label>
            <AutoTextarea value={post.snippetNote || ''} disabled={!canEdit} minHeight={52}
              onChange={(e) => onEditField(post.id, 'snippetNote', e.target.value)}
              placeholder={canEdit ? 'Describe the snippet idea — what the image should show, mood, which photo to use…' : ''}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder-neutral-700 outline-none focus:border-amber-500 disabled:opacity-70" />

            {canEdit ? (
              <div
                onDragOver={(e) => { e.preventDefault(); if (!dragOver) setDragOver(true); }}
                onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
                onDrop={async (e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const files = e.dataTransfer.files;
                  if (!files || !files.length) return;
                  setUploadingSnippet(true);
                  await onAddSnippetImages(post.id, files);
                  setUploadingSnippet(false);
                }}
                className={"mt-2.5 rounded-lg border border-dashed transition-colors p-3 " + (dragOver ? "border-amber-500 bg-amber-500/10" : "border-neutral-700")}>
                {(post.snippetImages && post.snippetImages.length > 0) && (
                  <div className="flex flex-wrap gap-2 mb-2.5">
                    {post.snippetImages.map((src, i) => (
                      <div key={i} className="relative group">
                        <img src={src} alt={`snippet ${i + 1}`} onClick={() => setLightbox(src)}
                          className="w-24 h-24 object-cover rounded-lg border border-neutral-700 cursor-zoom-in" />
                        <button onClick={() => onRemoveSnippetImage(post.id, i)} title="Remove"
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-neutral-800 border border-neutral-600 text-neutral-300 text-xs flex items-center justify-center hover:bg-rose-700 hover:border-rose-600 hover:text-white">✕</button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs text-neutral-500">
                    {uploadingSnippet ? <><Dots /> Adding…</> : (dragOver ? 'Drop photos here' : 'Drag photos here, or')}
                  </span>
                  {!uploadingSnippet && (
                    <label className="text-xs border border-neutral-700 rounded-lg px-3 py-1.5 text-neutral-400 hover:border-amber-500 hover:text-amber-300 cursor-pointer inline-flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5" /> Browse
                      <input type="file" accept="image/*" multiple className="hidden"
                        onChange={async (e) => {
                          const files = Array.from(e.target.files || []);
                          e.target.value = '';
                          setUploadingSnippet(true);
                          await onAddSnippetImages(post.id, files);
                          setUploadingSnippet(false);
                        }} />
                    </label>
                  )}
                </div>
              </div>
            ) : (
              (post.snippetImages && post.snippetImages.length > 0) && (
                <div className="flex flex-wrap gap-2 mt-2.5">
                  {post.snippetImages.map((src, i) => (
                    <img key={i} src={src} alt={`snippet ${i + 1}`} onClick={() => setLightbox(src)}
                      className="w-24 h-24 object-cover rounded-lg border border-neutral-700 cursor-zoom-in" />
                  ))}
                </div>
              )
            )}
          </div>

          {canEdit && (
            <div className="flex gap-2 flex-wrap items-center pt-1">
              <button onClick={() => onFormat(post.id)}
                disabled={!post.draftHeadline || !post.draftLead || post.formatting || post.status === 'archived'}
                className="text-xs border border-amber-700 rounded-lg px-3 py-1.5 text-amber-300 hover:bg-amber-700 hover:text-neutral-900 disabled:opacity-40 flex items-center gap-1.5">
                {post.formatting ? <><Dots /> {post.formatStatus || "Formatting…"}</> : <><Wand2 className="w-3.5 h-3.5" /> Format for publish</>}
              </button>
              {(!post.draftHeadline || !post.draftLead) && <span className="text-xs text-neutral-600">fill in both a headline and a lead to format</span>}
              {post.isFormatted && !post.formatting && <span className="text-xs text-emerald-500">✓ ready to copy</span>}
            </div>
          )}
        </div>
      )}

      {/* FORMATTED OUTPUT */}
      {post.isFormatted && (
        <div className="space-y-2 pt-1 mb-4">
          <div className="bg-neutral-950 border border-amber-900 rounded-lg p-3">
            <div className="text-xs uppercase tracking-wider text-neutral-600 mb-1">Final headline</div>
            <ContentWarnings text={post.formattedHeadline} />
            {canEdit ? (
              <AutoTextarea value={stripStoryMarkup(post.formattedHeadline || '')} minHeight={44}
                onChange={(e) => onEditField(post.id, 'formattedHeadline', e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1.5 text-sm text-neutral-100 leading-relaxed outline-none focus:border-amber-500" />
            ) : (
              <p className="text-sm text-neutral-100 leading-relaxed">{renderStoryMarkup(post.formattedHeadline)}</p>
            )}
            <button onClick={() => copy('hl')}
              className="mt-2 text-xs border border-neutral-700 rounded px-2.5 py-1 text-neutral-400 hover:border-amber-500 hover:text-amber-300 flex items-center gap-1.5">
              {copiedHl ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy headline</>}
            </button>
          </div>
          <div className="bg-neutral-950 border border-neutral-700 rounded-lg p-3">
            <div className="text-xs uppercase tracking-wider text-neutral-600 mb-1">Final social lead</div>
            <ContentWarnings text={post.formattedLead} />
            {canEdit ? (
              <AutoTextarea value={stripStoryMarkup(post.formattedLead || '')} minHeight={60}
                onChange={(e) => onEditField(post.id, 'formattedLead', e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1.5 text-sm text-neutral-200 leading-relaxed outline-none focus:border-amber-500" />
            ) : (
              <p className="text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap">{stripStoryMarkup(post.formattedLead)}</p>
            )}
            <button onClick={() => copy('lead')}
              className="mt-2 text-xs border border-neutral-700 rounded px-2.5 py-1 text-neutral-400 hover:border-amber-500 hover:text-amber-300 flex items-center gap-1.5">
              {copiedLead ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy lead</>}
            </button>
          </div>
          {canEdit && (
            <p className="text-xs text-neutral-600">Edited something above? Tap <span className="text-amber-300">Format for publish</span> again to re-clean it up.</p>
          )}
          {canEdit && post.status === 'active' && (
            <button onClick={() => onArchive(post.id)}
              className="text-xs border border-emerald-700 rounded-lg px-3 py-1.5 text-emerald-400 hover:bg-emerald-700 hover:text-neutral-900 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" /> Mark complete & remove
            </button>
          )}
        </div>
      )}

      {/* SUGGESTIONS — collapsible; pin multiple headlines and leads into the shortlist above */}
      {!post.generating && !post.genError && post.angles && post.status !== 'archived' && (
        <div>
          <button onClick={() => onToggleSuggestions(post.id)} className="text-xs text-neutral-500 hover:text-neutral-300 mb-2 flex items-center gap-1">
            {post.suggestionsCollapsed
              ? <><ChevronDown className="w-3.5 h-3.5" /> Show all suggestions</>
              : <><ChevronUp className="w-3.5 h-3.5" /> Hide all suggestions</>}
          </button>

          {!post.suggestionsCollapsed && (
            <div className="space-y-3">
              {angles.map((a) => {
                const lead = post.leadByAngle?.[a.key];
                const lPinned = lead && pinnedLeads.includes(lead);
                return (
                  <div key={a.key} className="bg-neutral-950 border border-neutral-800 rounded-xl p-3">
                    <div className="text-xs uppercase tracking-wider text-neutral-500 mb-2 flex items-center gap-2">
                      <span>{a.icon}</span>{a.label}
                    </div>
                    {(post.angles?.[a.key] || []).map((h, i) => {
                      const hPinned = pinnedHeadlines.includes(h);
                      return (
                        <div key={i} className="flex items-start justify-between gap-3 py-2 border-b border-neutral-900 last:border-b-0">
                          <span className="text-sm block text-neutral-200 leading-relaxed">{renderStoryMarkup(h)}</span>
                          {canEdit && (
                            <button onClick={(e) => { onTogglePinHeadline(post.id, h); e.currentTarget.blur(); }}
                              className={"shrink-0 text-xs rounded px-2 py-1 border " + (hPinned ? "border-amber-500 text-amber-300 bg-amber-500/10" : "border-neutral-700 text-neutral-400 hover:border-amber-500 hover:text-amber-300")}>
                              {hPinned ? "★ Pinned" : "☆ Pin headline"}
                            </button>
                          )}
                        </div>
                      );
                    })}
                    {/* One lead for the whole angle */}
                    <div className="mt-2.5 pt-2.5 border-t border-neutral-800/70">
                      {lead ? (
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-xs block leading-relaxed text-amber-200/70">{stripStoryMarkup(lead)}</span>
                          {canEdit && (
                            <button onClick={(e) => { onTogglePinLead(post.id, lead); e.currentTarget.blur(); }}
                              className={"shrink-0 text-xs rounded px-2 py-1 border " + (lPinned ? "border-amber-500 text-amber-300 bg-amber-500/10" : "border-neutral-800 text-neutral-500 hover:border-amber-500 hover:text-amber-300")}>
                              {lPinned ? "★ Pinned" : "☆ Pin lead"}
                            </button>
                          )}
                        </div>
                      ) : post.leadsLoading ? (
                        <div className="text-xs text-neutral-600 italic flex items-center gap-1.5"><Dots /> writing lead…</div>
                      ) : (
                        <div className="text-xs text-neutral-700 italic">No lead for this angle — pin one from another angle, or write your own above.</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      </>)}

      <CommentThread post={post} currentUser={currentUser} onAddComment={onAddComment} onEditComment={onEditComment} onToggleReaction={onToggleReaction} onOpen={onOpenComments} forceOpen={isJumpTarget} />

      {manualCopy !== null && (
        <div onClick={() => setManualCopy(null)}
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6">
          <div onClick={(e) => e.stopPropagation()} className="bg-neutral-900 border border-neutral-700 rounded-xl p-4 max-w-lg w-full">
            <div className="text-sm text-neutral-300 mb-2">Auto-copy is blocked in this preview. Click <b>Select all</b>, then copy (Ctrl/Cmd+C) — bold and emoji are preserved when you paste into Excel.</div>
            <div
              ref={manualRef}
              contentEditable
              suppressContentEditableWarning
              onFocus={selectManual}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 outline-none min-h-20 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: manualCopy.html }}
            />
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={selectManual} className="text-xs border border-amber-700 rounded-lg px-3 py-1.5 text-amber-300 hover:bg-amber-700 hover:text-neutral-900">Select all</button>
              <button onClick={() => setManualCopy(null)} className="text-xs border border-neutral-700 rounded-lg px-3 py-1.5 text-neutral-400 hover:border-neutral-500 hover:text-neutral-200">Close</button>
            </div>
          </div>
        </div>
      )}

      {lightbox && (
        <div onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6 cursor-zoom-out">
          <img src={lightbox} alt="snippet preview" className="max-w-full max-h-full rounded-lg shadow-2xl" />
          <button onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-neutral-800/80 border border-neutral-600 text-neutral-200 flex items-center justify-center hover:bg-neutral-700">
            <XIcon className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

/* ============================== NOTIFICATIONS ============================== */

function getUnreadItems(posts, lastSeen, user) {
  const seen = lastSeen[user] || {};
  const items = [];
  posts.forEach((post) => {
    if (post.status === 'archived') return; // notifications only for active posts/stories
    (post.comments || []).forEach((c) => {
      if (c.author === user) return;
      const relevant = (c.mentions || []).includes(user) || post.author === user;
      if (!relevant) return;
      const threshold = seen[post.id] || post.createdAt;
      if (new Date(c.createdAt) > new Date(threshold)) items.push({ post, comment: c });
    });
  });
  items.sort((a, b) => new Date(b.comment.createdAt) - new Date(a.comment.createdAt));
  return items;
}

function NotificationBell({ posts, lastSeen, currentUser, onJump }) {
  const [open, setOpen] = useState(false);
  const items = getUnreadItems(posts, lastSeen, currentUser);

  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className="relative p-2 rounded-lg hover:bg-neutral-800 text-neutral-400">
        <Bell className="w-4.5 h-4.5" />
        {items.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-rose-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none">
            {items.length > 9 ? '9+' : items.length}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl max-h-96 overflow-y-auto z-30">
          <div className="px-3 py-2 border-b border-neutral-800 text-xs uppercase tracking-wider text-neutral-500">Mentions &amp; replies</div>
          {items.length === 0 && <p className="text-neutral-700 text-sm px-3 py-4 text-center">You're all caught up.</p>}
          {items.map(({ post, comment }, i) => (
            <button key={i} onClick={() => { onJump(post); setOpen(false); }}
              className="w-full text-left px-3 py-2.5 hover:bg-neutral-800 border-b border-neutral-800 last:border-b-0 flex gap-2">
              <Avatar name={comment.author} size="w-6 h-6 text-xs" />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-neutral-400">
                  <span className="text-neutral-200 font-medium">{comment.author}</span>{' '}
                  {(comment.mentions || []).includes(currentUser) ? 'mentioned you' : `commented on ${post.author}'s post`}
                </div>
                <p className="text-sm text-neutral-300 truncate mt-0.5">{comment.text}</p>
                <span className="text-xs text-neutral-700">{timeAgo(comment.createdAt)}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================== APP ============================== */

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cd_currentUser');
      return saved && ALL_USERS.includes(saved) ? saved : null;
    } catch (e) { return null; }
  });
  const [posts, setPosts] = useState([]);
  const [lastSeen, setLastSeen] = useState({});
  const [activeBoard, setActiveBoard] = useState(() => {
    try { return localStorage.getItem('cd_activeBoard') || null; } catch (e) { return null; }
  });
  const [jumpToPostId, setJumpToPostId] = useState(null);
  const [toast, setToast] = useState('');
  const dirtyRef = useRef(new Set());
  const debounceRef = useRef({});
  const loadedRef = useRef(false);
  // Track which posts THIS BROWSER TAB is actually, currently running a
  // generation/format request for — separate from the post's own `generating`/
  // `formatting` fields. This is the fix for the "gets stuck forever in another
  // person's browser" bug: a tab that merely OBSERVED someone else's post as
  // generating (via polling) must never treat that as its own in-flight work —
  // only the tab that actually called runGeneration/formatPost for a given post
  // should protect it from being overwritten on refresh, and only that tab's
  // watchdog should ever be allowed to fail it.
  const activeGenRef = useRef(new Set());
  const activeFormatRef = useRef(new Set());
  // 'unsupported' | 'ios-needs-install' | 'default' | 'granted' | 'denied'
  const [pushStatus, setPushStatus] = useState('unsupported');

  const showToast = useCallback((msg) => { setToast(msg); setTimeout(() => setToast(''), 2400); }, []);

  useEffect(() => {
    try {
      if (currentUser) localStorage.setItem('cd_currentUser', currentUser);
      else localStorage.removeItem('cd_currentUser');
    } catch (e) { /* localStorage unavailable — reload will just go back to login, no crash */ }
  }, [currentUser]);

  useEffect(() => {
    try {
      if (activeBoard) localStorage.setItem('cd_activeBoard', activeBoard);
      else localStorage.removeItem('cd_activeBoard');
    } catch (e) { /* ignore */ }
  }, [activeBoard]);

  const refresh = useCallback(async () => {
    try {
      const { posts: postsById, lastSeen: lastSeenByUser } = await boardApi('getAll', {});
      const remotePosts = Object.values(postsById || {});
      setPosts((local) => {
        const remoteIds = new Set(remotePosts.map((rp) => rp.id));
        const merged = remotePosts.map((rp) => {
          const lp = local.find((p) => p.id === rp.id);
          // Keep the local copy ONLY if it has unsaved edits, or THIS tab is the
          // one actually running generation/formatting for it right now — never
          // just because the post's data happens to say generating/formatting
          // (that could be a snapshot from someone else's in-progress work).
          if (lp && (dirtyRef.current.has(rp.id) || activeGenRef.current.has(rp.id) || activeFormatRef.current.has(rp.id))) {
            return lp;
          }
          return rp;
        });
        // Keep local-only posts that haven't reached the backend yet
        // (e.g. a placeholder mid-generation started on this tab).
        const localOnly = local.filter((p) => !remoteIds.has(p.id));
        return [...localOnly, ...merged].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      });
      if (lastSeenByUser) setLastSeen(lastSeenByUser);
    } catch (e) {
      // Transient network hiccup — keep whatever we have locally and just try again
      // on the next poll tick rather than wiping the board.
      console.error('refresh failed', e);
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    if (!loadedRef.current) { loadedRef.current = true; refresh(); }
    setActiveBoard((b) => b || (USERS.includes(currentUser) ? currentUser : USERS[0]));
    const interval = setInterval(refresh, 4000);
    return () => clearInterval(interval);
  }, [currentUser, refresh]);

  useEffect(() => {
    if (!currentUser) return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      setPushStatus('unsupported');
      return;
    }
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      // Browsers cache the service worker aggressively and only check for a
      // new version occasionally — force a check on every load so a fix
      // shipped in sw.js (like the notification-click deep link) actually
      // takes effect instead of an old cached worker quietly staying active.
      reg.update().catch(() => {});
    }).catch((e) => console.error('SW registration failed', e));
    if (isIOSDevice() && !isStandaloneDisplay()) {
      setPushStatus('ios-needs-install');
      return;
    }
    setPushStatus(Notification.permission); // 'default' | 'granted' | 'denied'
  }, [currentUser]);

  // Keep a ref to the latest posts so the service-worker message listener
  // below (registered once) always sees current data, not a stale closure.
  const postsRef = useRef(posts);
  useEffect(() => { postsRef.current = posts; }, [posts]);

  // When a notification is tapped while the app is ALREADY open in a tab, the
  // service worker focuses that tab and posts a message here instead of
  // reloading it — this is what actually lands you on the right post.
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    function handleMessage(event) {
      if (event.data && event.data.type === 'jump-to-post' && event.data.postId) {
        const post = postsRef.current.find((p) => p.id === event.data.postId);
        if (post) jumpTo(post);
      }
    }
    navigator.serviceWorker.addEventListener('message', handleMessage);
    return () => navigator.serviceWorker.removeEventListener('message', handleMessage);
  }, []);

  // When a notification is tapped with NO tab already open, the service
  // worker opens a fresh one at /?postId=... — this picks that up once the
  // board has actually loaded (posts arrives a moment after currentUser does)
  // and then cleans the URL so a later reload doesn't re-trigger the jump.
  const urlJumpDoneRef = useRef(false);
  useEffect(() => {
    if (urlJumpDoneRef.current || !currentUser) return;
    const params = new URLSearchParams(window.location.search);
    const targetId = params.get('postId');
    if (!targetId) { urlJumpDoneRef.current = true; return; }
    const post = posts.find((p) => p.id === targetId);
    if (!post) return; // posts may still be loading — this effect re-runs as `posts` updates
    jumpTo(post);
    urlJumpDoneRef.current = true;
    const url = new URL(window.location.href);
    url.searchParams.delete('postId');
    window.history.replaceState({}, '', url.toString());
  }, [currentUser, posts]);

  async function enableNotifications() {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      const permission = await Notification.requestPermission();
      setPushStatus(permission);
      if (permission !== 'granted') return;
      const { key } = await pushApi('getVapidKey', {});
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(key),
        });
      }
      await pushApi('subscribe', { user: currentUser, subscription: sub.toJSON() });
      showToast('Notifications enabled ✓');
    } catch (e) {
      console.error('enableNotifications failed', e);
      showToast('Could not enable notifications: ' + e.message);
    }
  }

  // Safety net: our own retry logic (3 attempts, generous per-call waits) should
  // never take longer than ~4 minutes to either finish or fail with a visible
  // error. If a post is STILL marked "generating" past a much longer ceiling —
  // whatever the cause (a code path that didn't throw, a browser tab that got
  // backgrounded and throttled, etc.) — force it into a clear failed state with
  // a Retry button rather than leaving the person staring at a frozen spinner.
  //
  // CRITICAL: this must only fire for a post THIS tab is actually, currently
  // generating/formatting (tracked in activeGenRef/activeFormatRef) — never for
  // a post that merely LOOKS like it's generating because that's the snapshot
  // this tab happened to poll from someone else's in-progress work. Without this
  // guard, an idle tab that once glimpsed someone else's "generating: true" post
  // would sit there for 6 minutes and then overwrite that person's now-successful
  // result with a fake failure.
  useEffect(() => {
    const WATCHDOG_MS = 6 * 60 * 1000; // 6 minutes — for full generation (headlines/story + leads)
    const FORMAT_WATCHDOG_MS = 4 * 60 * 1000; // 4 minutes — formatting is a single, smaller call
    const iv = setInterval(() => {
      const now = Date.now();
      setPosts((prev) => {
        let changed = false;
        const next = prev.map((p) => {
          if (p.generating && activeGenRef.current.has(p.id) && p.genStartedAt && (now - new Date(p.genStartedAt).getTime()) > WATCHDOG_MS) {
            changed = true;
            return { ...p, generating: false, genStatus: null, genError: 'This took far longer than expected and may have stalled. Tap Retry to try again.' };
          }
          if (p.formatting && activeFormatRef.current.has(p.id) && p.formatStartedAt && (now - new Date(p.formatStartedAt).getTime()) > FORMAT_WATCHDOG_MS) {
            changed = true;
            setTimeout(() => showToast('Formatting stalled longer than expected — try again.'), 0);
            return { ...p, formatting: false, formatStatus: null };
          }
          return p;
        });
        if (changed) {
          next.forEach((p, i) => { if (p !== prev[i]) boardApi('savePost', { post: p }).catch(() => {}); });
          return next;
        }
        return prev;
      });
    }, 15000);
    return () => clearInterval(iv);
  }, []);

  // Saves ONLY the post(s) whose object reference actually changed, not the whole
  // board. Since updaterFn (via .map) returns the SAME reference for every post it
  // didn't touch, this reference diff naturally isolates exactly what changed — so
  // two people editing two different posts at the same moment never overwrite each
  // other's work. New posts (create) and edited posts both flow through this.
  function persist(updaterFn) {
    setPosts((prev) => {
      const updated = updaterFn(prev);
      updated.forEach((p) => {
        const before = prev.find((x) => x.id === p.id);
        if (before !== p) boardApi('savePost', { post: p }).catch((e) => console.error('Failed to save post', e));
      });
      prev.forEach((p) => {
        if (!updated.find((x) => x.id === p.id)) boardApi('deletePost', { postId: p.id }).catch(() => {});
      });
      return updated;
    });
  }

  function clearAllPosts() {
    if (!window.confirm('Delete ALL posts and stories for everyone — active and archived? This cannot be undone.')) return;
    setPosts([]);
    setLastSeen({});
    boardApi('clearAll', {}).catch((e) => console.error('Failed to clear board', e));
    showToast('All posts cleared ✓');
  }

  // Turn a low-level request status into a human message on the post's card.
  // These messages are shown to the user during generation so it's always clear
  // whether they're simply queued behind other requests, or whether the API is
  // overloaded and being retried automatically — never a silent hang.
  function statusUpdater(postId, phase) {
    return (code, info) => {
      let msg;
      if (code === 'queued') msg = `Queued behind other requests on this board (position ${info.position || 1}) — will start automatically…`;
      else if (code === 'busy') msg = `High demand right now — retrying automatically in ${Math.round((info.waitMs || 1000) / 1000)}s (no action needed)…`;
      else if (code === 'retrying') msg = phase === 'leads' ? 'Reconnecting to write leads…' : 'Reconnecting…';
      else msg = phase === 'leads' ? 'Writing leads…' : (phase === 'story' ? 'Generating story versions…' : 'Generating headlines…');
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, genStatus: msg } : p));
    };
  }

  // Same idea as statusUpdater, but for the "Format for publish" step, writing to
  // its own formatStatus field so it doesn't collide with generation status.
  function formatStatusUpdater(postId) {
    return (code, info) => {
      let msg;
      if (code === 'queued') msg = `Queued behind other requests (position ${info.position || 1})…`;
      else if (code === 'busy') msg = `High demand — retrying automatically in ${Math.round((info.waitMs || 1000) / 1000)}s…`;
      else if (code === 'retrying') msg = 'Reconnecting…';
      else msg = 'Formatting…';
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, formatStatus: msg } : p));
    };
  }

  // Generic auto-retry wrapper: retries `fn` a few times with backoff before
  // giving up, so a transient overload (e.g. several people generating at once)
  // resolves itself without the person needing to tap Retry themselves.
  async function withAutoRetry(fn, { maxRetries = 2, delays = [8000, 20000], onRetry } = {}) {
    let attempt = 0;
    while (true) {
      try {
        return await fn(attempt);
      } catch (e) {
        if (attempt >= maxRetries) throw e;
        const delay = delays[attempt] ?? delays[delays.length - 1];
        if (onRetry) onRetry(attempt + 1, maxRetries + 1, delay, e);
        await _sleep(delay);
        attempt++;
      }
    }
  }

  async function runGenerationCore(postId, form) {
    {
      const prompt = form.mode === 'photo' ? PHOTO_PROMPT : NEWS_PROMPT;
      let msg = `SOURCE MATERIAL (this may be a raw headline, pasted article text, a URL, or just a topic — you have no ability to open links, so work only with the text below, even if it's just a URL):\n\n${form.rawInput}`;
      if (form.intrigue) msg += `\n\n---\nINTRIGUE — build every headline around this hook:\n"${form.intrigue}"`;
      if (form.mode === 'photo') {
        const count = form.photoCount || '30+';
        msg += `\n\nPHOTO ARTICLE PARAMETERS:\n- Photo count: ${count}\n- Subtype: ${form.photoSubtype}\nEvery headline must end with "${count}" plus a fitting descriptor and PHOTOS/PICS.`;
      }
      const rawAngles = await callClaude(prompt, msg, 6000, 55000, 'claude-sonnet-4-6', statusUpdater(postId, 'headlines'));

      // Real person names mentioned in the source material — used below as a
      // deterministic safety net to strip any highlight the model incorrectly put
      // on a name, since the prompt's hard ban alone doesn't always hold.
      const namesInInput = Array.isArray(rawAngles?.names_in_input) ? rawAngles.names_in_input.filter((n) => typeof n === 'string' && n.trim()) : [];

      // Models sometimes return each headline as an object ({headline:"..."} / {text:"..."})
      // instead of a plain string, which renders as "[object Object]". Coerce everything to strings.
      function toHeadlineString(item) {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object') {
          return String(item.headline || item.text || item.title || item.value || Object.values(item).find((v) => typeof v === 'string') || '');
        }
        return item == null ? '' : String(item);
      }
      const angles = {};
      Object.keys(rawAngles || {}).forEach((k) => {
        if (k === 'names_in_input') return;
        const arr = Array.isArray(rawAngles[k]) ? rawAngles[k] : [];
        angles[k] = arr.map(toHeadlineString).filter((s) => s.trim() !== '').map((h) => stripNameHighlights(h, namesInInput));
      });
      const angleKeys = Object.keys(angles);

      // Show the headlines immediately (leads fill in a moment later) so the user
      // isn't blocked watching a spinner while leads generate.
      persist((prev) => prev.map((p) => p.id === postId ? { ...p, angles, namesInInput, leadByAngle: {}, generating: false, genStatus: null, leadsLoading: true } : p));

      // ONE request for all angle leads (one lead per angle, not per headline).
      // Keeps requests-per-post at 2 and the response short.
      // This gets its OWN short auto-retry (separate from the headlines' retry) so a
      // transient overload doesn't force headlines to regenerate too, and doesn't
      // just silently give up on the first hiccup either.
      async function fetchAngleLeads() {
        const payload = {};
        angleKeys.forEach((k) => { payload[k] = angles[k] || []; });
        try {
          const r = await withAutoRetry(
            () => callClaude(
              ANGLE_LEADS_PROMPT,
              `For EACH angle below, write ONE social lead that fits that angle's intrigue (it should work with any of that angle's headlines). Return JSON with the same keys, each a single lead string.${form.intrigue ? `\n\nCORE INTRIGUE for the whole post: "${form.intrigue}"` : ''}\n\n${JSON.stringify(payload, null, 2)}`,
              1200, 30000, 'claude-haiku-4-5-20251001', statusUpdater(postId, 'leads')
            ),
            {
              maxRetries: 2,
              delays: [4000, 10000],
              onRetry: (attempt, totalAttempts, delay) => {
                const msg = `Leads didn't come through — retrying automatically in ${Math.round(delay / 1000)}s (attempt ${attempt + 1} of ${totalAttempts})…`;
                setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, genStatus: msg } : p));
              },
            }
          );
          const out = {};
          angleKeys.forEach((k) => {
            const v = r[k];
            let lead = typeof v === 'string' ? v
              : Array.isArray(v) ? (v.find((x) => typeof x === 'string') || '')
              : (v && typeof v === 'object' ? String(v.lead || v.text || '') : '');
            out[k] = lead.replace(/\*\*/g, '').replace(/~~/g, ''); // leads are plain text — never show raw markup
          });
          return out;
        } catch (e) {
          // Leads failed after 3 automatic attempts — fall back to blank leads rather
          // than blocking the post. Headlines are already visible; the UI already
          // invites the researcher to pin a lead from another angle or write their own.
          const out = {};
          angleKeys.forEach((k) => { out[k] = ''; });
          return out;
        }
      }

      const leadByAngle = await fetchAngleLeads();
      persist((prev) => prev.map((p) => p.id === postId ? { ...p, leadByAngle, leadsLoading: false } : p));
    }
  }

  async function runStoryGenerationCore(postId, form) {
    {
      let msg = `SOURCE MATERIAL (raw headline, pasted text, a URL, or a topic — you cannot open links, work only from the text below):\n\n${form.rawInput}`;
      if (form.intrigue) msg += `\n\n---\nCORE HOOK to build every version around:\n"${form.intrigue}"`;
      const [rawVersions, snippet] = await Promise.all([
        callClaude(STORY_GEN_PROMPT, msg, 3500, 55000, 'claude-sonnet-4-6', statusUpdater(postId, 'story')),
        callClaude(STORY_SNIPPET_PROMPT, msg, 500, 30000, 'claude-haiku-4-5-20251001').then((r) => {
          const rec = r && r.recommendation;
          return typeof rec === 'string' ? rec : (rec ? JSON.stringify(rec) : '');
        }).catch(() => ''),
      ]);
      // Coerce every version to a plain string so rendering can never crash on non-strings.
      const namesInInput = Array.isArray(rawVersions?.names_in_input) ? rawVersions.names_in_input.filter((n) => typeof n === 'string' && n.trim()) : [];
      const versions = {};
      if (rawVersions && typeof rawVersions === 'object') {
        Object.keys(rawVersions).forEach((k) => {
          if (k === 'names_in_input') return;
          const val = rawVersions[k];
          const str = typeof val === 'string' ? val
            : Array.isArray(val) ? val.filter((x) => typeof x === 'string').join('\n')
            : (val == null ? '' : String(val));
          versions[k] = stripNameHighlights(str, namesInInput);
        });
      }
      persist((prev) => prev.map((p) => p.id === postId ? { ...p, storyVersions: versions, namesInInput, snippetRec: snippet, generating: false } : p));
    }
  }

  // Public entry point for generation. Wraps the core logic in auto-retry: if a
  // request ultimately fails (e.g. the API stayed overloaded past its own internal
  // retry budget, or the response came back malformed), this restarts the whole
  // generation automatically up to 2 more times with backoff before it ever shows
  // the person an error — so under heavy simultaneous load (several people
  // generating at once) the person doesn't have to sit there tapping Retry.
  async function runGeneration(postId, form) {
    activeGenRef.current.add(postId);
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, genStartedAt: new Date().toISOString() } : p));
    try {
      await withAutoRetry(
        () => (form.kind === 'story' ? runStoryGenerationCore(postId, form) : runGenerationCore(postId, form)),
        {
          maxRetries: 2,
          delays: [8000, 20000],
          onRetry: (attempt, totalAttempts, delay) => {
            const msg = `Didn't go through — retrying automatically in ${Math.round(delay / 1000)}s (attempt ${attempt + 1} of ${totalAttempts})…`;
            setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, generating: true, genError: null, genStatus: msg } : p));
          },
        }
      );
    } catch (e) {
      persist((prev) => prev.map((p) => p.id === postId ? { ...p, generating: false, genStatus: null, genError: e.message } : p));
    } finally {
      activeGenRef.current.delete(postId);
    }
  }

  async function createPost(form) {
    const postId = uid();
    const base = {
      id: postId, author: currentUser, kind: form.kind || 'post', rawInput: form.rawInput, intrigue: form.intrigue,
      generating: true, genError: null, genStartedAt: new Date().toISOString(),
      pinnedHeadlines: [], draftHeadline: '', suggestionsCollapsed: false,
      snippetNote: '', snippetImages: [],
      isFormatted: false, formatting: false,
      status: 'active', comments: [], createdAt: new Date().toISOString(),
    };
    const placeholder = form.kind === 'story'
      ? { ...base, storyVersions: null, snippetRec: '', formattedCaption: null }
      : { ...base, mode: form.mode, photoCount: form.photoCount, photoSubtype: form.photoSubtype,
          angles: null, leadByAngle: null, pinnedLeads: [], draftLead: '', formattedHeadline: null, formattedLead: null };
    persist((prev) => [placeholder, ...prev]);
    runGeneration(postId, form);
  }

  // Topics: a lightweight strip item — text, optional link, optional photos.
  // Starts as a draft only the author can see; everyone else sees it once
  // markTopicReady flips it to 'ready'.
  function createTopic() {
    const topicId = uid();
    const topic = {
      id: topicId, kind: 'topic', author: currentUser, status: 'draft',
      text: '', link: '', snippetImages: [], reactions: {}, comments: [],
      createdAt: new Date().toISOString(),
    };
    persist((prev) => [topic, ...prev]);
    return topicId;
  }

  function markTopicReady(topicId) {
    persist((prev) => prev.map((p) => p.id === topicId ? { ...p, status: 'ready', readyAt: new Date().toISOString() } : p));
  }

  function toggleTopicReaction(topicId, emoji) {
    setPosts((prev) => prev.map((p) => {
      if (p.id !== topicId) return p;
      const reactions = { ...(p.reactions || {}) };
      if (reactions[currentUser] === emoji) delete reactions[currentUser];
      else reactions[currentUser] = emoji;
      return { ...p, reactions };
    }));
    boardApi('toggleTopicReaction', { postId: topicId, user: currentUser, emoji }).then(({ post: serverPost }) => {
      if (serverPost) setPosts((prev) => prev.map((p) => p.id === topicId ? serverPost : p));
    }).catch((e) => {
      console.error('Failed to save topic reaction', e);
      showToast('Reaction may not have saved — check your connection.');
    });
  }

  function retryPost(postId) {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    persist((prev) => prev.map((p) => p.id === postId ? { ...p, generating: true, genError: null } : p));
    runGeneration(postId, {
      kind: post.kind, mode: post.mode, rawInput: post.rawInput, intrigue: post.intrigue,
      photoCount: post.photoCount, photoSubtype: post.photoSubtype,
    });
  }

  // Pin = drop the suggestion straight into the draft field (append), so it can be
  // edited into the final version. Toggling off removes that exact block again.
  function togglePinInto(postId, listKey, draftField, rawText) {
    const text = listKey === 'pinnedHeadlines' ? rawText.replace(/\*\*/g, '').replace(/~~/g, '') : rawText; // headlines carry **bold**/~~yellow~~ markup — strip for editing
    persist((prev) => prev.map((p) => {
      if (p.id !== postId) return p;
      const list = p[listKey] || [];
      const has = list.includes(rawText);
      const current = p[draftField] || '';
      let nextDraft;
      let nextList;
      if (has) {
        nextList = list.filter((t) => t !== rawText);
        // remove the pinned block from the draft (and tidy blank lines)
        nextDraft = current
          .split(/\n{2,}/)
          .filter((block) => block.trim() !== text.trim())
          .join('\n\n')
          .trim();
      } else {
        nextList = [...list, rawText];
        nextDraft = current.trim() ? current.trimEnd() + '\n\n' + text : text;
      }
      return { ...p, [listKey]: nextList, [draftField]: nextDraft, isFormatted: false };
    }));
  }

  function togglePinHeadline(postId, text) { togglePinInto(postId, 'pinnedHeadlines', 'draftHeadline', text); }
  function togglePinLead(postId, text) { togglePinInto(postId, 'pinnedLeads', 'draftLead', text); }

  function toggleSuggestions(postId) {
    persist((prev) => prev.map((p) => p.id === postId ? { ...p, suggestionsCollapsed: !p.suggestionsCollapsed } : p));
  }

  function editField(postId, field, value) {
    const resetsFormat = field === 'draftHeadline' || field === 'draftLead';
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, [field]: value, ...(resetsFormat ? { isFormatted: false } : {}) } : p));
    // Mark this post dirty; it stays dirty (protected from refresh overwrite)
    // until the debounced save below actually writes it to the backend.
    dirtyRef.current.add(postId);
    const dkey = postId + field;
    clearTimeout(debounceRef.current[dkey]);
    debounceRef.current[dkey] = setTimeout(() => {
      setPosts((current) => {
        const p = current.find((x) => x.id === postId);
        if (p) boardApi('savePost', { post: p }).catch((e) => console.error('Failed to save post', e));
        return current;
      });
      dirtyRef.current.delete(postId);
    }, 700);
  }

  async function addSnippetImages(postId, fileList) {
    const files = Array.from(fileList || []).filter((f) => f.type && f.type.startsWith('image/'));
    if (!files.length) return;
    try {
      const dataUrls = [];
      for (const f of files) {
        try { dataUrls.push(await fileToResizedDataUrl(f)); }
        catch (e) { /* skip unreadable file */ }
      }
      if (!dataUrls.length) { showToast('Could not read those images'); return; }
      persist((prev) => prev.map((p) => p.id === postId ? { ...p, snippetImages: [...(p.snippetImages || []), ...dataUrls] } : p));
    } catch (e) {
      showToast('Image upload failed: ' + e.message);
    }
  }

  function removeSnippetImage(postId, index) {
    persist((prev) => prev.map((p) => p.id === postId ? { ...p, snippetImages: (p.snippetImages || []).filter((_, i) => i !== index) } : p));
  }

  async function formatPost(postId) {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    if (post.kind === 'story') {
      if (!post.draftHeadline) return;
      const storySource = post.isFormatted && post.formattedCaption ? stripStoryMarkup(post.formattedCaption) : post.draftHeadline;
      activeFormatRef.current.add(postId);
      persist((prev) => prev.map((p) => p.id === postId ? { ...p, formatting: true, formatStatus: null, formatStartedAt: new Date().toISOString() } : p));
      try {
        const result = await withAutoRetry(
          () => callClaude(STORY_FORMAT_PROMPT, `Story caption:\n"${storySource}"`, 500, 30000, 'claude-haiku-4-5-20251001', formatStatusUpdater(postId)),
          {
            maxRetries: 2,
            delays: [5000, 12000],
            onRetry: (attempt, totalAttempts, delay) => {
              const msg = `Didn't go through — retrying automatically in ${Math.round(delay / 1000)}s (attempt ${attempt + 1} of ${totalAttempts})…`;
              setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, formatStatus: msg } : p));
            },
          }
        );
        persist((prev) => prev.map((p) => p.id === postId ? {
          ...p, formattedCaption: stripNameHighlights(sanitizeFormattedText(result.caption), post.namesInInput), isFormatted: true, formatting: false, formatStatus: null,
        } : p));
      } catch (e) {
        persist((prev) => prev.map((p) => p.id === postId ? { ...p, formatting: false, formatStatus: null } : p));
        showToast('Formatting failed after 3 automatic attempts: ' + e.message);
      } finally {
        activeFormatRef.current.delete(postId);
      }
      return;
    }
    if (!post.draftHeadline || !post.draftLead) return;
    const headlineSource = post.isFormatted && post.formattedHeadline ? stripStoryMarkup(post.formattedHeadline) : post.draftHeadline;
    const leadSource = post.isFormatted && post.formattedLead ? stripStoryMarkup(post.formattedLead) : post.draftLead;
    activeFormatRef.current.add(postId);
    persist((prev) => prev.map((p) => p.id === postId ? { ...p, formatting: true, formatStatus: null, formatStartedAt: new Date().toISOString() } : p));
    try {
      const result = await withAutoRetry(
        () => callClaude(FORMAT_PROMPT, `Headline: "${headlineSource}"\nLead: "${leadSource}"`, 700, 30000, 'claude-haiku-4-5-20251001', formatStatusUpdater(postId)),
        {
          maxRetries: 2,
          delays: [5000, 12000],
          onRetry: (attempt, totalAttempts, delay) => {
            const msg = `Didn't go through — retrying automatically in ${Math.round(delay / 1000)}s (attempt ${attempt + 1} of ${totalAttempts})…`;
            setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, formatStatus: msg } : p));
          },
        }
      );
      persist((prev) => prev.map((p) => p.id === postId ? {
        ...p, formattedHeadline: stripNameHighlights(sanitizeFormattedText(result.headline), post.namesInInput), formattedLead: sanitizeFormattedText(result.lead), isFormatted: true, formatting: false, formatStatus: null,
      } : p));
    } catch (e) {
      persist((prev) => prev.map((p) => p.id === postId ? { ...p, formatting: false, formatStatus: null } : p));
      showToast('Formatting failed after 3 automatic attempts: ' + e.message);
    } finally {
      activeFormatRef.current.delete(postId);
    }
  }

  function archivePost(postId) {
    if (!window.confirm('Remove this from the board? This cannot be undone.')) return;
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    boardApi('deletePost', { postId }).catch((e) => console.error('Failed to delete post', e));
    showToast('Removed from board ✓');
  }

  function addComment(postId, text) {
    const comment = { id: uid(), author: currentUser, text, mentions: extractMentions(text), createdAt: new Date().toISOString() };
    // Optimistic local update for instant feedback...
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, comments: [...(p.comments || []), comment] } : p));
    // ...but save via a server-side atomic append rather than a full post overwrite,
    // since a comment can land on someone ELSE's post — two people commenting on the
    // same post at the same moment is the one real collision risk in this app, and
    // this keeps that race window as small as possible (server does read+append+write
    // in one step instead of relying on this browser's possibly-stale local copy).
    boardApi('appendComment', { postId, comment }).then(({ post: serverPost }) => {
      if (serverPost) setPosts((prev) => prev.map((p) => p.id === postId ? serverPost : p));
    }).catch((e) => {
      console.error('Failed to save comment', e);
      showToast('Comment may not have saved — check your connection.');
    });
  }

  // Editing your own comment, same atomic-on-the-server pattern. Re-derives
  // @mentions from the new text — it doesn't re-notify anyone for a mention
  // that was already there, only future comments/reactions trigger pushes.
  function editComment(postId, commentId, text) {
    const mentions = extractMentions(text);
    const editedAt = new Date().toISOString();
    setPosts((prev) => prev.map((p) => {
      if (p.id !== postId) return p;
      const comments = (p.comments || []).map((c) => c.id === commentId ? { ...c, text, mentions, editedAt } : c);
      return { ...p, comments };
    }));
    boardApi('editComment', { postId, commentId, text, mentions }).then(({ post: serverPost }) => {
      if (serverPost) setPosts((prev) => prev.map((p) => p.id === postId ? serverPost : p));
    }).catch((e) => {
      console.error('Failed to save comment edit', e);
      showToast('Edit may not have saved — check your connection.');
    });
  }

  // One reaction per person per comment (picking a different emoji replaces
  // your previous one; clicking your current one again removes it) — same
  // atomic-on-the-server pattern as comments, for the same reason: a reaction
  // can land on someone else's comment, so two people reacting to the same
  // comment at once is the one real collision risk here.
  function toggleReaction(postId, commentId, emoji) {
    setPosts((prev) => prev.map((p) => {
      if (p.id !== postId) return p;
      const comments = (p.comments || []).map((c) => {
        if (c.id !== commentId) return c;
        const reactions = { ...(c.reactions || {}) };
        if (reactions[currentUser] === emoji) delete reactions[currentUser];
        else reactions[currentUser] = emoji;
        return { ...c, reactions };
      });
      return { ...p, comments };
    }));
    boardApi('toggleReaction', { postId, commentId, user: currentUser, emoji }).then(({ post: serverPost }) => {
      if (serverPost) setPosts((prev) => prev.map((p) => p.id === postId ? serverPost : p));
    }).catch((e) => {
      console.error('Failed to save reaction', e);
      showToast('Reaction may not have saved — check your connection.');
    });
  }

  function markSeen(postId) {
    setLastSeen((prev) => {
      const mine = { ...(prev[currentUser] || {}), [postId]: new Date().toISOString() };
      const updated = { ...prev, [currentUser]: mine };
      // Only ever writes the CURRENT user's own field — nobody else's "last seen"
      // data can be clobbered by this.
      boardApi('saveLastSeen', { user: currentUser, seenMap: mine }).catch((e) => console.error('Failed to save last-seen', e));
      return updated;
    });
  }

  function jumpTo(post) {
    setActiveBoard(post.author);
    setJumpToPostId(post.id);
    markSeen(post.id);
  }

  function boardUnread(boardOwner) {
    return getUnreadItems(posts, lastSeen, currentUser).filter((it) => it.post.author === boardOwner).length;
  }

  function activeCount(boardOwner) {
    return posts.filter((p) => p.author === boardOwner && p.status === 'active').length;
  }

  if (!currentUser) return <LoginScreen onSelect={setCurrentUser} />;

  const isOwn = activeBoard === currentUser && USERS.includes(currentUser);
  const visiblePosts = posts.filter((p) => p.author === activeBoard && p.status !== 'archived' && (p.kind || 'post') !== 'topic').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  // Drafts are only visible to the person who created them — everyone else only
  // sees a topic once its author marks it Ready. New topics appear added to the
  // right, oldest to newest, like a left-to-right strip rather than stacking.
  const visibleTopics = posts
    .filter((p) => p.author === activeBoard && (p.kind === 'topic') && (p.status === 'ready' || (p.status === 'draft' && p.author === currentUser)))
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 flex flex-col">
      <header className="bg-neutral-900 border-b border-neutral-800 px-3 md:px-6 py-3.5 flex items-center flex-wrap gap-y-2 justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
            <span className="text-neutral-900 font-serif italic text-sm">CD</span>
          </div>
          <div>
            <div className="text-sm font-medium text-neutral-100 leading-tight">The Content Desk</div>
            <div className="text-xs text-neutral-600 leading-tight">Headlines &amp; social leads</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {pushStatus === 'default' && (
            <button onClick={enableNotifications}
              className="flex items-center gap-1.5 text-xs border border-amber-700 rounded-lg px-2.5 py-1.5 text-amber-300 hover:bg-amber-700 hover:text-neutral-900" title="Enable push notifications on this device">
              <BellRing className="w-3.5 h-3.5" /> <span className="sm:hidden">Notify me</span><span className="hidden sm:inline">Enable notifications</span>
            </button>
          )}
          {pushStatus === 'ios-needs-install' && (
            <button onClick={() => showToast('On iPhone: tap the Share icon in Safari → "Add to Home Screen" → open the app from your Home Screen, then try again.')}
              className="flex items-center gap-1.5 text-xs border border-neutral-700 rounded-lg px-2.5 py-1.5 text-neutral-400 hover:border-amber-500 hover:text-amber-300" title="Add to Home Screen to enable notifications on iPhone">
              <BellOff className="w-3.5 h-3.5" /> <span className="sm:hidden">Add to Home Screen</span><span className="hidden sm:inline">Add to Home Screen for notifications</span>
            </button>
          )}
          {pushStatus === 'denied' && (
            <span className="flex items-center gap-1.5 text-xs text-neutral-600" title="Notifications are blocked in your browser settings">
              <BellOff className="w-3.5 h-3.5" /> <span className="sm:hidden">Blocked</span><span className="hidden sm:inline">Notifications blocked</span>
            </span>
          )}
          <NotificationBell posts={posts} lastSeen={lastSeen} currentUser={currentUser} onJump={jumpTo} />
          <div className="flex items-center gap-2 border border-neutral-800 rounded-full pl-1 pr-3 py-1">
            <Avatar name={currentUser} size="w-6 h-6 text-xs" />
            <span className="text-sm text-neutral-200">{currentUser}</span>
            {currentUser === MANAGER && <span className="text-xs text-amber-400">manager</span>}
          </div>
          {currentUser === MANAGER && (
            <button onClick={clearAllPosts} className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-500 hover:text-rose-400" title="Clear all posts (testing)">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => { setCurrentUser(null); setActiveBoard(null); }} className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-500" title="Switch user">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-col md:flex-row">
        <aside className="w-full md:w-56 border-b md:border-b-0 md:border-r border-neutral-800 bg-neutral-900 p-3 md:p-4 shrink-0">
          {USERS.includes(currentUser) && (
            <>
              <div className="hidden md:block text-xs uppercase tracking-wider text-neutral-600 mb-2">My board</div>
              <button onClick={() => setActiveBoard(currentUser)}
                className={`shrink-0 md:w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm mb-0 md:mb-4 ${activeBoard === currentUser ? 'bg-neutral-800 text-amber-300 border-l-2 border-amber-400' : 'text-neutral-400 hover:bg-neutral-800'}`}>
                <span className="flex items-center gap-2 whitespace-nowrap"><Avatar name={currentUser} size="w-5 h-5 text-xs" /> {currentUser}</span>
                <span className="flex items-center gap-1.5">
                  {activeCount(currentUser) > 0 && <span className="bg-neutral-700 text-neutral-300 text-xs rounded-full min-w-4 h-4 px-1 flex items-center justify-center" title="active posts">{activeCount(currentUser)}</span>}
                  {boardUnread(currentUser) > 0 && <span className="bg-rose-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center" title="unread mentions/comments">{boardUnread(currentUser)}</span>}
                </span>
              </button>
            </>
          )}
          <div className="hidden md:block text-xs uppercase tracking-wider text-neutral-600 mb-2">Team</div>
          <div className="flex md:block gap-2 overflow-x-auto md:overflow-visible md:space-y-1 pb-1 md:pb-0 -mx-3 md:mx-0 px-3 md:px-0">
            {USERS.filter((u) => u !== currentUser).map((u) => (
              <button key={u} onClick={() => setActiveBoard(u)}
                className={`shrink-0 md:w-full md:shrink flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm ${activeBoard === u ? 'bg-neutral-800 text-amber-300 border-l-2 border-amber-400' : 'text-neutral-400 hover:bg-neutral-800'}`}>
                <span className="flex items-center gap-2 whitespace-nowrap"><Avatar name={u} size="w-5 h-5 text-xs" /> {u}</span>
                <span className="flex items-center gap-1.5">
                  {activeCount(u) > 0 && <span className="bg-neutral-700 text-neutral-300 text-xs rounded-full min-w-4 h-4 px-1 flex items-center justify-center" title="active posts">{activeCount(u)}</span>}
                  {boardUnread(u) > 0 && <span className="bg-rose-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center" title="unread mentions/comments">{boardUnread(u)}</span>}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-3 md:p-6">
          <div className="flex items-center justify-between mb-5 max-w-6xl">
            <div>
              <h2 className="text-lg font-medium text-neutral-100">{isOwn ? 'My Board' : `${activeBoard}'s Board`}</h2>
              {!isOwn && <p className="text-xs text-neutral-600 mt-0.5">Read-only — you can leave comments below each item</p>}
            </div>
          </div>

          <TopicsRow
            topics={visibleTopics}
            currentUser={currentUser}
            isOwn={isOwn}
            onCreateTopic={createTopic}
            onEditField={editField}
            onMarkReady={markTopicReady}
            onAddSnippetImages={addSnippetImages}
            onRemoveSnippetImage={removeSnippetImage}
            onDelete={archivePost}
            onToggleTopicReaction={toggleTopicReaction}
            onAddComment={addComment}
            onEditComment={editComment}
            onToggleReaction={toggleReaction}
            onOpenComments={markSeen}
            jumpToPostId={jumpToPostId}
            onJumpHandled={() => setJumpToPostId(null)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl">
            {[
              { kind: 'post', title: 'Posts', accent: 'text-neutral-400' },
              { kind: 'story', title: 'Stories', accent: 'text-neutral-400' },
            ].map((col) => {
              const colPosts = visiblePosts.filter((p) => (p.kind || 'post') === col.kind);
              return (
                <section key={col.kind} className="min-w-0">
                  <div className={`text-sm font-medium mb-3 ${col.accent}`}>{col.title}</div>
                  {isOwn && <NewPostForm onCreate={createPost} kind={col.kind} />}
                  {colPosts.length === 0 && (
                    <div className="text-center py-12 text-neutral-700 border border-dashed border-neutral-800 rounded-xl">
                      <p className="text-sm">{isOwn ? `No ${col.kind === 'story' ? 'stories' : 'posts'} yet.` : 'Nothing here yet.'}</p>
                    </div>
                  )}
                  {colPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUser={currentUser}
                      canEdit={isOwn}
                      onTogglePinHeadline={togglePinHeadline}
                      onTogglePinLead={togglePinLead}
                      onToggleSuggestions={toggleSuggestions}
                      onRetry={retryPost}
                      onEditField={editField}
                      onAddSnippetImages={addSnippetImages}
                      onRemoveSnippetImage={removeSnippetImage}
                      onFormat={formatPost}
                      onArchive={archivePost}
                      onAddComment={addComment}
                      onEditComment={editComment}
                      onToggleReaction={toggleReaction}
                      onOpenComments={markSeen}
                      jumpToPostId={jumpToPostId}
                      onJumpHandled={() => setJumpToPostId(null)}
                    />
                  ))}
                </section>
              );
            })}
          </div>
        </main>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-neutral-800 border border-neutral-700 text-neutral-100 rounded-lg px-4 py-2.5 text-sm shadow-xl z-40">
          {toast}
        </div>
      )}
    </div>
  );
}
