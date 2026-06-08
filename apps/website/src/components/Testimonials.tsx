import { SmartLink } from "@repo/ui"
import { cdnUrl } from "utils/cdn"

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
    imageSrc: cdnUrl("i/kelsey-libert.jpeg"),
    linkedIn: "https://www.linkedin.com/in/kelseylibert/",
  },
  {
    quote:
      "He has excellent leadership skills and top-class communication abilities. His hard skills as a developer are also outstanding. He is highly knowledgeable and skillful in React, Node.js, and DevOps.",
    name: "Eric TaeJun Lee",
    title: "CEO, Ssemble",
    imageSrc: cdnUrl("i/eric-lee.jpeg"),
    linkedIn: "https://www.linkedin.com/in/eric-taejun-lee-675224234/",
  },
  {
    quote:
      "It is with great pleasure that I recommend Victor Fernandes. Of all the freelancers we have worked with, Victor really stands out. He is a hard working individual with a great sense of judgment and spirit of collaboration and understanding. More importantly, he is a person of trust with a long term vision. Thanks for your help Victor!",
    name: "Claude Francoeur",
    title: "Professor, HEC Montréal",
    imageSrc: cdnUrl("i/claude-francoeur.jpeg"),
    linkedIn: "https://www.linkedin.com/in/professorclaudefrancoeur/",
  },
]

export function Testimonials() {
  return (
    <section className="w-full">
      <div>
        <div className="text-center">
          <h2>Reliable Engineering, Proven in Practice</h2>
          <p>A few words from people I've partnered with across startups, academia, and product teams.</p>
        </div>

        <div className="mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-6 lg:max-w-none lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <figure key={testimonial.name} className="shadow-hover-box flex h-full flex-col">
              <blockquote className="flex-1">
                <p>“{testimonial.quote}”</p>
              </blockquote>

              <figcaption className="border-color mt-8 flex items-center gap-4 border-t pt-6">
                <img
                  src={testimonial.imageSrc}
                  alt={testimonial.name}
                  title={testimonial.name}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full object-cover"
                />

                <div>
                  <div>
                    <SmartLink href={testimonial.linkedIn} showExternalIcon>
                      {testimonial.name}
                    </SmartLink>
                  </div>
                  <div className="mt-1 text-sm">{testimonial.title}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
