import type { Meta, StoryObj } from "@storybook/react"
import { SmartLink } from "./SmartLink"

const meta = {
  title: "Components/SmartLink",
  component: SmartLink,
  parameters: { layout: "centered" },
} satisfies Meta<typeof SmartLink>

export default meta
type Story = StoryObj<typeof meta>

export const Internal: Story = {
  args: { href: "/blog", children: "Read the blog" },
}

export const External: Story = {
  args: { href: "https://github.com/victorfdes", children: "GitHub", showExternalIcon: true },
}
