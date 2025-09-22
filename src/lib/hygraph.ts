import type { HygraphResponse, PageQueryVariables } from '../types/hygraph';

const HYGRAPH_ENDPOINT = import.meta.env.HYGRAPH_ENDPOINT;

export async function fetchPageData(variables: PageQueryVariables): Promise<HygraphResponse> {
  const query = `
    query GetPage($slug: String!) {
      page(where: {slug: $slug}) {
        title
        sections {
          ... on ImageSection {
            title
            description
            image {
              url
            }
            sectionType
          }
        }
      }
    }
  `;

  const response = await fetch(HYGRAPH_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: HygraphResponse = await response.json();
  return data;
}
