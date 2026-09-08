import type { Meta, StoryObj } from "@storybook/react"
import { TfiAlignRight } from "react-icons/tfi"
import { SmartButton } from "./SmartButton"

const meta = {
  title: "Components/SmartButton",
  component: SmartButton,
  parameters: { layout: "centered" },
  args: { children: "Get in touch" },
  argTypes: {
    intent: { control: "inline-radio", options: ["primary", "secondary", "tertiary"] },
  },
} satisfies Meta<typeof SmartButton>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = { args: { intent: "primary" } }
export const Secondary: Story = { args: { intent: "secondary" } }
export const Tertiary: Story = { args: { intent: "tertiary" } }

export const AsLink: Story = {
  args: { intent: "primary", href: "/resume", children: "View resume" },
}

export const ExternalLink: Story = {
  args: { intent: "secondary", href: "https://github.com/victorfdes", children: "GitHub" },
}

export const IconOnly: Story = {
  args: { intent: "tertiary", children: undefined, "aria-label": "Open menu", icon: <TfiAlignRight size={24} /> },
}
