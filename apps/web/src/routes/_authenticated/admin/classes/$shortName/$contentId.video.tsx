import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { type } from "arktype";
import { useEffect, useState } from "react";
import { toast } from "sonner";
// import { TiptapEditor } from "@/components/tiptap-editor";
import TiptapSimpleEditor from "@/components/tiptap-simple-editor";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import YouTubePlayer from "@/components/youtube-player";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute(
  "/_authenticated/admin/classes/$shortName/$contentId/video"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { contentId } = Route.useParams();
  const queryClient = useQueryClient();

  const content = useQuery(
    orpc.subtest.getContentById.queryOptions({
      input: { contentId: Number(contentId) },
    })
  );

  const saveMutation = useMutation(
    orpc.admin.subtest.upsertVideo.mutationOptions({
      onSuccess: (data) => {
        toast.success(data.message);
        queryClient.invalidateQueries({
          queryKey: orpc.subtest.getContentById.queryKey({
            input: {
              contentId: Number(contentId),
            },
          }),
        });
      },
      onError: (error) => {
        toast.error(error.message || "Gagal menyimpan video");
      },
    })
  );

  const deleteMutation = useMutation(
    orpc.admin.subtest.deleteVideo.mutationOptions({
      onSuccess: (data) => {
        toast.success(data.message);
        queryClient.invalidateQueries({
          queryKey: orpc.subtest.getContentById.queryKey({
            input: {
              contentId: Number(contentId),
            },
          }),
        });
      },
      onError: (error) => {
        toast.error(error.message || "Gagal menghapus video");
      },
    })
  );

  const form = useForm({
    defaultValues: {
      videoUrl: "",
      content: {} as object,
    },
    onSubmit: async ({ value }) => {
      // Ensure content is always an object
      const contentValue =
        value.content && typeof value.content === "object" ? value.content : {};
      // Trim and validate videoUrl
      const videoUrlValue = value.videoUrl?.trim() || "";

      if (!videoUrlValue) {
        toast.error("URL Video wajib diisi");
        return;
      }

      saveMutation.mutate({
        id: Number(contentId),
        videoUrl: videoUrlValue,
        content: contentValue,
      });
    },
    validators: {
      onSubmit: type({
        videoUrl: "string >= 1",
        content: "object",
      }),
    },
  });

  // Debounced video URL for preview
  const [debouncedVideoUrl, setDebouncedVideoUrl] = useState("");

  // Update form when content loads
  useEffect(() => {
    if (content.data?.video) {
      const videoData = content.data.video;
      if (form.state.values.videoUrl !== videoData.videoUrl) {
        form.setFieldValue("videoUrl", videoData.videoUrl || "");
      }
      const currentContent = form.state.values.content;
      const newContent = (videoData.content as object) || {};
      // Deep comparison for content object
      if (JSON.stringify(currentContent) !== JSON.stringify(newContent)) {
        form.setFieldValue("content", newContent);
      }
    }
  }, [content.data, form]);

  // Debounce video URL - update preview after 1.5 seconds of no typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedVideoUrl(form.state.values.videoUrl);
    }, 1500);

    return () => clearTimeout(timer);
  }, [form.state.values.videoUrl]);

  if (content.isPending) {
    return <p className="animate-pulse text-sm">Memuat video...</p>;
  }

  if (content.isError) {
    return (
      <p className="text-red-500 text-sm">Error: {content.error.message}</p>
    );
  }

  if (!content.data) return notFound();

  const hasVideo = !!content.data.video;

  // Helper function to extract YouTube video ID
  function extractYouTubeId(url: string): string | null {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match?.[1]) {
        return match[1];
      }
    }
    return null;
  }

  const previewVideoId = extractYouTubeId(debouncedVideoUrl);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">Edit Video Materi</h2>
        <div className="flex gap-4">
          <form.Subscribe>
            {(state) => (
              <Button
                type="submit"
                size="sm"
                disabled={!state.canSubmit || saveMutation.isPending}
              >
                {saveMutation.isPending ? "Menyimpan..." : "Simpan Video"}
              </Button>
            )}
          </form.Subscribe>

          {hasVideo && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={deleteMutation.isPending}
                >
                  Hapus Video
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus Video?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah Anda yakin ingin menghapus video ini? Tindakan ini
                    tidak dapat dibatalkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      deleteMutation.mutate({ id: Number(contentId) });
                    }}
                  >
                    Hapus
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <form.Field
          name="videoUrl"
          validators={{
            onChange: ({ value }) => {
              if (!value || value.trim().length === 0) {
                return "URL Video wajib diisi";
              }
              return undefined;
            },
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>URL Video (YouTube)</Label>
              <Input
                id={field.name}
                name={field.name}
                type="url"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
              />
              {field.state.meta.errors.map((error, index) => {
                const errorMessage =
                  typeof error === "string"
                    ? error
                    : "message" in error
                    ? error.message
                    : String(error);
                return (
                  <p
                    key={`${field.name}-error-${index}`}
                    className="text-red-500 text-sm"
                  >
                    {errorMessage}
                  </p>
                );
              })}
              {previewVideoId && (
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      type="button"
                    >
                      Tampilkan Preview Video
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 animate-slideDownAndFade space-y-2 transition-all data-[state=open]:animate-slideDownAndFade">
                    <Label>Preview Video</Label>
                    <div className="aspect-video w-full overflow-hidden rounded-lg sm:mx-auto sm:max-w-xl">
                      <YouTubePlayer videoId={previewVideoId} />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          )}
        </form.Field>

        <form.Field
          name="content"
          validators={{
            onChange: ({ value }) => {
              if (!value || typeof value !== "object") {
                return "Konten harus berupa object yang valid";
              }
              return undefined;
            },
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <Label>Konten Video (Deskripsi)</Label>
              {/* <TiptapEditor
                content={field.state.value}
                onChange={(content) => field.handleChange(content)}
              /> */}

              <TiptapSimpleEditor
                content={field.state.value}
                onChange={(content) => {
                  // Ensure content is always an object, never undefined or null
                  field.handleChange(
                    content && typeof content === "object" ? content : {}
                  );
                }}
              />

              {field.state.meta.errors.map((error, index) => {
                const errorMessage =
                  typeof error === "string"
                    ? error
                    : "message" in error
                    ? error.message
                    : String(error);
                return (
                  <p
                    key={`${field.name}-error-${index}`}
                    className="text-red-500 text-sm"
                  >
                    {errorMessage}
                  </p>
                );
              })}
            </div>
          )}
        </form.Field>
      </form>
    </div>
  );
}
