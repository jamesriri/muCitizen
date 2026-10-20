"use client";

import * as React from "react";
import { UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    isAllowedAttachmentType,
    MAX_ATTACHMENT_SIZE_BYTES,
} from "../schemas/request.schema";

interface ImageDropzoneProps {
    file: File | null;
    onFileChange: (file: File | null) => void;
}

export function ImageDropzone({ file, onFileChange }: ImageDropzoneProps) {
    const previewRef = React.useRef<HTMLImageElement | null>(null);
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    React.useEffect(() => {
        if (!file) return;
        const url = URL.createObjectURL(file);
        const previewElement = previewRef.current;
        if (previewElement) previewElement.src = url;
        return () => {
            previewElement?.removeAttribute("src");
            URL.revokeObjectURL(url);
        };
    }, [file]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected) return;

        if (selected.size > MAX_ATTACHMENT_SIZE_BYTES) {
            toast.error("Image must be 5 MB or smaller.");
            e.target.value = "";
            return;
        }

        if (!isAllowedAttachmentType(selected.type)) {
            toast.error("Choose a PNG, JPEG, or WebP image.");
            e.target.value = "";
            return;
        }

        onFileChange(selected);
    };

    return (
        <div className="space-y-2">
            <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileSelect}
                className="hidden"
            />

            {file ? (
                <div className="relative rounded-xl border border-border overflow-hidden bg-muted/30 p-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Local object URLs must be loaded directly by the browser. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            ref={previewRef}
                            alt="Upload preview"
                            width={56}
                            height={56}
                            className="h-14 w-14 rounded-lg border object-cover"
                        />
                        <div>
                            <p className="text-xs font-semibold text-foreground truncate max-w-50">
                                {file?.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                                {(Number(file?.size) / (1024 * 1024)).toFixed(2)} MB • Ready to upload
                            </p>
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onFileChange(null)}
                        className="h-8 w-8 text-destructive"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <div
                    onClick={() => inputRef.current?.click()}
                    className="border-2 border-dashed border-border/80 hover:border-primary/60 rounded-xl p-6 text-center cursor-pointer transition-colors bg-card hover:bg-accent/30"
                >
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
                        <UploadCloud className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                        Click to upload on-site incident photo
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG or WebP (Max 5 MB) • Optional, but helps with resolution
                    </p>
                </div>
            )}
        </div>
    );
}
