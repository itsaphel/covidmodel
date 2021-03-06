import * as React from 'react';
import {theme} from '../styles';
import {
  Grid,
  Heading,
  InlineLabel,
  Paragraph,
  Title,
  WithCitation,
} from './content';
import {Graph} from './graph';
import {HeadSideCough, People, Vial} from './icon';
import {
  DistributionLegendRow,
  DistributionLine,
  Estimation,
  ExpectedLegendEntry,
  useLocationData,
  useModelState,
} from './modeling';
import {
  formatShortDate,
  formatDate,
  formatMonths,
  formatNumber,
  formatNumber2,
  formatPercent1,
} from '../lib/format';
import {getLastDate} from '../lib/date';

const {useCallback, useMemo} = React;

const color = theme.color.red[1];
const textColor = theme.color.red.text;

export const Daily = ({width, height}) => {
  const {location, indices, x} = useModelState();
  const {
    dailyDeath,
    dailyReportedDeath,
    newlyExposed,
    dailyPcr,
    domain,
  } = useLocationData();

  return (
    <div className="margin-top-3 flow-root">
      <Heading>Visualizing the data on a daily basis</Heading>
      <Paragraph>
        The graph above shows the impact of the virus on a cumulative basis:
        this gives us a sense of overall impact, but doesn’t give us a good look
        at the daily change in cases. While daily reports tend to fluctuate,
        over time they indicate if there is an increase or decrease in viral
        spread.
      </Paragraph>
      <Paragraph>
        The following graph compares
        <InlineLabel
          color={theme.color.yellow.text}
          fill={theme.color.yellow[3]}
        >
          new infections per day
        </InlineLabel>
        ,
        <InlineLabel color={theme.color.blue.text} fill={theme.color.blue[2]}>
          positive tests per day
        </InlineLabel>
        , and
        <InlineLabel color={theme.color.red.text} fill={theme.color.red[1]}>
          reported fatalities per day
        </InlineLabel>
        , along with their respective confirmed data points:
      </Paragraph>
      <Graph
        data={indices}
        domain={domain.newlyExposed}
        initialScale="log"
        x={x}
        xLabel="people"
        width={width}
        height={height}
        controls
      >
        {() => (
          <>
            <DistributionLine
              y={dailyDeath}
              color={theme.color.red[1]}
              strokeDasharray="6,4"
              mode="line"
              dot={false}
            />
            <DistributionLine
              y={dailyReportedDeath}
              color={theme.color.red[1]}
              mode="gradient"
            />
            <DistributionLine
              y={newlyExposed}
              color={theme.color.yellow[3]}
              mode="gradient"
            />
            <DistributionLine
              y={dailyPcr}
              color={theme.color.blue[2]}
              mode="gradient"
            />
          </>
        )}
      </Graph>
      <Grid>
        <DistributionLegendRow
          title="New infections per day"
          y={newlyExposed}
          color={theme.color.yellow[3]}
          format={formatNumber}
        />
        <DistributionLegendRow
          title="Positive tests per day"
          y={dailyPcr}
          color={theme.color.blue[2]}
          format={formatNumber}
        />
        <DistributionLegendRow
          y={dailyReportedDeath}
          color={theme.color.red[1]}
          title="Fatalities per day"
          description="People who have died from Covid-19"
          formatLabel={(label) => `${label} reported fatalities`}
          before={
            <ExpectedLegendEntry
              label="Modeled fatalities per day"
              color={theme.color.red[1]}
              mode="dash"
              y={dailyDeath}
            />
          }
        />
      </Grid>
    </div>
  );
};
