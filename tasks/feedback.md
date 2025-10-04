# Product Requirements Document (PRD)

**Project:** Feedback Chat Interface
**Owner:** [Your Name]
**Developer:** Junior Developer
**Date:** [Insert Date]

---

## 1. Objective

Build a **simple chat-style feedback interface** for a community event website. Users should be able to submit written or audio feedback, see their submission in a chat history, and receive a confirmation message.

The interface must be **lightweight, mobile-first, accessible, and familiar** (similar to WhatsApp).

* **No user accounts / no personal info collected**
* **History saved locally** (using localStorage)
* **Feedback sent to backend (HyGraph)**

---

## 2. User Experience (UX)

### Layout

* **Chat interface** in the center of the page.
* **Message bubbles** (left = system, right = user).
* **Text input box** fixed at the bottom with:

  * Text input field
  * **Microphone button** to record/send audio

### Flow

1. **On page load**:

   * Show initial “system” chat bubble(s):

     * Text bubble: “Welcome! Please share your feedback.”
     * Audio bubble (optional): an audio clip in the local language saying the same thing.

2. **User submits text**:

   * User types in textbox → presses **send** → bubble appears in chat (right side).
   * System replies with a hardcoded confirmation bubble: *“Thanks! Your feedback has been received.”*

3. **User submits audio**:

   * User clicks microphone button → recording starts (show timer + stop button).
   * User presses stop → preview (playback + re-record option).
   * User presses send → audio bubble appears in chat (right side).
   * System replies with a hardcoded confirmation bubble (same as text).

4. **Chat persistence**:

   * All messages saved in `localStorage`.
   * When the page reloads, chat history is restored.

---

## 3. Functional Requirements

### Core Features

* **Send Text Feedback**

  * Textbox input at bottom.
  * Submit on “Enter” or send button.
  * Add message to chat view.
  * Save to localStorage + send to HyGraph.

* **Send Audio Feedback**

  * Mic button triggers recording.
  * Show recording status (timer, stop button).
  * Allow re-record before sending.
  * Save audio blob locally (localStorage reference) + upload to HyGraph.
  * Show as audio bubble in chat.

* **Chat UI**

  * WhatsApp-like bubbles (left system, right user).
  * Different styling for text vs audio.
  * System bubbles hardcoded for onboarding + confirmation.

* **Local Storage**

  * Store chat messages (`[{ type: "text"|"audio"|"system", content, timestamp }]`).
  * Reload restores full history.

* **Backend (HyGraph) Integration**

  * Each submission creates a new “Feedback” entry.
  * Fields required (see section 4).
  * No user identification stored.

---

## 4. HyGraph Schema

Create a `Feedback` model with fields:

| Field Name    | Type                   | Notes                              |
| ------------- | ---------------------- | ---------------------------------- |
| `id`          | System                 | Auto-generated                     |
| `createdAt`   | DateTime               | Auto-generated                     |
| `messageType` | Enum (`TEXT`, `AUDIO`) | To distinguish submission type     |
| `textContent` | String (optional)      | Used if messageType = TEXT         |
| `audioFile`   | Asset (optional)       | File upload if messageType = AUDIO |
| `language`    | String (optional)      | For future multi-language support  |
| `source`      | String                 | Hardcode: `"event-feedback-form"`  |

---

## 5. Technical Requirements

* **Framework**: Astro with **React integration**

  * Install React integration in Astro (`@astrojs/react`)
  * Build chat component in React (stateful UI, easier localStorage handling).

* **Styling**: TailwindCSS (already in project).

  * Bubble styles: rounded, light gray for system, green/blue for user.

* **Audio Recording**:

  * Use Web MediaRecorder API.
  * Encode as WebM or WAV.
  * Upload to HyGraph via GraphQL file upload API.

* **Data Handling**:

  * On submission, push entry to localStorage + call HyGraph mutation.
  * Errors in upload: show fallback system message (“Your feedback couldn’t be uploaded. Please try again.”).

---

## 6. Non-Functional Requirements

* **Privacy**: No collection of email, phone, or names.
* **Accessibility**: Buttons must be clearly labeled; include alt text/icons.
* **Performance**: Limit audio file size (e.g. 1 min max per clip).
* **Mobile-first**: Must work smoothly on phones (primary device for community).

---

## 7. Deliverables

* React Chat component integrated in Astro page.
* LocalStorage-based chat history persistence.
* HyGraph schema + mutations for feedback submission.
* Clean, WhatsApp-like interface (simple, no fluff).
* Text + audio submission fully working.

---

## 8. Future Enhancements (not in v1)

* Admin dashboard to review feedback inside the site.
* Optional speech-to-text transcription.
* Multiple language support.
