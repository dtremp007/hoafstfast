import type {
  PageResponse,
  PageQueryVariables,
  EventsResponse,
} from "../types/hygraph";

const HYGRAPH_ENDPOINT = import.meta.env.HYGRAPH_ENDPOINT;

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
