# Feedback Chat Interface - Setup Guide

## Overview

The feedback chat interface allows users to submit text or audio feedback in a WhatsApp-style chat interface. All feedback is stored in HyGraph (Hygraph CMS).

## Features

✅ WhatsApp-style chat interface
✅ Text feedback submission
✅ Audio recording and submission (up to 60 seconds)
✅ Local storage persistence (chat history saved in browser)
✅ Mobile-first, responsive design
✅ No user authentication required
✅ Dark theme matching WhatsApp aesthetic
✅ **Secure server-side actions** - Auth tokens never exposed to client

## Architecture

The implementation uses [Astro Actions](https://docs.astro.build/en/guides/actions/) for secure server-side data submission:

- **Client**: React component handles UI and user interactions
- **Actions**: Type-safe server functions that validate input and call Hygraph API
- **HyGraph**: Stores feedback entries and audio files securely

This architecture ensures your `HYGRAPH_PERMANENT_AUTH_TOKEN` **never** reaches the client, keeping your API credentials secure.

## Technical Implementation

### Astro Actions

The feedback system uses two Astro Actions defined in `/src/actions/index.ts`:

1. **`submitText`** - Handles text feedback with Zod validation
   - Accepts: JSON with `textContent` and optional `language`
   - Validates: Text length (1-5000 characters)
   - Returns: Feedback entry or error

2. **`submitAudio`** - Handles audio file uploads
   - Accepts: FormData with `audio` file and optional `language`
   - Validates: File type (audio only)
   - Uploads to Hygraph using S3 pre-signed URLs
   - Returns: Feedback entry with audio URL or error

These actions run **entirely on the server**, keeping your authentication tokens secure. The React component calls them using:

```typescript
// Text submission
const { data, error } = await actions.submitText({
  textContent: "User feedback here",
  language: "es"
});

// Audio submission
const formData = new FormData();
formData.append("audio", audioFile);
formData.append("language", "es");
const { data, error } = await actions.submitAudio(formData);
```

Reference: [Astro Actions Documentation](https://docs.astro.build/en/guides/actions/)

## HyGraph Schema Setup

You need to create a `Feedback` model in your HyGraph project with the following fields:

### Model: `Feedback`

| Field Name      | Type          | Configuration                     |
|----------------|---------------|-----------------------------------|
| `id`           | ID            | System field (auto-generated)     |
| `createdAt`    | DateTime      | System field (auto-generated)     |
| `messageType`  | Enumeration   | Values: `TEXT`, `AUDIO`           |
| `textContent`  | String        | Optional, Multi-line              |
| `audioFile`    | Asset         | Optional, Allow multiple: No      |
| `language`     | String        | Optional, Single line             |
| `source`       | String        | Required, Single line             |

### Step-by-Step Instructions

1. **Create the Model:**
   - In HyGraph, go to **Schema**
   - Click **Add Model**
   - Name it `Feedback`
   - Display field: `createdAt`

2. **Add Enumeration (messageType):**
   - Click **Add Field**
   - Select **Enumeration**
   - Field name: `messageType`
   - Add values: `TEXT`, `AUDIO`
   - Make it **Required**

3. **Add String Field (textContent):**
   - Click **Add Field**
   - Select **String**
   - Field name: `textContent`
   - Type: **Multi-line**
   - Keep it **Optional**

4. **Add Asset Field (audioFile):**
   - Click **Add Field**
   - Select **Asset**
   - Field name: `audioFile`
   - Allow multiple: **No**
   - Keep it **Optional**

5. **Add String Field (language):**
   - Click **Add Field**
   - Select **String**
   - Field name: `language`
   - Type: **Single line**
   - Keep it **Optional**

6. **Add String Field (source):**
   - Click **Add Field**
   - Select **String**
   - Field name: `source`
   - Type: **Single line**
   - Make it **Required**
   - Default value: `event-feedback-form`

7. **Set Permissions:**
   - Go to **Settings** > **API Access**
   - Make sure your Permanent Auth Token has:
     - **Mutations** permission enabled
     - **Asset Uploads** permission enabled
   - These permissions allow the backend to create feedback entries and upload audio files

## Asset Upload System

The implementation uses Hygraph's **new asset system** which leverages AWS S3 pre-signed URLs for secure file uploads. The process works as follows:

1. **Create Asset Entry**: First, a GraphQL mutation creates an asset entry in Hygraph
2. **Get Pre-signed URL**: Hygraph returns a pre-signed S3 URL with temporary credentials
3. **Upload to S3**: The audio file is uploaded directly to AWS S3 using the pre-signed URL
4. **Connect to Feedback**: The asset ID is then connected to the feedback entry

This two-step process ensures secure file uploads without exposing permanent credentials to the client.

Reference: [Hygraph Asset Upload Documentation](https://hygraph.com/docs/api-reference/assets/uploading-assets#upload-by-file)

## Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Your Hygraph API endpoint
# Format: https://[region].hygraph.com/v2/[projectId]/[environment]
HYGRAPH_ENDPOINT=https://your-region.hygraph.com/v2/your-project-id/master

# Permanent Auth Token for mutations and asset uploads
HYGRAPH_PERMANENT_AUTH_TOKEN=your_permanent_auth_token_here
```

> 💡 **Tip**: Copy `.env.example` to `.env` and fill in your actual values.

### Getting Your Permanent Auth Token

1. Go to your Hygraph project dashboard
2. Navigate to **Settings** > **API Access** > **Permanent Auth Tokens**
3. Click **Create Token**
4. Give it a descriptive name (e.g., "Feedback Upload Token")
5. Enable the following permissions:
   - **Mutations**: Required for creating feedback entries
   - **Asset Uploads**: Required for uploading audio files
6. Copy the token and add it to your `.env` file

> ⚠️ **Important**: Never commit your `.env` file or expose your auth token in client-side code. The current implementation uses `import.meta.env` which is safe for Astro's server-side rendering.

## Usage

1. Navigate to `/feedback` on your website
2. Users will see a welcome message
3. Users can:
   - Type text feedback and press Enter or click Send
   - Click the microphone icon to record audio (up to 60 seconds)
   - Review audio before sending
4. Each submission is saved locally AND sent to HyGraph
5. Users receive a confirmation message after successful submission

## Local Storage

Chat history is saved in the browser's localStorage under the key `feedback-chat-history`. This allows users to see their previous feedback when they return to the page.

**Audio Persistence**: When audio feedback is submitted, the chat initially displays a temporary blob URL for immediate playback. After successful upload to Hygraph, the message is automatically updated with the permanent Hygraph URL. This ensures:
- Audio messages work even after page reloads
- No broken blob URLs in chat history
- Proper memory management (blob URLs are cleaned up)
- Messages persist across sessions

## Testing

To test the feedback system:

1. Start your dev server: `pnpm dev`
2. Navigate to `http://localhost:4321/feedback`
3. Submit text feedback
4. Try recording and submitting audio feedback
5. Verify submissions appear in your HyGraph dashboard

## Browser Requirements

- Modern browsers with MediaRecorder API support (Chrome, Firefox, Edge, Safari 14.1+)
- Microphone permissions for audio feedback
- localStorage enabled

### Cross-Browser Audio Support

The feedback system automatically detects and uses the best supported audio format for each browser:

- **Chrome/Edge**: `audio/webm` (Opus codec)
- **Firefox**: `audio/webm` or `audio/ogg`
- **Safari/iOS**: `audio/mp4` or `audio/mpeg`

The system tries formats in order of preference and uses the first supported format, ensuring audio recording works across all major browsers and mobile devices.

## Troubleshooting

### Audio not recording
- Check browser console for permission errors
- Ensure microphone permissions are granted
- Test in a secure context (https:// or localhost)
- On iOS: Make sure you're using Safari (Chrome iOS uses Safari's engine)
- Check if MediaRecorder API is supported in your browser

### Submissions not saving to HyGraph
- Verify `HYGRAPH_ENDPOINT` environment variable is set correctly
- Check `HYGRAPH_PERMANENT_AUTH_TOKEN` is set and has correct permissions
- Check API permissions in HyGraph dashboard (Mutations + Asset Uploads)
- Review server logs (not browser console) for API errors
- Ensure HyGraph Feedback model exists with correct schema

### Chat history not persisting
- Ensure localStorage is enabled in browser
- Check browser privacy settings
- Test in a non-incognito/private window

### Action errors in browser console
- Check the Network tab for `/_actions/*` requests
- Server errors will show in your Astro dev server console
- Verify Zod validation by checking input data format

## Customization

### Change Language
The interface is currently in Spanish. To change the language, update the text strings in:
- `/src/components/FeedbackChat.tsx` (component messages)
- System welcome and confirmation messages

### Adjust Recording Time Limit
The default maximum recording time is 60 seconds. To change this:
- Edit line 136 in `FeedbackChat.tsx`
- Change `if (prev >= 60)` to your desired seconds

### Modify Colors
The component uses WhatsApp-inspired colors:
- User bubbles: `#005c4b` (WhatsApp green)
- System bubbles: `#1f2c34` (dark gray)
- Background: `#0d1418` (dark blue-black)

Update these colors in the component's className strings to match your brand.

## Security Features

✅ **Server-side execution** - All Hygraph API calls run on the server
✅ **No token exposure** - Auth tokens never sent to client
✅ **Input validation** - Zod schemas validate all user input
✅ **Type safety** - Full TypeScript support end-to-end
✅ **Error handling** - Standardized error responses with ActionError
✅ **File validation** - Audio files validated before upload
✅ **Memory management** - Blob URLs properly cleaned up to prevent leaks
✅ **Persistent audio** - Audio messages use permanent Hygraph URLs

## File Structure

```
src/
├── actions/
│   └── index.ts              # Astro Actions (submitText, submitAudio)
├── components/
│   └── FeedbackChat.tsx      # React chat UI component
├── lib/
│   └── hygraph.ts            # Hygraph API functions (server-side only)
├── pages/
│   └── feedback.astro        # Feedback page route
└── types/
    └── hygraph.ts            # TypeScript types for Feedback
```

## Future Enhancements

Potential improvements (not currently implemented):
- Admin dashboard to view feedback
- Speech-to-text transcription
- Multi-language support with language detection
- Export feedback to CSV
- Real-time notifications for new feedback
- Rate limiting on actions
- User session tracking (optional)
