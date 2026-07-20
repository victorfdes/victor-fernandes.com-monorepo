import diagramManifest from "./_data/diagram-manifest.generated.json"

type DiagramId = keyof typeof diagramManifest

interface DiagramProps {
  id: DiagramId
}

export function Diagram({ id }: Readonly<DiagramProps>) {
  const diagram = diagramManifest[id]
  const minimumWidth = Math.min(diagram.width, 720)
  const imageStyle = { minWidth: `${String(minimumWidth)}px` }
  const accessibleName = `${diagram.title}. ${diagram.description}`

  return (
    <div
      aria-label={accessibleName}
      className="mt-8 grid overflow-x-auto rounded-lg focus-visible:outline-offset-2"
      data-diagram={id}
      role="img"
      // Wide diagrams need a keyboard-focusable viewport for horizontal scrolling.
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Keyboard scrolling is required for the diagram viewport.
      tabIndex={0}
    >
      <img
        alt=""
        aria-hidden="true"
        className="!mt-0 h-auto w-full opacity-100 [grid-area:1/1] dark:opacity-0"
        decoding="async"
        height={diagram.height}
        loading="lazy"
        src={diagram.lightSrc}
        data-testid={`${id}-light`}
        style={imageStyle}
        width={diagram.width}
      />
      <img
        alt=""
        aria-hidden="true"
        className="pointer-events-none !mt-0 h-auto w-full opacity-0 [grid-area:1/1] dark:opacity-100"
        decoding="async"
        height={diagram.height}
        loading="lazy"
        src={diagram.darkSrc}
        data-testid={`${id}-dark`}
        style={imageStyle}
        width={diagram.width}
      />
    </div>
  )
}
