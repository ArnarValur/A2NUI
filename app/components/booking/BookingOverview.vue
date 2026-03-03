<script setup lang="ts">
/**
 * BookingOverview — Top-level wrapper for the staff-column schedule view.
 * Handles date navigation, auto-detects time range, current-time tracking.
 *
 * Portable: zero A2NUI-specific dependencies.
 * Dependencies: Vue 3, date-fns (formatDate).
 */
import type { BookingSlot } from "./BookingCard.vue";
import type { StaffMember } from "./BookingGrid.vue";

const props = withDefaults(
  defineProps<{
    bookings: BookingSlot[];
    staff: StaffMember[];
    date: Date;
    slotInterval?: number;
    paddingHours?: number;
    pixelsPerMinute?: number;
  }>(),
  {
    slotInterval: 30,
    paddingHours: 1,
    pixelsPerMinute: 1.6,
  },
);

const emit = defineEmits<{
  "booking-click": [booking: BookingSlot];
  "date-change": [date: Date];
  "slot-click": [payload: { staffId: string; hour: number; minute: number }];
}>();

// Auto-detect time range from bookings, padded ±1h
const timeRange = computed(() => {
  if (!props.bookings.length) {
    return { start: 8, end: 18 };
  }
  let minHour = 23;
  let maxHour = 0;
  for (const b of props.bookings) {
    const s = new Date(b.startTime);
    const e = new Date(b.endTime);
    minHour = Math.min(minHour, s.getHours());
    maxHour = Math.max(maxHour, e.getHours() + (e.getMinutes() > 0 ? 1 : 0));
  }
  return {
    start: Math.max(0, minHour - props.paddingHours),
    end: Math.min(24, maxHour + props.paddingHours),
  };
});

// Date formatting
const formattedDate = computed(() => {
  const d = props.date;
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  return d.toLocaleDateString("nb-NO", options);
});

const isToday = computed(() => {
  const now = new Date();
  return (
    props.date.getFullYear() === now.getFullYear() &&
    props.date.getMonth() === now.getMonth() &&
    props.date.getDate() === now.getDate()
  );
});

// Current time tracking (update every minute)
const currentTimeMinutes = ref<number | null>(null);

let timer: ReturnType<typeof setInterval> | null = null;

function updateCurrentTime() {
  if (isToday.value) {
    const now = new Date();
    currentTimeMinutes.value = now.getHours() * 60 + now.getMinutes();
  } else {
    currentTimeMinutes.value = null;
  }
}

