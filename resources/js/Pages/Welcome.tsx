import {type Event as Event} from "@/types/event";
import React from "react";
import {EventCard} from "@/components/EventCard";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Head} from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";

type EventScheduleProps = {
    eventsByDay: {
        date: string;
        hourBlocks: {
            hour: string;
            events: Event[];
        }[];
    }[]
}

const EventSchedule = ({eventsByDay}: EventScheduleProps) => {
    // return (
    //     <pre>
    //         {JSON.stringify(eventsByDay, null, 2)}
    //     </pre>
    // )

    // choose today or the first day
    const [activeDay, setActiveDay] = React.useState(eventsByDay[1].date);

    const handleTabChange = (value: string) => {
        setActiveDay(value);
    };

    return (
        <div className="max-w-md mx-auto w-full bg-background">
            <Head>
                <title>Schedule</title>
                <meta name="description"
                      content="Hoafstfast is an annual harvest festival by Manitoba Colony community."/>
            </Head>
            <h1 className="text-2xl font-bold text-center py-3 sticky top-0 bg-background">Hoafstfast 🌽</h1>

            <Tabs defaultValue={activeDay} onValueChange={handleTabChange}>
                <TabsList
                    className="rounded-none bg-background grid w-full mx-auto grid-cols-3 px-3 py-2 sticky top-14 h-full shadow-md">
                    {eventsByDay.slice(0, 3).map((day, index) => (
                        <TabsTrigger key={day.date} value={day.date}
                                     className="text-center data-[state=active]:border-b-2 rounded-none border-primary data-[state=active]:shadow-none">
                            <div
                                className="font-semibold">{new Date(day.date).toLocaleDateString('en-US', {weekday: 'long'})}</div>
                            <div className="ml-2">{new Date(day.date).getDate()}</div>
                        </TabsTrigger>
                    ))}
                </TabsList>

                {eventsByDay.map((day) => (
                    <TabsContent key={day.date} value={day.date} className="space-y-2 px-3 pb-10">
                        {day.hourBlocks.map((hourBlock) => (
                            <React.Fragment key={hourBlock.hour}>
                                <div className="flex items-center text-muted-foreground">
                                    <div className="text-right pr-2">{hourBlock.hour}</div>
                                    <div className="flex-1 h-px bg-border"></div>
                                </div>
                                {hourBlock.events.map((event, index) => (
                                    <EventCard event={event} key={index}/>
                                ))}
                            </React.Fragment>
                        ))}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}

EventSchedule.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>

export default EventSchedule

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
