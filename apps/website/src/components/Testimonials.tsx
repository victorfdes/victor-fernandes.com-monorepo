import { SmartLink } from "@repo/ui"
import type { CSSProperties } from "react"
import { cdnUrl } from "utils/cdn"
import SectionHead from "./SectionHead"

type Testimonial = {
  quote: string
  name: string
  title: string
  imageSrc: string
  linkedIn: string
}

const testimonials: Testimonial[] = [
  {
    quote:
      "I've worked with Victor for over a year now and he's been a huge help with a wide variety of requests. Victor is quick to respond no matter the time, and is very detailed with his answers when you need a little more of a technical education. He goes out of his way to help you find what you need, and always pulls through in a pinch. Victor comes highly recommended.",
    name: "Kelsey Libert",
    title: "Cofounder, frac.tl",
    imageSrc: cdnUrl("images/48/kelsey-libert.jpeg"),
    linkedIn: "https://www.linkedin.com/in/kelseylibert/",
  },
  {
    quote:
      "He has excellent leadership skills and top-class communication abilities. His hard skills as a developer are also outstanding. He is highly knowledgeable and skillful in React, Node.js, and DevOps.",
    name: "Eric TaeJun Lee",
    title: "CEO, Ssemble",
    imageSrc: cdnUrl("images/48/eric-lee.jpeg"),
    linkedIn: "https://www.linkedin.com/in/eric-taejun-lee-675224234/",
  },
  {
    quote:
      "It is with great pleasure that I recommend Victor Fernandes. Of all the freelancers we have worked with, Victor really stands out. He is a hard working individual with a great sense of judgment and spirit of collaboration and understanding. More importantly, he is a person of trust with a long term vision. Thanks for your help Victor!",
    name: "Claude Francoeur",
    title: "Professor, HEC Montréal",
    imageSrc: cdnUrl("images/48/claude-francoeur.jpeg"),
    linkedIn: "https://www.linkedin.com/in/professorclaudefrancoeur/",
  },
]

export function Testimonials() {
  return (
    <section className="section" aria-labelledby="reliable-engineering">
      {/* The section head carries the `id`: it is the only heading here, so `aria-labelledby` points at it. */}
      <SectionHead id="reliable-engineering">Reliable Engineering</SectionHead>

      <p className="lede m-0 mb-[clamp(3rem,7vw,4.5rem)] max-w-[58ch]">
        A few words from people I've partnered with across startups, academia, and product teams.
      </p>

      {/*
        The portraits stay: they are real people who agreed to be quoted, and a photograph is
        content in a way the artboard's placeholder initials are not. Only the frame changes —
        a hairline ring instead of a card.
      */}
      <div className="rule-grid" style={{ "--rule-grid-min": "16.25rem" } as CSSProperties}>
        {testimonials.map((testimonial) => (
          <figure key={testimonial.name} className="m-0 flex flex-col gap-8">
            <blockquote className="lede m-0 flex-1 text-[1.0625rem]">“{testimonial.quote}”</blockquote>

            <figcaption className="flex items-center gap-4">
              <img
                src={testimonial.imageSrc}
                alt=""
                width={44}
                height={44}
                loading="lazy"
                decoding="async"
                className="border-line size-11 shrink-0 rounded-full border object-cover"
              />

              <div className="min-w-0">
                <SmartLink href={testimonial.linkedIn} showExternalIcon>
                  {testimonial.name}
                </SmartLink>
                <div className="meta mt-1 text-[0.8125rem]">{testimonial.title}</div>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
