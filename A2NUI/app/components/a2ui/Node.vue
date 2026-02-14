<script setup lang="ts">
/**
 * A2uiNode — Recursive component that resolves A2UI component types to
 * their corresponding Vue/Nuxt UI implementations.
 *
 * Uses explicit imports because Nuxt auto-imported components
 * don't resolve via resolveComponent() in dynamic :is bindings.
 */
import type { ResolvedNode } from "~/utils/a2ui/types";
import type { Component } from "vue";

import A2uiText from "~/components/a2ui/Text.vue";
import A2uiButton from "~/components/a2ui/Button.vue";
import A2uiTextField from "~/components/a2ui/TextField.vue";
import A2uiCheckBox from "~/components/a2ui/CheckBox.vue";
import A2uiImage from "~/components/a2ui/Image.vue";
import A2uiIcon from "~/components/a2ui/Icon.vue";
import A2uiRow from "~/components/a2ui/Row.vue";
import A2uiColumn from "~/components/a2ui/Column.vue";
import A2uiCard from "~/components/a2ui/Card.vue";
import A2uiDivider from "~/components/a2ui/Divider.vue";
import A2uiTabs from "~/components/a2ui/Tabs.vue";
import A2uiVideo from "~/components/a2ui/Video.vue";
import A2uiAudioPlayer from "~/components/a2ui/AudioPlayer.vue";
import A2uiList from "~/components/a2ui/List.vue";
import A2uiModal from "~/components/a2ui/Modal.vue";
import A2uiChoicePicker from "~/components/a2ui/ChoicePicker.vue";
import A2uiSlider from "~/components/a2ui/Slider.vue";
import A2uiDateTimeInput from "~/components/a2ui/DateTimeInput.vue";
import A2uiFallback from "~/components/a2ui/Fallback.vue";

const props = defineProps<{
  node: ResolvedNode;
  surfaceId: string;
}>();

// Component type → actual Vue component object mapping
const componentMap: Record<string, Component> = {
  Text: A2uiText,
  Button: A2uiButton,
  TextField: A2uiTextField,
  CheckBox: A2uiCheckBox,
  Image: A2uiImage,
  Icon: A2uiIcon,
  Row: A2uiRow,
  Column: A2uiColumn,
  Card: A2uiCard,
  Divider: A2uiDivider,
  Tabs: A2uiTabs,
  Video: A2uiVideo,
  AudioPlayer: A2uiAudioPlayer,
  List: A2uiList,
  Modal: A2uiModal,
  ChoicePicker: A2uiChoicePicker,
  Slider: A2uiSlider,
  DateTimeInput: A2uiDateTimeInput,
};

const resolvedComponent = computed(() => {
  return componentMap[props.node.type] ?? A2uiFallback;
});
</script>

<template>
  <component :is="resolvedComponent" :node="node" :surface-id="surfaceId" />
</template>
