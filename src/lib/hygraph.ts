import type { HygraphResponse, PageQueryVariables } from "../types/hygraph";

const HYGRAPH_ENDPOINT = import.meta.env.HYGRAPH_ENDPOINT;

export async function fetchPageData(
  variables: PageQueryVariables
): Promise<HygraphResponse> {
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

  const data: HygraphResponse = await response.json();
  return data;
}
