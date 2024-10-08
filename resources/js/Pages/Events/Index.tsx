import React from "react"
import {Download, Edit, File, ListFilter, MoreHorizontal, PlusCircle,} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table"
import DashboardLayout from "@/Layouts/DashboardLayout";
import {Link} from "@inertiajs/inertia-react";
import {type Event} from "@/types/event";
import {router} from "@inertiajs/react";

const Index = ({events}: {
    events: Event[]
}) => {

    return (
        <>
            <div className="flex items-center">
                <div className="ml-auto flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 gap-1">
                                <ListFilter className="h-3.5 w-3.5"/>
                                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                          Filter
                        </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                            <DropdownMenuSeparator/>
                            <DropdownMenuCheckboxItem checked>
                                Upcoming
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem>Past</DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem>Draft</DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button size="sm" variant="outline" className="h-8 gap-1"
                            onClick={(e) => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = '.csv';
                                input.onchange = (e) => {
                                    const file = (e.target as HTMLInputElement).files?.[0];
                                    console.log(file);
                                    if (file) {
                                        const formData = new FormData();
                                        formData.append('file', file);
                                        router.post(route('events.upload'), formData, {
                                            forceFormData: true,
                                        });
                                    }
                                };
                                input.click();
                            }}
                    >
                        <File className="h-3.5 w-3.5"/>
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Import
                    </span>
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 gap-1" asChild>
                        <a href={route('events.export')}>
                            <Download className="h-3.5 w-3.5"/>
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                Export
                            </span>
                        </a>
                    </Button>
                    <Button asChild size="sm" className="h-8 gap-1">
                        <Link href={route('events.create')}>
                            <PlusCircle className="h-3.5 w-3.5"/>
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Add Event
                    </span>
                        </Link>
                    </Button>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Events</CardTitle>
                    <CardDescription>
                        Manage your events and view their details.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead className="hidden md:table-cell">
                                    Date & Time
                                </TableHead>
                                <TableHead>
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {events.map((event) => (
                                <TableRow key={event.id}>
                                    <TableCell className="font-medium">
                                        {event.name}
                                    </TableCell>
                                    <TableCell>{event.location}</TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        {new Date(event.day).toLocaleDateString('en-US', {weekday: 'long'})} {event.time}
                                    </TableCell>
                                    <TableCell className="flex">
                                        <Button asChild size="icon" variant="ghost">
                                            <Link href={route('events.edit', event.id)}>
                                                <Edit className="h-4 w-4"/>
                                                <span className="sr-only">Edit</span>
                                            </Link>
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    aria-haspopup="true"
                                                    size="icon"
                                                    variant="ghost"
                                                >
                                                    <MoreHorizontal className="h-4 w-4"/>
                                                    <span className="sr-only">Toggle menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem asChild>Edit</DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        router.delete(route('events.destroy', event.id))
                                                    }}
                                                >
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter>
                    <div className="text-xs text-muted-foreground">
                        Showing <strong>1-10</strong> of{" "}
                        <strong>{events.length}</strong> events
                    </div>
                </CardFooter>
            </Card>
        </>
    )
};

Index.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>

export default Index
