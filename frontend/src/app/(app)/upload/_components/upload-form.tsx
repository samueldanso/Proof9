"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreatePost } from "@/hooks/use-create-post";
import { useMediaCompression } from "@/hooks/use-media-compression";
import { validateFileSize } from "@/lib/media/validation";
import { createVideoThumbnail } from "@/lib/media/video-thumbnails";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileAudio, ImageIcon, Loader2, Video, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Define the form schema
const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  content: z.string().min(1, "Content is required").max(2000, "Content is too long"),
  category: z.enum(["content", "art", "music", "tech", "writing"]),
  amount: z.string().min(1, "Target amount is required"),
  revenueShare: z.string().min(1, "Revenue share percentage is required"),
  totalSupply: z.string().min(1, "Total supply is required"),
  benefits: z.string().min(1, "Benefits are required"),
  endDate: z.string().min(1, "End date is required"),
  media: z.any().optional(),
  mediaType: z.enum(["image", "video", "audio"]).optional(),
  mediaDuration: z.number().optional(),
  videoThumbnail: z.string().optional(),
  collectible: z.boolean().default(false),
  collectSettings: z
    .object({
      price: z.string().default("0"),
      currency: z.string().default("WGHO"),
      supply: z.string().default(""),
    })
    .optional()
    .default({
      price: "0",
      currency: "WGHO",
      supply: "",
    }),
  investmentMetadata: z
    .object({
      category: z.enum(["content", "art", "music", "tech", "writing"]).default("content"),
      revenueShare: z.string().default("0"),
      benefits: z.string().default(""),
      endDate: z.string().default(""),
    })
    .optional()
    .default({
      category: "content",
      revenueShare: "0",
      benefits: "",
      endDate: "",
    }),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateForm() {
  const router = useRouter();
  const { createPost, isLoading } = useCreatePost();
  const { compressImage } = useMediaCompression();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | "audio" | null>(null);
  const [mediaDuration, setMediaDuration] = useState<number>(0);
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);

  // Initialize form with explicit type
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any, // Use 'as any' to bypass the type mismatch
    defaultValues: {
      title: "",
      content: "",
      category: "content",
      amount: "",
      revenueShare: "",
      totalSupply: "",
      benefits: "",
      endDate: "",
      collectible: true,
    },
  });

  // Get duration from audio element
  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = document.createElement("audio");
      audio.preload = "metadata";

      audio.onloadedmetadata = () => {
        // Round up to nearest second to ensure it's greater than 0
        const duration = Math.ceil(audio.duration);
        URL.revokeObjectURL(audio.src);
        resolve(duration);
      };

      audio.onerror = () => {
        console.error("Error loading audio metadata");
        URL.revokeObjectURL(audio.src);
        // Default to 1 second if we can't get the actual duration
        resolve(1);
      };

      audio.src = URL.createObjectURL(file);
    });
  };

  // Get duration from video element
  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        // Round up to nearest second to ensure it's greater than 0
        const duration = Math.ceil(video.duration);
        URL.revokeObjectURL(video.src);
        resolve(duration);
      };

      video.onerror = () => {
        console.error("Error loading video metadata");
        URL.revokeObjectURL(video.src);
        // Default to 1 second if we can't get the actual duration
        resolve(1);
      };

      video.src = URL.createObjectURL(file);
    });
  };

  const handleMediaUpload = (type: "image" | "video" | "audio") => {
    if (fileInputRef.current) {
      // Set accept attribute based on media type
      switch (type) {
        case "image":
          fileInputRef.current.accept = "image/*";
          break;
        case "video":
          fileInputRef.current.accept = "video/*";
          break;
        case "audio":
          fileInputRef.current.accept = "audio/*";
          break;
      }
      fileInputRef.current.click();
    }
  };

  // Handle media file change
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (!validateFileSize(file)) {
      return;
    }

    // Determine file type
    let type: "image" | "video" | "audio" | null = null;
    let processedFile = file;

    if (file.type.startsWith("image/")) {
      type = "image";
      // Compress image if not a GIF
      if (!file.type.includes("gif")) {
        try {
          const compressedImage = await compressImage(file);
          processedFile = compressedImage;
        } catch (error) {
          console.error("Error compressing image:", error);
        }
      }
    } else if (file.type.startsWith("video/")) {
      type = "video";
      // Get video duration and thumbnail
      try {
        const duration = await getVideoDuration(file);
        setMediaDuration(duration);
        form.setValue("mediaDuration", duration);

        // Generate video thumbnail
        try {
          const thumbnail = await createVideoThumbnail(file);
          setVideoThumbnail(thumbnail);
          form.setValue("videoThumbnail", thumbnail);
        } catch (thumbnailError) {
          console.error("Error creating video thumbnail:", thumbnailError);
        }
      } catch (error) {
        console.error("Error getting video duration:", error);
        setMediaDuration(1); // Fallback to 1 second
        form.setValue("mediaDuration", 1);
      }
    } else if (file.type.startsWith("audio/")) {
      type = "audio";
      // Get audio duration
      try {
        const duration = await getAudioDuration(file);
        setMediaDuration(duration);
        form.setValue("mediaDuration", duration);
      } catch (error) {
        console.error("Error getting audio duration:", error);
        setMediaDuration(1); // Fallback to 1 second
        form.setValue("mediaDuration", 1);
      }
    } else {
      toast.error("Unsupported file type");
      return;
    }

    setSelectedFile(processedFile);
    setMediaType(type);
    form.setValue("media", processedFile);
    form.setValue("mediaType", type);

    // Create preview URL
    const url = URL.createObjectURL(processedFile);
    setPreviewUrl(url);
  };

  // Render media preview based on media type
  const renderMediaPreview = () => {
    if (!previewUrl) return null;

    return (
      <div className="relative mb-2 overflow-hidden rounded-md border">
        {mediaType === "image" && (
          <img src={previewUrl} alt="Preview" className="max-h-48 w-auto rounded-md" />
        )}
        {mediaType === "video" && (
          <video controls src={previewUrl} className="max-h-48 w-auto rounded-md">
            <track kind="captions" src="" label="Captions" />
          </video>
        )}
        {mediaType === "audio" && (
          <div className="rounded-md bg-muted p-3">
            <audio controls src={previewUrl} className="w-full">
              <track kind="captions" src="" label="Captions" />
            </audio>
            <p className="mt-1 text-muted-foreground text-xs">Audio: {selectedFile?.name}</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-1 right-1 h-6 w-6 rounded-full p-0"
          onClick={() => {
            setSelectedFile(null);
            setPreviewUrl(null);
            setMediaType(null);
            setVideoThumbnail(null);
            form.setValue("media", undefined);
            form.setValue("mediaType", undefined);
            form.setValue("mediaDuration", undefined);
            form.setValue("videoThumbnail", undefined);
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  // Submit form data with explicit type
  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    try {
      // Call our createPost hook with the form values
      const result = await createPost({
        title: values.title,
        content: values.content,
        imageFile: values.media,
        // Investment post is always collectible
        collectible: true,
        collectSettings: {
          price: values.amount,
          currency: "WGHO",
          supply: values.totalSupply,
        },
        // Investment metadata
        investmentMetadata: {
          category: values.category,
          revenueShare: values.revenueShare,
          benefits: values.benefits,
          endDate: values.endDate,
          mediaType: values.mediaType,
        },
      });

      if (result) {
        router.push(`/posts/${result.id}`);
      }
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Name your investment project" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your project and what you're offering"
                      className="min-h-24 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="content">Content</SelectItem>
                      <SelectItem value="art">Art</SelectItem>
                      <SelectItem value="music">Music</SelectItem>
                      <SelectItem value="tech">Tech</SelectItem>
                      <SelectItem value="writing">Writing</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Amount (WGHO)</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="200" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalSupply"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Supply</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="revenueShare"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Revenue Share (%)</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="25" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="benefits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Benefits for Believers</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="List the benefits believers will receive (e.g., early access, exclusive content, Lens Group access)"
                      className="min-h-24 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="media"
              render={() => (
                <FormItem>
                  <FormLabel>Media</FormLabel>
                  <FormControl>
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileChange}
                      />

                      <div className="mb-2 flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => handleMediaUpload("image")}
                        >
                          <ImageIcon className="h-4 w-4" />
                          Add Image
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => handleMediaUpload("video")}
                        >
                          <Video className="h-4 w-4" />
                          Add Video
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => handleMediaUpload("audio")}
                        >
                          <FileAudio className="h-4 w-4" />
                          Add Audio
                        </Button>
                      </div>

                      {renderMediaPreview()}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Upload an image, video, or audio file to showcase your project
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating your investment post...
                </>
              ) : (
                "Launch Investment Campaign"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
