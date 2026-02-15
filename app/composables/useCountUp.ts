/**
 * useCountUp — animates a number from 0 to target
 *
 * Usage:
 *   const el = ref<HTMLElement>()
 *   const { display } = useCountUp(el, 18, { duration: 1500 })
 *   // In template: <span ref="el">{{ display }}</span>
 */
export function useCountUp(
  target: Ref<HTMLElement | undefined>,
  endValue: number,
  options: { duration?: number; prefix?: string; suffix?: string } = {}
) {
  const current = ref(0)
  const duration = options.duration ?? 1500
  const started = ref(false)

  const display = computed(() => {
    const val = current.value
    return `${options.prefix ?? ''}${val}${options.suffix ?? ''}`
  })

  function animate() {
    if (started.value) return
    started.value = true

    const start = performance.now()

    function step(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      current.value = Math.round(eased * endValue)

      if (progress < 1) {
        requestAnimationFrame(step)
      } else {
        current.value = endValue
      }
    }

    requestAnimationFrame(step)
  }

  onMounted(() => {
    const el = toValue(target)
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting) {
          animate()
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    onUnmounted(() => observer.disconnect())
  })

  return { current, display }
}
