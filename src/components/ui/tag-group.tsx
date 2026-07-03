"use client"

import { cva } from "class-variance-authority"
import { XIcon } from "lucide-react"
import {
  Button as AriaButton,
  Tag as AriaTag,
  TagGroup as AriaTagGroup,
  TagGroupProps as AriaTagGroupProps,
  TagList as AriaTagList,
  TagListProps as AriaTagListProps,
  TagProps as AriaTagProps,
  composeRenderProps,
  Text,
} from "react-aria-components"

import { cn } from "@/lib/utils"

import { Label } from "@/components/ui/text-field-basic"

const TagGroup = AriaTagGroup

function TagList<T extends object>({
  className,
  ...props
}: AriaTagListProps<T>) {
  return (
    <AriaTagList
      className={composeRenderProps(className, (className) =>
        cn(
          "flex flex-wrap gap-2",
          /* Empty */
          "data-[empty]:text-sm data-[empty]:text-ink-muted",
          className
        )
      )}
      {...props}
    />
  )
}

const badgeVariants = cva(
  [
    "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold ring-offset-background transition-colors cursor-pointer",
    /* Focus */
    "data-[focused]:outline-none data-[focused]:ring-2 data-[focused]:ring-brand data-[focused]:ring-offset-2",
    /* Disabled */
    "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
  ],
  {
    variants: {
      variant: {
        default: [
          "border-transparent bg-brand text-white",
          /* Hover */
          "data-[hovered]:bg-brand-hover",
        ],
        secondary: [
          "border-line bg-surface text-ink",
          /* Hover */
          "data-[hovered]:bg-surface-2",
        ],
        destructive: [
          "border-transparent bg-red-600 text-white",
          /* Hover */
          "data-[hovered]:bg-red-600/80",
        ],
        outline: "text-ink",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Tag({ children, className, ...props }: AriaTagProps) {
  let textValue = typeof children === "string" ? children : undefined
  return (
    <AriaTag
      textValue={textValue}
      className={composeRenderProps(className, (className, renderProps) =>
        cn(
          badgeVariants({
            variant:
              renderProps.selectionMode === "none" || renderProps.isSelected
                ? "default"
                : "secondary",
          }),
          renderProps.allowsRemoving && "pr-1",
          className
        )
      )}
      {...props}
    >
      {composeRenderProps(children, (children, renderProps) => (
        <>
          {children}
          {renderProps.allowsRemoving && (
            <AriaButton
              slot="remove"
              className={cn(
                "rounded-sm opacity-70 ring-offset-background transition-opacity",
                /* Hover */
                "data-[hovered]:opacity-100",
                /* Resets */
                "focus-visible:outline-none"
              )}
            >
              <XIcon aria-hidden className="size-3" />
            </AriaButton>
          )}
        </>
      ))}
    </AriaTag>
  )
}

interface JollyTagGroupProps<T>
  extends Omit<AriaTagGroupProps, "children">,
    Pick<AriaTagListProps<T>, "items" | "children" | "renderEmptyState"> {
  label?: string
  description?: string
  errorMessage?: string
}

function JollyTagGroup<T extends object>({
  label,
  description,
  className,
  errorMessage,
  items,
  children,
  renderEmptyState,
  ...props
}: JollyTagGroupProps<T>) {
  return (
    <TagGroup className={cn("group flex flex-col gap-2", className)} {...props}>
      <Label>{label}</Label>
      <TagList items={items} renderEmptyState={renderEmptyState}>
        {children}
      </TagList>
      {description && (
        <Text className="text-sm text-ink-muted" slot="description">
          {description}
        </Text>
      )}
      {errorMessage && (
        <Text className="text-sm text-red-600" slot="errorMessage">
          {errorMessage}
        </Text>
      )}
    </TagGroup>
  )
}

export { TagGroup, TagList, Tag, badgeVariants, JollyTagGroup }
export type { JollyTagGroupProps }
