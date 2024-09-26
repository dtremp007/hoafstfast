export type Event = {
    id?: number;
    name: string;
    description: string;
    location_id: number;
    location: string;
    day: string;
    time: string;
    duration: string;
    media?: { original_url: string }[];
};
