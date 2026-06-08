import clsx from "clsx"
import { FiLayers, FiZap } from "react-icons/fi"

const VictorBanner = ({
  responsive = true,
}: Readonly<{
  responsive?: boolean
}>) => {
  return (
    <>
      <h1
        className={clsx("text-3xl uppercase", {
          "md:text-6xl": responsive,
        })}
      >
        Victor <span className="font-extralight">Fernandes</span>
      </h1>
      <h2 className="mt-2 flex flex-wrap items-center gap-x-2 font-light uppercase text-zinc-400 md:text-4xl">
        <span>Building</span>
        <span className="text-highlight inline-flex items-center tracking-wide">
          <FiZap className="text-highlight mr-1" strokeWidth={1} />
          Performant
        </span>
        <span>Frontends at</span>
        <span className="text-highlight inline-flex items-center tracking-wide">
          Scale
          <FiLayers className="text-highlight ml-1.5" strokeWidth={1} />
        </span>
      </h2>
    </>
  )
}

export default VictorBanner
