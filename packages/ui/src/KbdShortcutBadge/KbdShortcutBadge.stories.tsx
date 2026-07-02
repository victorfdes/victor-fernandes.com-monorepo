import type { Meta, StoryObj } from "@storybook/react"
import { KbdShortcutBadge } from "./KbdShortcutBadge"

const meta = {
  title: "Components/KbdShortcutBadge",
  component: KbdShortcutBadge,
  parameters: { layout: "centered" },
  // Hover accents expect a `group/nav` parent, as on the nav links that use the badge.
  render: (args) => (
    <a href="#kbd" className="group/nav inline-flex items-center gap-2 no-underline">
      <KbdShortcutBadge {...args} />
      <span>Blog</span>
    </a>
  ),
} satisfies Meta<typeof KbdShortcutBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Idle: Story = { args: { modifierLabel: "Alt", shortcut: 2 } }
export const Active: Story = { args: { modifierLabel: "Alt", shortcut: 2, active: true } }
export const MacLarge: Story = { args: { modifierLabel: "⌥", shortcut: 2, size: "lg" } }
