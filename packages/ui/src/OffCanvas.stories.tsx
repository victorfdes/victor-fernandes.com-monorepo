import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import { SmartButton } from "./Button/SmartButton"
import OffCanvas from "./OffCanvas"

const menuItems = [
  { label: "Blog", href: "/blog" },
  { label: "Resume", href: "/resume" },
  { label: "Contact", href: "/contact" },
]
const socialLinks = { linkedin: "https://linkedin.com", twitter: "https://x.com", github: "https://github.com" }

/** Stateful wrapper so the panel can be opened and closed inside the canvas. */
function OffCanvasDemo() {
  const [open, setOpen] = useState(true)
  return (
    <div className="min-h-screen p-8">
      <SmartButton onClick={() => setOpen(true)}>Open menu</SmartButton>
      <OffCanvas menuOpen={open} setMenuOpen={setOpen} menuItems={menuItems} socialLinks={socialLinks} />
    </div>
  )
}

const meta = {
  title: "Components/OffCanvas",
  component: OffCanvas,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof OffCanvas>

export default meta
type Story = StoryObj<typeof meta>

/** Interactive: toggle the panel to see the right-side slide and Escape-to-close. */
export const Playground: Story = {
  args: { menuOpen: true, setMenuOpen: () => {}, menuItems, socialLinks },
  render: () => <OffCanvasDemo />,
}
