<script lang="ts">
import { size, reduce } from 'lodash';
import { i18n, type SummaryProps, TOOLTIP_PREFIX_CLS } from '@antv/s2';
import { computed, defineComponent } from 'vue';
import type { GetInitProps } from '../../../interface';

export default defineComponent({
  name: 'TooltipSummary',
  props: ['summaries'] as unknown as GetInitProps<SummaryProps>,
  setup(props) {
    const count = computed(() =>
      reduce(props.summaries, (pre, next) => pre + size(next?.selectedData), 0),
    );

    return {
      count: count.value,
      i18n,
      TOOLTIP_PREFIX_CLS,
    };
  },
  components: {},
});
</script>

<template>
  <div :class="`${TOOLTIP_PREFIX_CLS}-summary`">
    <div :class="`${TOOLTIP_PREFIX_CLS}-summary-item`">
      <span :class="`${TOOLTIP_PREFIX_CLS}-selected`">
        {{ count }} {{ i18n('项') }}
      </span>
      {{ i18n('已选择') }}
    </div>
    <div
      v-for="summary in summaries"
      :key="`${summary.name}-${summary.value}`"
      :class="`${TOOLTIP_PREFIX_CLS}-summary-item`"
    >
      <span :class="`${TOOLTIP_PREFIX_CLS}-summary-key`">
        {{ summary.name }} {{ i18n('总和') }}
      </span>
      <span
        :class="`${TOOLTIP_PREFIX_CLS}-summary-val ${TOOLTIP_PREFIX_CLS}-bold`"
      >
        {{ summary.value }}
      </span>
    </div>
  </div>
</template>

<style lang="less"></style>
