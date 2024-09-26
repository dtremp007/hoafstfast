import {type Event as Event} from "@/types/event";
import {ChevronRight, Clock, MapPin} from "lucide-react";

export function EventCard({event}: { event: Event }) {
    return (
        <div className="bg-card shadow rounded-lg mb-2 flex border border-border">
            <div className="bg-primary w-2 rounded-l-lg"></div>
            <div className="p-4 flex-grow">
                <h3 className="font-semibold">{event.name}</h3>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <Clock className="w-4 h-4 mr-1"/>
                    <span>{event.time}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <MapPin className="w-4 h-4 mr-1"/>
                    <span>{event.location}</span>
                </div>
            </div>
            <div className="flex items-center pr-2">
                <ChevronRight className="w-5 h-5 text-muted-foreground"/>
            </div>
        </div>)
}
