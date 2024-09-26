import React from "react";
import { useForm, usePage } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import InputError from "@/components/InputError";
import ImageUpload from "@/components/ImageUpload";

type Location = {
    id?: number;
    name: string;
    media?: { original_url: string }[];
};

type EditProps = {
    location?: Location;
};

const Edit = ({ location }: EditProps) => {
    const { flash } = usePage().props;
    const [image, setImage] = React.useState<File | null>(null);

    const { data, setData, errors, post, processing } = useForm({
        name: location?.name || '',
        image: null as File | null,
        delete_image: false,
    });

    const isEditing = !!location?.id;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            post(route('locations.update', location.id));
        } else {
            post(route('locations.store'));
        }
    };

    return (
        <>
            <div className="mx-auto grid w-full max-w-6xl gap-2">
                <h1 className="text-3xl font-semibold">{isEditing ? 'Edit' : 'Create'} Location</h1>
            </div>
            <div className="mx-auto grid w-full max-w-6xl gap-2">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>{isEditing ? 'Edit' : 'Create'} Location</CardTitle>
                        <CardDescription>
                            {isEditing ? 'Update the details of your location.' : 'Fill in the details to create a new location.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="grid w-full items-start gap-6" onSubmit={handleSubmit} id="edit-location">
                            <div className="grid gap-3">
                                <Label htmlFor="name">
                                    Name
                                </Label>
                                <Input
                                    placeholder="Location Name"
                                    name="name"
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                                <InputError message={errors.name} className="mt-2"/>
                            </div>
                            <div className="grid gap-3">
                                <ImageUpload
                                    initialImageUrl={location?.media?.[0]?.original_url}
                                    onImageChange={(file) => setData('image', file)}
                                    onImageDelete={() => setData('delete_image', true)}
                                />
                                <InputError message={errors.image} className="mt-2"/>
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4">
                        <Button type="submit" form="edit-location" disabled={processing}>
                            {processing ? 'Saving...' : 'Save'}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </>
    );
};

Edit.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;

export default Edit;
