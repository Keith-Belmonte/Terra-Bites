import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useId,
  type HTMLAttributes,
  type LabelHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { cn } from "@/lib/utils.ts";

type FieldContextValue = { name: string };
type ItemContextValue = { id: string };
const FieldContext = createContext<FieldContextValue | null>(null);
const ItemContext = createContext<ItemContextValue | null>(null);

export const Form = FormProvider;

export function FormField<
  T extends FieldValues,
  N extends FieldPath<T> = FieldPath<T>,
>({
  name,
  ...props
}: ControllerProps<T, N>) {
  return (
    <Controller
      name={name}
      {...props}
      render={(fieldProps) => (
        <FieldContext.Provider value={{ name }}>
          {props.render(fieldProps)}
        </FieldContext.Provider>
      )}
    />
  );
}

export function FormItem({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const id = useId();
  return (
    <ItemContext.Provider value={{ id }}>
      <div className={cn("flex flex-col gap-2", className)} {...props} />
    </ItemContext.Provider>
  );
}

export function FormLabel({
  className,
  htmlFor,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  const item = useContext(ItemContext);
  return (
    <label
      htmlFor={htmlFor ?? item?.id}
      className={cn("text-sm font-semibold", className)}
      {...props}
    />
  );
}

export function FormControl({ children }: { children: ReactNode }) {
  const item = useContext(ItemContext);
  const field = useContext(FieldContext);
  const form = useFormContext();
  const error = field ? readError(form.formState.errors, field.name) : undefined;
  const child = Children.only(children);
  if (!isValidElement(child)) return child;
  return cloneElement(child as ReactElement<Record<string, unknown>>, {
    id: item?.id,
    "aria-invalid": Boolean(error),
    "aria-describedby": item ? `${item.id}-message` : undefined,
  });
}

export function FormMessage({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  const item = useContext(ItemContext);
  const field = useContext(FieldContext);
  const form = useFormContext();
  const error = field ? readError(form.formState.errors, field.name) : undefined;
  const message = children ?? (typeof error?.message === "string" ? error.message : null);
  if (!message) return null;
  return (
    <p
      id={item ? `${item.id}-message` : undefined}
      role="alert"
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {message}
    </p>
  );
}

function readError(
  errors: Record<string, unknown>,
  name: string,
): { message?: unknown } | undefined {
  let value: unknown = errors;
  for (const part of name.split(".")) {
    if (!value || typeof value !== "object") return undefined;
    value = (value as Record<string, unknown>)[part];
  }
  return value && typeof value === "object"
    ? (value as { message?: unknown })
    : undefined;
}
