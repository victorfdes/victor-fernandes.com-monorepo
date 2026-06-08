export const LINKS = {
  LINKEDIN: "https://linkedin.com/in/vicfdes",
  GITHUB: "https://github.com/victorfdes",
  X: "https://x.com/vfdes",

  // Internal links
  PRIVACY_POLICY: "/privacy",
  RESUME: "/resume",
  CONTACT: "/contact",
  BLOG: "/blog",

  // Static files
  RESUME_DOWNLOAD: "/victor-fernandes-resume-v10.0.1.pdf",
}

export const MENU_ITEMS = {
  BLOG: {
    label: "Blog",
    href: LINKS.BLOG,
  },
  RESUME: {
    label: "Resume",
    href: LINKS.RESUME,
  },
  CONTACT: {
    label: "Contact",
    href: LINKS.CONTACT,
  },
}

export const isUrlExternal = (url: string) => {
  return typeof url === "string" && (url.startsWith("http") || url.startsWith("mailto:") || url.startsWith("tel:"))
}
