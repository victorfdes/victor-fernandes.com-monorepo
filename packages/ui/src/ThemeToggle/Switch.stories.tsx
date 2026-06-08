import type { Meta, StoryObj } from "@storybook/react"
import type { ComponentProps } from "react"
import { useState } from "react"
import { ThemeToggleSwitch } from "./Switch"

function ThemeToggleSwitchStory(args: ComponentProps<typeof ThemeToggleSwitch>) {
  const [darkMode, setDarkMode] = useState(args.darkMode)
  return <ThemeToggleSwitch darkMode={darkMode} setDarkMode={setDarkMode} />
}

const meta = {
  title: "Components/ThemeToggleSwitch",
  component: ThemeToggleSwitch,
  parameters: { layout: "centered" },
  args: { setDarkMode: () => {} },
  render: (args) => <ThemeToggleSwitchStory {...args} />,
} satisfies Meta<typeof ThemeToggleSwitch>

export default meta
type Story = StoryObj<typeof meta>

export const Light: Story = { args: { darkMode: false } }
export const Dark: Story = { args: { darkMode: true } }
