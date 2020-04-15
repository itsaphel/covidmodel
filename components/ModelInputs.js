import * as React from 'react';
import Link from 'next/link';
import {theme} from '../styles';
import {DistancingGraph} from './configured';
import {Grid, InlineData, Paragraph} from './content';
import {CalendarDay, Clock, PeopleArrows, Viruses} from './icon';
import {
  MethodDisclaimer,
  MethodDefinition,
  createSeries,
  useDistancing,
  useFindPoint,
  useModelState,
  useLocationQuery,
  useScenarioQuery,
} from './modeling';
import {dayToDate, daysToMonths, today} from '../lib/date';
import {
  formatDate,
  formatShortDate,
  formatNumber,
  formatNumber2,
  formatPercent,
  formatPercent2,
} from '../lib/format';

const {useCallback, useMemo} = React;

export function ModelInputs({height, width, ...remaining}) {
  const {location} = useModelState();

  const [data, _, accessor] = useLocationQuery(`{
    importtime
    r0
  }`);
  const importtime = useCallback(() => accessor()?.location?.importtime, [
    accessor,
  ]);
  const r0 = useCallback(() => accessor()?.location?.r0, [accessor]);

  const [distancing] = useDistancing();

  const findPoint = useFindPoint();
  const [todayIndex] = findPoint(today);
  const todayDistancing = distancing(todayIndex);
  return (
    <div {...remaining}>
      <DistancingGraph
        r0={r0}
        y={distancing}
        leftLabel="distancing"
        rightLabel="R₀"
        width={width}
        height={height}
      />
      {/* <Grid className="margin-top-3 margin-bottom-3">
        {distancingLevel != null && (
          <MethodDefinition
            icon={PeopleArrows}
            value={formatPercent(1 - distancingLevel)}
            label="Social distancing level"
            method="input"
          />
        )}
        <MethodDefinition
          icon={Clock}
          value={`${formatNumber(daysToMonths(distancingDays))} months`}
          label="Social distancing period"
          method="input"
        />
      </Grid> */}
      <Paragraph className="margin-top-2">
        A social distancing level of 100% means no contact with others, which
        yields an R₀ (basic reproduction number) for the virus of zero, since it
        cannot find new hosts. A social distancing level of 0% means that an
        area is operating without any social distancing measures and continuing
        life as usual.
      </Paragraph>

      <Paragraph>
        The current distancing level,{' '}
        <InlineData>{() => formatPercent(1 - todayDistancing)}</InlineData>, is
        calculated based on the average the past three days of available
        mobility data for {location.name}, which is usually reported with a
        three-day delay.
      </Paragraph>

      <div className="section-heading margin-top-4">
        How does the model differ between locations?
      </div>

      <Paragraph>
        We use the data available to us — reported positive tests,
        hospitalizations, and fatalities (among others) — to estimate when
        COVID-19 reached a location and how contaigious it is under those
        conditions.
      </Paragraph>

      <Paragraph className="estimation">
        We estimate that COVID-19 reached {location.name} on{' '}
        <InlineData width="130px">
          {() => formatDate(dayToDate(importtime()))}
        </InlineData>{' '}
        and has an uninhibited R₀ of{' '}
        <InlineData>{() => formatNumber2(r0())}</InlineData>.
      </Paragraph>

      {/* <MethodDisclaimer method="input" />

      <Grid className="margin-bottom-3">
        <MethodDefinition
          icon={Viruses}
          value={formatNumber2(model.r0)}
          label="Basic reproduction number (R₀)"
          method="fit"
        />
        <MethodDefinition
          icon={CalendarDay}
          value={formatShortDate(dayToDate(model.importtime))}
          label="Import date of COVID-19"
          method="fit"
        />
      </Grid> */}
    </div>
  );
}
