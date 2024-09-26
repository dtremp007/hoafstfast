import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Upload } from 'lucide-react';

type ImageUploadProps = {
    initialImageUrl?: string;
    onImageChange: (file: File | null) => void;
    onImageDelete: () => void;
};

const ImageUpload: React.FC<ImageUploadProps> = ({ initialImageUrl, onImageChange, onImageDelete }) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialImageUrl || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
            onImageChange(file);
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const file = event.dataTransfer.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
            onImageChange(file);
        }
    };

    const handleDelete = () => {
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onImageDelete();
    };

    return (
        <div className="grid gap-3">
            <Label htmlFor="image">Event Image</Label>
            <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                {previewUrl ? (
                    <div className="relative">
                        <img src={previewUrl} alt="Preview" className="h-52 w-full object-cover" />
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete();
                            }}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-4">
                        <Upload className="h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">Drag and drop an image here, or click to select a file</p>
                    </div>
                )}
            </div>
            <Input
                type="file"
                id="image"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
            />
        </div>
    );
};

export default ImageUpload;
