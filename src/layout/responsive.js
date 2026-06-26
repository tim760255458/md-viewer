// responsive.js — 断点监听（1024px）

const BREAKPOINT = 1024

export function isDesktop() {
  return window.innerWidth >= BREAKPOINT
}

/**
 * @param {(nowDesktop: boolean) => void} cb 断点变化时回调
 */
export function watchBreakpoint(cb) {
  const mq = window.matchMedia(`(min-width: ${BREAKPOINT}px)`)
  mq.addEventListener('change', (e) => cb(e.matches))
}
