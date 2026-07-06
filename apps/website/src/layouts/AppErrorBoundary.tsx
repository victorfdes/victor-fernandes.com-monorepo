import React from "react"

type AppErrorBoundaryProps = Readonly<{
  children: React.ReactNode
  fallback: React.ReactNode
}>

type AppErrorBoundaryState = Readonly<{
  hasError: boolean
}>

/**
 * The whole page (header, slotted main content, footer) hydrates through the
 * single client:load AppLayout island, so a render or hydration throw would
 * otherwise unmount everything and blank the page. The fallback keeps the
 * server-rendered content readable without the interactive chrome.
 *
 * React still requires a class component for error boundaries.
 */
export default class AppErrorBoundary extends React.Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  override state: AppErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true }
  }

  override render(): React.ReactNode {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}
