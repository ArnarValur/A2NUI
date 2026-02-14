<script setup lang="ts">
/**
 * A2UI ChoicePicker — Selection component with two variants:
 *   - mutuallyExclusive → URadioGroup (single selection)
 *   - multipleSelection → UCheckboxGroup (multi selection)
 *
 * Default is mutuallyExclusive if variant is not specified.
 */
import type { ResolvedNode } from "~/utils/a2ui/types";

const props = defineProps<{
  node: ResolvedNode;
  surfaceId: string;
}>();

const label = computed(() => props.node.properties.label as string | undefined);
const variant = computed(() =>
  String(props.node.properties.variant ?? "mutuallyExclusive"),
);
const isMultiple = computed(() => variant.value === "multipleSelection");

const options = computed(() => {
  const raw = props.node.properties.options as
    | Array<{ label: string; value: string }>
    | undefined;
  if (!raw) return [];
  return raw.map((opt) => ({
    label: String(opt.label ?? ""),
    value: String(opt.value ?? ""),
  }));
});

// For single selection
const singleValue = ref("");
// For multiple selection
const multipleValue = ref<string[]>([]);

// Initialize from A2UI value property
onMounted(() => {
  const val = props.node.properties.value;
  if (Array.isArray(val)) {
    multipleValue.value = val.map(String);
    if (val.length > 0) singleValue.value = String(val[0]);
  } else if (typeof val === "string") {
    singleValue.value = val;
    multipleValue.value = [val];
  }
});
</script>

<template>
  <div class="w-full space-y-2">
    <label v-if="label" class="text-sm font-medium text-highlighted">
      {{ label }}
    </label>

    <!-- Multiple selection: checkboxes -->
    <template v-if="isMultiple">
      <div class="space-y-2">
        <UCheckbox
          v-for="option in options"
          :key="option.value"
          :label="option.label"
          :model-value="multipleValue.includes(option.value)"
          @update:model-value="
            (checked: boolean) => {
              if (checked) {
                multipleValue = [...multipleValue, option.value];
              } else {
                multipleValue = multipleValue.filter((v) => v !== option.value);
              }
            }
          "
        />
      </div>
    </template>

    <!-- Mutually exclusive: radio group -->
    <template v-else>
      <URadioGroup v-model="singleValue" :items="options" />
    </template>
  </div>
</template>
