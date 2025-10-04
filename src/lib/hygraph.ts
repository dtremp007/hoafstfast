import type {
  PageResponse,
  PageQueryVariables,
  EventsResponse,
  FeedbackResponse,
  MessageType,
} from "../types/hygraph";

// Use import.meta.env for server-side env variables
// These are only available on the server, not exposed to client
const HYGRAPH_ENDPOINT = import.meta.env.HYGRAPH_ENDPOINT;
const HYGRAPH_PERMANENT_AUTH_TOKEN = import.meta.env
  .HYGRAPH_PERMANENT_AUTH_TOKEN;

export async function fetchPageData(
  variables: PageQueryVariables
): Promise<PageResponse> {
  const query = `
query GetPage($slug: String!) {
  page(where: {slug: $slug}) {
    title
    sections {
      __typename
      ... on ImageSection {
        __typename
        title
        description
        image {
          width
          height
          url
        }
        sectionType
        buttons {
          ... on Button {
            text
            url
          }
        }
      }
      ... on GridSection {
        __typename
        heading
        columns {
          __typename
          ... on ContentColumn {
            image {
              width
              height
              url
            }
            content {
              html
            }
          }
        }
      }
    ... on GallerySection {
        __typename
            images {
            width
            height
            url
            }
        }
        ... on YouTubeSection {
            __typename
            videoId
        }
    }
  }
}


  `;

  const response = await fetch(HYGRAPH_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    // show message
    const message = await response.json();
    console.error("Error fetching page data:", message);
    throw new Error(message.errors[0].message);
  }

  const data: PageResponse = await response.json();
  return data;
}

export async function fetchEvents(): Promise<EventsResponse> {
  const query = `
      query GetEvents {
        events(locales: [es_MX] first: 100 orderBy: startTime_DESC) {
          id
          title
          startTime
          endTime
        }
      }
    `;

  const response = await fetch(HYGRAPH_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    const message = await response.json();
    console.error("Error fetching events:", message);
    throw new Error(message.errors?.[0]?.message || "Failed to fetch events");
  }

  const data: EventsResponse = await response.json();
  return data;
}

// Submit text feedback
export async function submitTextFeedback(
  textContent: string,
  language: string = "es"
): Promise<FeedbackResponse> {
  const mutation = `
    mutation CreateTextFeedback($textContent: String!, $language: String) {
      createFeedback(
        data: {
          messageType: TEXT
          textContent: $textContent
          language: $language
          source: "event-feedback-form"
        }
      ) {
        id
        createdAt
        messageType
        textContent
      }
    }
  `;

  const response = await fetch(HYGRAPH_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${HYGRAPH_PERMANENT_AUTH_TOKEN}`,
    },
    body: JSON.stringify({
      query: mutation,
      variables: { textContent, language },
    }),
  });

  if (!response.ok) {
    const message = await response.json();
    console.error("Error submitting text feedback:", message);
    throw new Error(
      message.errors?.[0]?.message || "Failed to submit text feedback"
    );
  }

  const data: FeedbackResponse = await response.json();
  return data;
}

// Upload audio file to HyGraph (new asset system with S3 pre-signed URLs)
async function uploadAudioFile(audioBlob: Blob): Promise<string> {
  const fileName = `feedback-${Date.now()}.webm`;

  // Step 1: Create asset entry and get pre-signed upload URL
  const createAssetMutation = `
    mutation CreateAssetForUpload($fileName: String!) {
      createAsset(data: { fileName: $fileName }) {
        id
        upload {
          requestPostData {
            url
            date
            key
            signature
            algorithm
            policy
            credential
            securityToken
          }
          expiresAt
        }
      }
    }
  `;

  const createResponse = await fetch(HYGRAPH_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${HYGRAPH_PERMANENT_AUTH_TOKEN}`,
    },
    body: JSON.stringify({
      query: createAssetMutation,
      variables: { fileName },
    }),
  });

  if (!createResponse.ok) {
    const message = await createResponse.json();
    console.error("Error creating asset:", message);
    throw new Error(message.errors?.[0]?.message || "Failed to create asset");
  }

  const createData = await createResponse.json();
  const assetId = createData.data.createAsset.id;
  const uploadData = createData.data.createAsset.upload.requestPostData;

  // Step 2: Upload file to S3 using pre-signed URL
  const formData = new FormData();
  formData.append("X-Amz-Date", uploadData.date);
  formData.append("key", uploadData.key);
  formData.append("X-Amz-Signature", uploadData.signature);
  formData.append("X-Amz-Algorithm", uploadData.algorithm);
  formData.append("policy", uploadData.policy);
  formData.append("X-Amz-Credential", uploadData.credential);
  formData.append("X-Amz-Security-Token", uploadData.securityToken);
  formData.append("file", audioBlob, fileName); // file must be last

  const uploadResponse = await fetch(uploadData.url, {
    method: "POST",
    body: formData,
  });

  if (!uploadResponse.ok) {
    console.error("Error uploading to S3:", uploadResponse);
    throw new Error("Failed to upload audio to storage");
  }

  return assetId;
}

async function publishAsset(assetId: string): Promise<void> {
  const mutation = `
    mutation PublishAsset($assetId: ID!) {
      publishAsset(where: { id: $assetId }, to: PUBLISHED) {
        id
      }
    }
  `;

  const response = await fetch(HYGRAPH_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${HYGRAPH_PERMANENT_AUTH_TOKEN}`,
    },
    body: JSON.stringify({
      query: mutation,
      variables: { assetId },
    }),
  });

  if (!response.ok) {
    const message = await response.json();
    console.error("Error publishing asset:", message);
    throw new Error(message.errors?.[0]?.message || "Failed to publish asset");
  }

  const data = await response.json();
  return data;
}

async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Submit audio feedback
export async function submitAudioFeedback(
  audioBlob: Blob,
  language: string = "en"
): Promise<FeedbackResponse> {
  // First upload the audio file
  const assetId = await uploadAudioFile(audioBlob);

  // Wait for asset to be ready
  await wait(1000);

  await publishAsset(assetId);

  const mutation = `
    mutation CreateAudioFeedback($assetId: ID!, $language: String) {
      createFeedback(
        data: {
          messageType: AUDIO
          audioFile: { connect: { id: $assetId } }
          language: $language
          source: "event-feedback-form"
        }
      ) {
        id
        createdAt
        messageType
        audioFile {
          url
        }
      }
    }
  `;

  // Authorization: Bearer PERMANENT_AUTH_TOKEN

  const response = await fetch(HYGRAPH_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${HYGRAPH_PERMANENT_AUTH_TOKEN}`,
    },
    body: JSON.stringify({
      query: mutation,
      variables: { assetId, language },
    }),
  });

  if (!response.ok) {
    const message = await response.json();
    console.error("Error submitting audio feedback:", message);
    throw new Error(
      message.errors?.[0]?.message || "Failed to submit audio feedback"
    );
  }

  const data: FeedbackResponse = await response.json();
  return data;
}
