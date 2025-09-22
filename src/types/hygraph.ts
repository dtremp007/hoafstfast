// Hygraph GraphQL response types
import type { SectionType } from "../components/sections/RenderSection.astro";

export interface HygraphImage {
  url: string;
}

export interface ImageSection {
  title: string;
  description: string;
  image: HygraphImage;
  sectionType: SectionType;
}

export interface Page {
  title: string;
  sections: ImageSection[];
}

export interface HygraphResponse {
  data: {
    page: Page;
  };
}

export interface PageQueryVariables {
  slug: string;
}
