import {
  type ColHeaderConfig,
  customMerge,
  Node,
  type S2DataConfig,
  type S2Options,
  SpreadSheet,
  type ViewMeta,
  type MultiData,
  type S2CellType,
  MiniChartTypes,
} from '@antv/s2';
import { isArray, isEmpty, isObject, size } from 'lodash';
import React from 'react';
import { BaseSheet } from '../base-sheet';
import type { SheetComponentsProps } from '../interface';
import { CustomColCell } from './custom-col-cell';
import { CustomDataCell } from './custom-data-cell';
import { StrategyDataSet } from './custom-data-set';
import { KpiBulletTooltip } from './custom-tooltip/kpi-columns/custom-bullet-tooltip';
import { ColTooltip } from './custom-tooltip/custom-col-tooltip';
import { DataTooltip } from './custom-tooltip/custom-data-tooltip';
import { RowTooltip } from './custom-tooltip/custom-row-tooltip';

export interface StrategySheetProps extends SheetComponentsProps {
  bulletTooltipDescription: (
    cell: S2CellType<Node | ViewMeta>,
  ) => React.ReactNode;
}

/* *
 * 趋势分析表特性：
 * 1. 维度为空时默认为自定义目录树结构
 * 2. 单指标时数值置于列头，且隐藏指标列头
 * 3. 多指标时数值置于行头，不隐藏指标列头
 * 4. 支持 KPI 进度 (子弹图)
 * 5. 行头, 数值单元格不支持多选
 */
export const StrategySheet: React.FC<StrategySheetProps> = React.memo(
  (props) => {
    const {
      options,
      themeCfg,
      dataCfg,
      bulletTooltipDescription,
      ...restProps
    } = props;
    const s2Ref = React.useRef<SpreadSheet>();

    const strategySheetOptions = React.useMemo<
      Partial<S2Options<React.ReactNode>>
    >(() => {
      if (isEmpty(dataCfg)) {
        return {};
      }
      let hideMeasureColumn = false;
      let hierarchyType: S2Options['hierarchyType'] = 'tree';

      // 根据 dataConfig 切换 hierarchyType
      if (
        isEmpty(dataCfg?.fields?.rows) &&
        !isEmpty(dataCfg?.fields?.customTreeItems)
      ) {
        hierarchyType = 'customTree';
      }

      // 单指标非自定义树结构隐藏指标列
      if (
        size(dataCfg?.fields?.values) === 1 &&
        options.hierarchyType !== 'customTree'
      ) {
        hideMeasureColumn = true;
      }
      return {
        dataCell: (viewMeta: ViewMeta) =>
          new CustomDataCell(viewMeta, viewMeta.spreadsheet),
        colCell: (
          node: Node,
          spreadsheet: SpreadSheet,
          headerConfig: ColHeaderConfig,
        ) => new CustomColCell(node, spreadsheet, headerConfig),
        dataSet: (spreadSheet: SpreadSheet) => new StrategyDataSet(spreadSheet),
        showDefaultHeaderActionIcon: false,
        hierarchyType,
        style: {
          colCfg: {
            hideMeasureColumn,
          },
        },
        interaction: {
          autoResetSheetStyle: true,
          // 趋势分析表禁用 刷选, 多选, 区间多选
          brushSelection: false,
          selectedCellMove: false,
          multiSelection: false,
          rangeSelection: false,
        },
        tooltip: {
          operation: {
            hiddenColumns: true,
          },
          row: {
            content: (cell) => <RowTooltip cell={cell} />,
          },
          col: {
            content: (cell) => <ColTooltip cell={cell} />,
          },
          data: {
            content: (cell) => {
              const meta = cell.getMeta() as ViewMeta;
              const fieldValue = meta.fieldValue as MultiData;

              // 如果是数组, 说明是普通数值+同环比数据 或者 KPI数据, 显示普通数值 Tooltip
              if (isArray(fieldValue?.values)) {
                return <DataTooltip cell={cell} />;
              }

              // 如果是对象, 且是子弹图数据, 显示子弹图定制 Tooltip
              const ifShowBulletTooltip =
                isObject(fieldValue?.values) &&
                (fieldValue?.values?.type === MiniChartTypes.Bullet ||
                  !fieldValue?.values?.type);

              if (ifShowBulletTooltip) {
                return (
                  <KpiBulletTooltip
                    cell={cell}
                    description={bulletTooltipDescription}
                  />
                );
              }

              return <></>;
            },
          },
        },
      };
    }, [dataCfg, options.hierarchyType, bulletTooltipDescription]);

    const s2DataCfg = React.useMemo<S2DataConfig>(() => {
      const defaultFields: Partial<S2DataConfig> = {
        fields: {
          // 多指标数值挂行头，单指标挂列头
          valueInCols: size(dataCfg?.fields?.values) <= 1,
        },
      };
      return customMerge(dataCfg, defaultFields);
    }, [dataCfg]);

    const s2Options = React.useMemo<S2Options>(() => {
      return customMerge(options, strategySheetOptions);
    }, [options, strategySheetOptions]);

    return (
      <BaseSheet
        options={s2Options}
        themeCfg={themeCfg}
        dataCfg={s2DataCfg}
        ref={s2Ref}
        {...restProps}
      />
    );
  },
);

StrategySheet.displayName = 'StrategySheet';
