import {type Event as Event} from "@/types/event";
import React from "react";
import {EventCard} from "@/components/EventCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {Inertia} from "@inertiajs/inertia";
import {usePage} from "@inertiajs/react";

type EventScheduleProps = {
    eventsByDay: {
        date: string;
        hourBlocks: {
            hour: string;
            events: Event[];
        }[];
    }[]
}

export default function EventSchedule({ eventsByDay }: EventScheduleProps) {
    // return (
    //     <pre>
    //         {JSON.stringify(eventsByDay, null, 2)}
    //     </pre>
    // )

    const [activeDay, setActiveDay] = React.useState(eventsByDay[0]?.date);

    const handleTabChange = (value: string) => {
        setActiveDay(value);
    };

    return (
        <div className="max-w-md mx-auto bg-background">
            <h1 className="text-2xl font-bold text-center py-4">Harvest Festival</h1>

            <Tabs defaultValue={activeDay} onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-3">
                    {eventsByDay.map((day, index) => (
                        <TabsTrigger key={day.date} value={day.date} className="text-center">
                            <div className="font-semibold">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' })}</div>
                            <div className="text-sm ml-2">{new Date(day.date).getDate()}</div>
                        </TabsTrigger>
                    ))}
                </TabsList>

                {eventsByDay.map((day) => (
                    <TabsContent key={day.date} value={day.date} className="space-y-4">
                        {day.hourBlocks.map((hourBlock) => (
                            <React.Fragment key={hourBlock.hour}>
                                <div className="flex items-center text-muted-foreground">
                                    <div className="text-right pr-2">{hourBlock.hour}</div>
                                    <div className="flex-1 h-px bg-border"></div>
                                </div>
                                {hourBlock.events.map((event, index) => (
                                    <EventCard event={event} key={index} />
                                ))}
                            </React.Fragment>
                        ))}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}

function convertTo12HourFormat(time24: string): string {
    const [hours, minutes] = time24.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));

    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}
