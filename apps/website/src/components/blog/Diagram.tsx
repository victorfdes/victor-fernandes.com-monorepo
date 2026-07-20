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
      className="mt-8 overflow-x-auto rounded-lg focus-visible:outline-offset-2"
      data-diagram={id}
      role="img"
      // Wide diagrams need a keyboard-focusable viewport for horizontal scrolling.
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Keyboard scrolling is required for the diagram viewport.
      tabIndex={0}
    >
      <img
        alt=""
        aria-hidden="true"
        className="!mt-0 h-auto w-full dark:hidden"
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
        className="!mt-0 hidden h-auto w-full dark:block"
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