onMounted(() => {
  updateCurrentTime();
  timer = setInterval(updateCurrentTime, 60_000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

watch(() => props.date, updateCurrentTime);

// Date navigation
function goToday() {
  emit("date-change", new Date());
}

function goPrev() {
  const d = new Date(props.date);
  d.setDate(d.getDate() - 1);
  emit("date-change", d);
}

function goNext() {
  const d = new Date(props.date);
  d.setDate(d.getDate() + 1);
  emit("date-change", d);
}

// Stats
const stats = computed(() => {
  const all = props.bookings;
  return {
    total: all.length,
    confirmed: all.filter((b) => b.status === "confirmed").length,
    pending: all.filter((b) => b.status === "pending").length,
    completed: all.filter((b) => b.status === "completed").length,
    cancelled: all.filter((b) => b.status === "cancelled").length,
  };
});
</script>

<template>
  <div class="booking-overview">
    <!-- Top bar: date nav + stats -->
    <div class="booking-overview__toolbar">
      <div class="booking-overview__date-nav">
        <button
          class="booking-overview__nav-btn"
          :class="{ 'booking-overview__nav-btn--active': isToday }"
          @click="goToday"
        >
          I dag
        </button>
        <button class="booking-overview__nav-btn" @click="goPrev">‹</button>
        <button class="booking-overview__nav-btn" @click="goNext">›</button>
        <span class="booking-overview__date-label">
          {{ formattedDate }}
        </span>
      </div>

      <div class="booking-overview__stats">
        <span class="booking-overview__stat">
          <span class="booking-overview__stat-count">{{ stats.total }}</span>
          totalt
        </span>
        <span class="booking-overview__stat booking-overview__stat--confirmed">
          <span class="booking-overview__stat-count">{{
            stats.confirmed
          }}</span>
          bekreftet
        </span>
        <span
          v-if="stats.pending > 0"
          class="booking-overview__stat booking-overview__stat--pending"
        >
          <span class="booking-overview__stat-count">{{ stats.pending }}</span>
          venter
        </span>
        <span
          v-if="stats.completed > 0"
          class="booking-overview__stat booking-overview__stat--completed"
        >
          <span class="booking-overview__stat-count">{{
            stats.completed
          }}</span>
          fullført
        </span>
      </div>
    </div>

    <!-- Grid -->
    <BookingGrid
      :bookings="bookings"
      :staff="staff"
      :start-hour="timeRange.start"
      :end-hour="timeRange.end"
      :slot-interval="slotInterval"
      :pixels-per-minute="pixelsPerMinute"
      :current-time-minutes="currentTimeMinutes"
      @booking-click="emit('booking-click', $event)"
      @slot-click="emit('slot-click', $event)"
    />

    <!-- Empty state -->
    <div v-if="!bookings.length" class="booking-overview__empty">
      <span class="booking-overview__empty-icon">📅</span>
      <p>Ingen bestillinger for denne dagen</p>
    </div>
  </div>
</template>

<style scoped>
.booking-overview {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

/* ---- Toolbar ---- */
.booking-overview__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.booking-overview__date-nav {
  display: flex;
  align-items: center;
  gap: 6px;
}

.booking-overview__nav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 10px;
  border: 1px solid var(--color-jumbo-200);
  border-radius: 6px;
  background: transparent;
  color: var(--color-jumbo-700);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.booking-overview__nav-btn:hover {
  background: var(--color-jumbo-100);
  border-color: var(--color-jumbo-300);
}

.booking-overview__nav-btn--active {
  background: var(--color-moody-blue-600);
  color: white;
  border-color: var(--color-moody-blue-600);
}

.booking-overview__nav-btn--active:hover {
  background: var(--color-moody-blue-700);
}

.dark .booking-overview__nav-btn {
  border-color: var(--color-jumbo-600);
  color: var(--color-jumbo-300);
}

.dark .booking-overview__nav-btn:hover {
  background: var(--color-jumbo-800);
  border-color: var(--color-jumbo-500);
}

.dark .booking-overview__nav-btn--active {
  background: var(--color-moody-blue-600);
  color: white;
  border-color: var(--color-moody-blue-600);
}

.booking-overview__date-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-jumbo-800);
  margin-left: 8px;
  text-transform: capitalize;
}

.dark .booking-overview__date-label {
  color: var(--color-jumbo-200);
}

/* ---- Stats ---- */
.booking-overview__stats {
  display: flex;
  gap: 16px;
  align-items: center;
}

.booking-overview__stat {
  font-size: 0.75rem;
  color: var(--color-jumbo-500);
  display: flex;
  align-items: center;
  gap: 4px;
}

.booking-overview__stat-count {
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--color-jumbo-800);
}

.dark .booking-overview__stat-count {
  color: var(--color-jumbo-200);
}

.booking-overview__stat--confirmed .booking-overview__stat-count {
  color: var(--color-mountain-meadow-600);
}

.booking-overview__stat--pending .booking-overview__stat-count {
  color: var(--color-orange-peel-500);
}

.booking-overview__stat--completed .booking-overview__stat-count {
  color: var(--color-moody-blue-500);
}

/* ---- Empty State ---- */
.booking-overview__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
  gap: 8px;
  color: var(--color-jumbo-400);
  font-size: 0.9rem;
}

.booking-overview__empty-icon {
  font-size: 2rem;
}

/* ---- Responsive ---- */
@media (max-width: 768px) {
  .booking-overview__toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .booking-overview__date-label {
    font-size: 0.8rem;
  }

  .booking-overview__stats {
    gap: 10px;
  }
}
</style>
