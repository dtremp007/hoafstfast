// Hygraph GraphQL response types
import type { SectionType } from "../components/sections/ImageSection/RenderSection.astro";

export interface HygraphImage {
  url: string;
  width: number;
  height: number;
}

export interface HygraphButton {
  text: string;
  url: string;
}

export interface ImageSection {
  __typename: "ImageSection";
  title: string;
  description: string;
  image: HygraphImage;
  sectionType: SectionType;
  buttons: HygraphButton[];
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

export interface EventItem {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
}

export interface EventsResponse {
  data: {
    events: EventItem[];
  };
}

export interface Page {
  title: string;
  sections: Array<ImageSection | GridSection | GallerySection | YouTubeSection>;
}

export interface PageResponse {
  data: {
    page: Page;
  };
}

export interface PageQueryVariables {
  slug: string;
}

// Feedback types
export enum MessageType {
  TEXT = "TEXT",
  AUDIO = "AUDIO"
}

export interface FeedbackInput {
  messageType: MessageType;
  textContent?: string;
  audioFile?: File;
  language?: string;
  source: string;
}

export interface Feedback {
  id: string;
  createdAt: string;
  messageType: MessageType;
  textContent?: string;
  audioFile?: {
    url: string;
  };
  language?: string;
  source: string;
}

export interface FeedbackResponse {
  data: {
    createFeedback: Feedback;
  };
}

// Local chat message types
export interface ChatMessage {
  id: string;
  type: "text" | "audio" | "system";
  content: string; // text content or audio URL
  timestamp: number;
  isUser: boolean;
}
