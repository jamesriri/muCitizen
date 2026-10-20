"use client";

import type { ReactNode } from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import type { LucideIcon } from "lucide-react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui";

export type FormFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: ReactNode;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  description?: ReactNode;
  icon?: LucideIcon;
  rightContent?: ReactNode;
  rightContentClassName?: string;
  rightContentAlign?: "inline-start" | "inline-end";
  onRightContentClick?: () => void;
};

export default function FormField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = "text",
  autoComplete,
  description,
  icon: Icon,
  rightContent,
  rightContentClassName,
  rightContentAlign = "inline-end",
  onRightContentClick,
}: FormFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>

          {description ? <FieldDescription>{description}</FieldDescription> : null}

          <InputGroup>
            {Icon ? (
              <InputGroupAddon align="inline-start">
                <Icon />
              </InputGroupAddon>
            ) : null}

            <InputGroupInput
              {...field}
              value={field.value ?? ""}
              id={field.name}
              type={type}
              placeholder={placeholder}
              autoComplete={autoComplete}
              aria-invalid={fieldState.invalid}
            />

            {rightContent ? (
              <InputGroupAddon
                className={rightContentClassName}
                align={rightContentAlign}
                onClick={onRightContentClick}
              >
                {rightContent}
              </InputGroupAddon>
            ) : null}
          </InputGroup>

          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  );
}
