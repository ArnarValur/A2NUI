/**
 * useScrollReveal — adds `.revealed` class when element enters viewport
 *
 * Usage:
 *   const el = ref<HTMLElement>()
 *   useScrollReveal(el, { threshold: 0.15 })
 *   // In template: <div ref="el" class="reveal-fade-up">
 */
export function useScrollReveal(
  target: Ref<HTMLElement | undefined>,
  options: { threshold?: number; rootMargin?: string } = {}
) {
  const revealed = ref(false)

  onMounted(() => {
    const el = toValue(target)
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting) {
          revealed.value = true
          el.classList.add('revealed')
          observer.disconnect()
        }
      },
      {
        threshold: options.threshold ?? 0.15,
        rootMargin: options.rootMargin ?? '0px 0px -40px 0px'
      }
    )

    observer.observe(el)

    onUnmounted(() => observer.disconnect())
  })

  return { revealed }
}
