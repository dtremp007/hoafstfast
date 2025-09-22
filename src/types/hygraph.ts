// Hygraph GraphQL response types
import type { SectionType } from "../components/sections/ImageSection/RenderSection.astro";

export interface HygraphImage {
  url: string;
  width: number;
  height: number;
}

export interface ImageSection {
  __typename: "ImageSection";
  title: string;
  description: string;
  image: HygraphImage;
  sectionType: SectionType;
}

export interface ContentColumn {
  __typename: "ContentColumn";
  image: HygraphImage;
  content: {
    html: string;
  };
}

export interface GridSection {
  __typename: "GridSection";
  heading?: string;
  columns: ContentColumn[];
}

export interface GallerySection {
  __typename: "GallerySection";
  images: HygraphImage[];
}

export interface YouTubeSection {
  __typename: "YouTubeSection";
  videoId: string;
}

export interface Page {
  title: string;
  sections: Array<ImageSection | GridSection | GallerySection | YouTubeSection>;
}

export interface HygraphResponse {
  data: {
    page: Page;
  };
}

export interface PageQueryVariables {
  slug: string;
}
