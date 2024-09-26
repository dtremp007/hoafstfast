import React from "react";
import {useForm, usePage} from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import InputError from "@/components/InputError";
import MarkdownEditor from "@/components/MarkdownEditor";
import {NativeSelect} from "@/components/ui/native-select";
import {type Event} from "@/types/event";
import ImageUpload from "@/components/ImageUpload";

type EditProps = {
    locations: {
        id: number,
        name: string,
    }[],
    event: Event
};

const Edit = ({locations, event}: EditProps) => {
    const {flash} = usePage().props;
    const [timeIncrements] = React.useState(generateTimeIncrements('09:00', '18:00'));
    const [durationIncrements] = React.useState(generateDurationIncrements(90));
    const [image, setImage] = React.useState<File | null>(null);

    const { data, setData, errors, post, put, processing } = useForm({
        name: event.name || '',
        description: event.description || '',
        location_id: event.location_id || locations[0]?.id || 0,
        day: event.day || '2024-09-27',
        time: event.time || timeIncrements[0].value,
        duration: event.duration || "60",
        image: null as File | null,
        delete_image: false,
    });

    const isEditing = !!event.id;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            post(route('events.update', event.id));
        } else {
            post(route('events.store'));
        }
    };


    return (
        <>
            <div className="mx-auto grid w-full max-w-6xl gap-2">
                <h1 className="text-3xl font-semibold">{isEditing ? 'Edit' : 'Create'} Event</h1>
            </div>
            <div className="mx-auto grid w-full max-w-6xl gap-2">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>{isEditing ? 'Edit' : 'Create'} Event</CardTitle>
                        <CardDescription>
                            {isEditing ? 'Update the details of your event.' : 'Fill in the details to create a new event.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="grid w-full items-start gap-6" onSubmit={handleSubmit} id="edit-event">
                            <div className="grid gap-3">
                                <Label htmlFor="name">
                                    Name
                                </Label>
                                <Input placeholder="Even Name" name="name" id="name" value={data.name}
                                       onChange={(e) => setData('name', e.target.value)}/>
                                <InputError message={errors.name} className="mt-2"/>
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="location_id">
                                    Location
                                </Label>
                                <NativeSelect name="location_id" id="location_id" value={data.location_id}
                                              onChange={(e) => setData('location_id', +e.target.value)}>
                                    {locations?.map((location) => (
                                        <option key={location.id} value={location.id}>{location.name}</option>
                                    ))}
                                </NativeSelect>
                                <InputError message={errors.location_id} className="mt-2"/>
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="name">
                                    Description
                                </Label>
                                <MarkdownEditor value={data.description}
                                                onChange={(value) => setData('description', value)}/>
                                <InputError message={errors.description} className="mt-2"/>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="grid gap-3">
                                    <Label htmlFor="day">
                                        Day
                                    </Label>
                                    <NativeSelect name="day" id="day" value={data.day}
                                                  onChange={(e) => setData('day', e.target.value)}>
                                        <option value="2024-09-27">Friday</option>
                                        <option value="2024-09-28">Saturday</option>
                                        <option value="2024-09-29">Sunday</option>
                                    </NativeSelect>
                                    <InputError message={errors.day} className="mt-2"/>
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="time">
                                        Time
                                    </Label>
                                    <NativeSelect name="time" id="time" value={data.time}
                                                  onChange={(e) => setData('time', e.target.value)}>
                                        {timeIncrements.map((time) => (
                                            <option key={time.value} value={time.value}>{time.display}</option>
                                        ))}
                                    </NativeSelect>
                                    <InputError message={errors.time} className="mt-2"/>
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="duration">
                                        Duration
                                    </Label>
                                    <NativeSelect name="duration" id="duration" value={data.duration}
                                                  onChange={(e) => setData('duration', e.target.value)}>
                                        {durationIncrements.map((time) => (
                                            <option key={time.value} value={time.value}>{time.display}</option>
                                        ))}
                                    </NativeSelect>
                                    <InputError message={errors.duration} className="mt-2"/>
                                </div>
                            </div>
                            <div className="grid gap-3">
                                <ImageUpload
                                    initialImageUrl={event.media?.[0]?.original_url}
                                    onImageChange={(file) => setData('image', file)}
                                    onImageDelete={() => setData('delete_image', true)}
                                />
                                <InputError message={errors.image} className="mt-2"/>
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4">
                        <Button type="submit" form="edit-event">Save</Button>
                    </CardFooter>
                </Card>
            </div>
        </>
    )
        ;
};

Edit.layout = (page: React.ReactNode) =>
    <DashboardLayout>{page}</DashboardLayout>

export default Edit;

function generateTimeIncrements(startTime: string, endTime: string) {
    const timeOptions = [];
    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);

    if (end < start) {
        end.setDate(end.getDate() + 1);
    }

    while (start <= end) {
        const timeString = start.toTimeString().slice(0, 5);
        const displayTime = start.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });

        timeOptions.push({
            value: timeString,
            display: displayTime
        });

        start.setMinutes(start.getMinutes() + 15);
    }

    return timeOptions;
}

function generateDurationIncrements(minutes: number) {
    const durationIncrements = [];

    for (let i = 0; i < minutes; i += 15) {
        const display = `${i} minutes`;
        const value = i.toString();

        durationIncrements.push({
            display,
            value
        });
    }

    return durationIncrements;
}
