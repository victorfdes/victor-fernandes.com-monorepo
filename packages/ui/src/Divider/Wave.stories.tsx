import type { Meta, StoryObj } from "@storybook/react"
import WaveDivider from "./Wave"

const meta = {
  title: "Components/WaveDivider",
  component: WaveDivider,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof WaveDivider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
