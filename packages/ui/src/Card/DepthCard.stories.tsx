import type { Meta, StoryObj } from "@storybook/react"
import { FaDiscord, FaGithub, FaInstagram, FaLinkedinIn, FaXTwitter } from "react-icons/fa6"
import { DepthCard } from "./DepthCard"

const socialButtons = [
  <button key="instagram" type="button" aria-label="Instagram">
    <FaInstagram />
  </button>,
  <button key="x" type="button" aria-label="X">
    <FaXTwitter />
  </button>,
  <button key="discord" type="button" aria-label="Discord">
    <FaDiscord />
  </button>,
]

const meta = {
  title: "Components/DepthCard",
  component: DepthCard,
  parameters: { layout: "centered" },
  args: {
    color: "#00ffd6",
    title: "Orb glass",
    children: "Soft pill body with stacked glass and concentric depth cues.",
    actions: socialButtons,
    cta: <button type="button">Open</button>,
  },
  argTypes: {
    color: { control: "color" },
  },
} satisfies Meta<typeof DepthCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** The site's own accent, for a card that sits alongside the rest of the design system. */
export const SiteCyan: Story = {
  args: { color: "#22d3ee", title: "Cyan surface", children: "The same shell in the site's accent colour." },
}

export const Violet: Story = {
  args: { color: "#a855f7", title: "Chamfer cut", children: "Precision corners read sharp on a dark UI." },
}

export const Solar: Story = {
  args: { color: "#fbbf24", title: "Neo surface", children: "High-contrast rim with an electric accent rail." },
}

/** Actions can be links just as easily as buttons — the card only supplies the circle. */
export const WithLinks: Story = {
  args: {
    color: "#22d3ee",
    title: "Find me",
    children: "Each circle wraps whatever element you hand it.",
    actions: [
      <a key="github" href="https://github.com/victorfdes" aria-label="GitHub">
        <FaGithub />
      </a>,
      <a key="linkedin" href="https://www.linkedin.com/" aria-label="LinkedIn">
        <FaLinkedinIn />
      </a>,
    ],
  },
}

export const NoActions: Story = {
  args: { actions: [], title: "Quiet card", children: "No action row — the CTA holds the trailing edge." },
}

/** The card grows past its 300px floor rather than clipping a long body. */
export const LongBody: Story = {
  args: {
    title: "Layered stack with a considerably longer heading",
    children:
      "Three floating sheets with parallax on hover, plus enough copy to push the body past the card's minimum height and prove the bottom bar stays pinned to the lower edge as the surface grows.",
  },
}
