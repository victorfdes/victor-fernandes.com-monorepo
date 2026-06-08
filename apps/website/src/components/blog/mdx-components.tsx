import { SmartLink } from "@repo/ui"
import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { slugifyBlogValue } from "utils/blog-content"

const getText = (node: ReactNode): string => {
  if (typeof node === "string" || typeof node === "number") {
    return String(node)
  }

  if (Array.isArray(node)) {
    return node.map((child) => getText(child as ReactNode)).join("")
  }

  if (node && typeof node === "object" && "props" in node) {
    return getText((node.props as { children?: ReactNode }).children)
  }

  return ""
}

const Heading = ({
  as: Tag,
  children,
  ...props
}: ComponentPropsWithoutRef<"h2"> & {
  as: "h2" | "h3"
}) => {
  const id = props.id ?? slugifyBlogValue(getText(children))

  return (
    <Tag id={id} {...props}>
      <a className="group no-underline" href={`#${id}`}>
        {children}
        <span aria-hidden="true" className="ml-2 opacity-0 transition group-hover:opacity-70">
          #
        </span>
      </a>
    </Tag>
  )
}

export const blogMdxComponents = {
  a: ({ href = "", ...props }: ComponentPropsWithoutRef<"a">) => <SmartLink href={href} showExternalIcon {...props} />,
  h2: (props: ComponentPropsWithoutRef<"h2">) => <Heading as="h2" {...props} />,
  h3: (props: ComponentPropsWithoutRef<"h3">) => <Heading as="h3" {...props} />,
  img: ({ alt = "", ...props }: ComponentPropsWithoutRef<"img">) => <img alt={alt} loading="lazy" {...props} />,
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="overflow-x-auto">
      <table {...props} />
    </div>
  ),
}
