"use client";

import React, { useState, useRef, FC, ReactNode } from "react";
import { ChevronDown, Check, Plus as PlusIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { usePreferredCurrency } from '@/lib/usePreferredCurrency';
import { useExchangeRates } from '@/lib/useExchangeRates';
import formatCurrency from '@/lib/currency';

function cn(...inputs: (string | false | null | undefined)[]) {
  return twMerge(clsx(inputs));
}

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string; size?: string }
>(({ className, variant, size, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      variant === "outline"
        ? "border border-line bg-white hover:bg-surface hover:text-dark"
        : variant === "ghost"
          ? "hover:bg-surface hover:text-dark"
          : variant === "link"
            ? "text-dark underline-offset-4 hover:underline"
            : "bg-brand text-white hover:bg-brand-hover",
      size === "sm" ? "h-9 px-3" : size === "lg" ? "h-11 px-8" : size === "icon" ? "h-10 w-10" : "h-10 px-4 py-2",
      className,
    )}
    {...props}
  />
));
Button.displayName = "Button";

function useClickOutside(ref: { current: HTMLElement | null }, handler: () => void) {
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) handler();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref, handler]);
}

export interface AnimatedDropdownItem {
  value: string;
  label: string;
  hint?: string;
  disabled?: boolean;
  imgSrc?: string;
  imgAlt?: string;
  price?: number | string;
  oldPrice?: number | string;
}

interface AnimatedDropdownProps {
  items: AnimatedDropdownItem[];
  text: React.ReactNode;
  onSelect: (value: string) => void;
  className?: string;
  buttonClassName?: string;
  /**
   * When true the trigger's click will call stopPropagation/preventDefault
   * useful when the dropdown is placed inside a link to avoid navigation.
   */
  stopPropagationOnTrigger?: boolean;
  /** alignment of the floating panel relative to the trigger */
  align?: "left" | "right" | "center";
  /** optional action callback rendered as a right-side button for each item (e.g., quick add) */
  onAction?: (value: string) => void;
}

export default function AnimatedDropdown({
  items,
  text,
  onSelect,
  className,
  buttonClassName,
  stopPropagationOnTrigger,
  align = "right",
  onAction,
}: AnimatedDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { currency: preferred } = usePreferredCurrency('GBP');
  const { convert, base } = useExchangeRates();

  return (
    <OnClickOutside onClickOutside={() => setIsOpen(false)}>
      <div
        data-state={isOpen ? "open" : "closed"}
        className={cn("relative inline-block", className)}
      >
        <Button
          variant="outline"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            if (stopPropagationOnTrigger) {
              e.stopPropagation();
              e.preventDefault();
            }
            setIsOpen((v) => !v);
          }}
          className={buttonClassName}
        >
          <span className="truncate">{text}</span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="shrink-0"
          >
            <ChevronDown className="h-5 w-5" />
          </motion.div>
        </Button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              role="listbox"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={cn(
                "absolute top-[calc(100%+0.5rem)] z-50 w-52 min-w-[12rem] px-2 py-2",
                align === "left" ? "left-0" : align === "center" ? "left-1/2 -translate-x-1/2" : "right-0",
                "overflow-visible rounded-2xl",
                "bg-white",
                "shadow-lg",
              )}
            >
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.03 } },
                }}
              >
                {items.map((item, index) => (
                  <motion.button
                    key={item.value || index}
                    type="button"
                    role="option"
                    aria-selected={text === item.label}
                    disabled={item.disabled}
                    onClick={() => {
                      onSelect(item.value);
                      setIsOpen(false);
                    }}
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      visible: { opacity: 1, x: 0 },
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 px-2 py-2 text-left text-sm",
                      "bg-white",
                      "hover:bg-gray-50",
                      "rounded-md",
                      "transition-colors duration-150",
                      "text-ink no-underline",
                      item.disabled && "opacity-40 cursor-not-allowed",
                    )}
                    style={{ marginBottom: index === items.length - 1 ? 0 : 6 }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {item.imgSrc ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.imgSrc} alt={item.imgAlt ?? item.label} className="w-9 h-9 rounded-md object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-md bg-gray-100 flex items-center justify-center text-lg text-ink-muted">
                          {item.label?.slice(0, 1)}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className={cn("font-medium truncate", text === item.label && "text-brand font-semibold")}>{item.label}</div>
                        {item.hint && <div className="text-xs text-ink-muted truncate mt-0.5">{item.hint}</div>}
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0 ml-2">
                      {item.oldPrice && (
                        <span className="text-xs text-ink-muted line-through">{typeof item.oldPrice === 'number' ? `${formatCurrency(Number(item.oldPrice), base)}` : item.oldPrice}</span>
                      )}
                      {item.price ? (
                        (() => {
                          if (typeof item.price !== 'number') return <span className="text-sm font-semibold text-dark">{item.price}</span>;
                          const converted = preferred && preferred !== base ? convert(Number(item.price), preferred) : null;
                          return (
                            <span className="text-sm font-semibold text-dark">
                              {formatCurrency(Number(item.price), base)}{converted !== null ? ` · ${formatCurrency(converted, preferred)}` : ''}
                            </span>
                          );
                        })()
                      ) : (
                        text === item.label && <Check className="w-4 h-4 text-brand shrink-0" />
                      )}
                    </div>
                    {typeof onAction === "function" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!item.disabled) onAction(item.value);
                        }}
                        aria-label={`Add ${item.label}`}
                        className="ml-3 w-9 h-9 rounded-full bg-gold text-white flex items-center justify-center shadow-sm"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    )}
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </OnClickOutside>
  );
}

interface Props {
  children: ReactNode;
  onClickOutside: () => void;
  classes?: string;
}

const OnClickOutside: FC<Props> = ({ children, onClickOutside, classes }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useClickOutside(wrapperRef, onClickOutside);

  return (
    <div ref={wrapperRef} className={cn(classes)}>
      {children}
    </div>
  );
};
