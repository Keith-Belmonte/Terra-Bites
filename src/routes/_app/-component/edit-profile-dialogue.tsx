import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PencilIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { useFarm } from "@/components/providers/farm-context.tsx";
import { CROPS } from "@/lib/mock/crops.ts";
import { cn } from "@/lib/utils.ts";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  farmName: z.string().trim().min(2, "Enter your farm's name"),
  farmSize: z.coerce
    .number<number>({ error: "Enter a number" })
    .positive("Must be more than 0")
    .max(10000, "That seems too large"),
  preferredCrops: z.array(z.string()).min(1, "Pick at least one crop"),
});

type Values = z.infer<typeof schema>;

export default function EditProfileDialog() {
  const { profile, setProfile } = useFarm();
  const [open, setOpen] = useState(false);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    values: profile,
  });

  const onSubmit = (values: Values) => {
    setProfile(values);
    setOpen(false);
    toast.success("Profile saved");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="secondary" size="lg" className="h-11 rounded-full font-bold" />
        }
      >
        <PencilIcon /> Edit
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Edit profile</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your name</FormLabel>
                  <FormControl>
                    <Input className="h-12 text-base" placeholder="Juan dela Cruz" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="farmName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Farm name</FormLabel>
                  <FormControl>
                    <Input className="h-12 text-base" placeholder="Dela Cruz Family Farm" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="farmSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Farm size (hectares)</FormLabel>
                  <FormControl>
                    <Input
                      className="h-12 text-base"
                      type="number"
                      step="0.1"
                      inputMode="decimal"
                      placeholder="2.5"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="preferredCrops"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred crops</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {CROPS.map((c) => {
                      const selected = Array.isArray(field.value)
                        ? field.value.filter(
                            (value): value is string => typeof value === "string",
                          )
                        : [];
                      const on = selected.includes(c.id);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          aria-pressed={on}
                          onClick={() =>
                            field.onChange(
                              on
                                ? selected.filter((value) => value !== c.id)
                                : [...selected, c.id],
                            )
                          }
                          className={cn(
                            "h-10 cursor-pointer rounded-full border px-3.5 text-sm font-bold transition-colors",
                            on
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border hover:bg-muted",
                          )}
                        >
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" size="lg" className="h-12 w-full rounded-xl font-bold">
                Save profile
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
