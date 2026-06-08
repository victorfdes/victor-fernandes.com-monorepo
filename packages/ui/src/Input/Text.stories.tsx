import type { Meta, StoryObj } from "@storybook/react"
import { PiCopyBold, PiEnvelopeSimpleBold } from "react-icons/pi"
import { TextInput } from "./Text"

const meta: Meta<typeof TextInput> = {
  title: "Components/TextInput",
  component: TextInput,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  args: { "aria-label": "Email", placeholder: "name@example.com" },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithSlots: Story = {
  args: {
    leftSlot: <PiEnvelopeSimpleBold />,
    rightSlot: <PiCopyBold />,
    defaultValue: "vic@fdes.pro",
  },
}

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "vic@fdes.pro" },
}
