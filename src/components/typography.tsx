import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import * as React from "react";

const typographyVariants = cva("font-normal text-black ", {
  variants: {
    level: {
      xs: "text-[10px] lg:text-xs",
      sm: "text-xs lg:text-sm",
      lg: "text-sm md:text-base xl:text-lg",
      xl: "text-base lg:text-lg 2xl:text-xl",
      base: "text-sm lg:text-base",
      "2xl": "text-lg lg:text-xl xl:text-2xl",
      "3xl": "text-2xl font-semibold lg:text-[32px]",
      "5xl": "text-3xl lg:text-4xl xl:text-5xl",
      "6xl": "text-4xl lg:text-5xl 2xl:text-6xl",
      biggest: "text-5xl lg:text-6xl 2xl:text-7xl",
      tr: "text-[12px] lg:text-sm",
    },
  },
  defaultVariants: {
    level: "base",
  },
});

export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  as?: React.ElementType;
}

const Typography: React.ForwardRefRenderFunction<
  HTMLElement,
  TypographyProps
> = ({ className, level, as: Component = "span", ...props }, ref) => {
  // Ensure that we're dealing with a function ref
  const handleRef = React.useCallback(
    (node: HTMLElement | null) => {
      // Set the ref on the current element
      if (typeof ref === "function") {
        ref(node);
      }
      // If ref is an object, ensure it's extensible and set the current property
      else if (ref && typeof ref === "object") {
        // Ensure ref is extensible by creating a new object if needed
        const mutableRef =
          Object.isExtensible(ref) && ref.current !== undefined
            ? ref
            : { current: null };

        mutableRef.current = node;
      }
    },
    [ref]
  );

  return (
    <Component
      className={cn(typographyVariants({ level, className }))}
      ref={handleRef}
      {...props}
    />
  );
};

Typography.displayName = "Typography";

export { Typography, typographyVariants };

// Define h1 to h5 and p with the Typography component
export const H1: React.FC<TypographyProps> = (props) => (
  <Typography as="h1" level="lg" {...props} />
);

export const H2: React.FC<TypographyProps> = (props) => (
  <Typography as="h2" level="base" {...props} />
);

export const H3: React.FC<TypographyProps> = (props) => (
  <Typography as="h3" level="base" {...props} />
);

export const H4: React.FC<TypographyProps> = (props) => (
  <Typography as="h4" level="base" {...props} />
);

export const H5: React.FC<TypographyProps> = (props) => (
  <Typography as="h5" level="base" {...props} />
);

export const P: React.FC<TypographyProps> = (props) => (
  <Typography as="p" level="base" {...props} />
);
