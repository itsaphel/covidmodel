import React from 'react';
import Head from 'next/head';
import {useRouter} from 'next/router';
import dayjs from 'dayjs';
import numeral from 'numeral';
import Link from 'next/link';

import {
  Controls,
  DemographicParameters,
  DistancingGradient,
  DistancingGraph,
  HospitalCapacity,
  Layout,
  Legend,
  LegendRow,
  ModelFitParameters,
  OccupancyGraph,
  OutcomeSummary,
  PercentileLine,
  PopulationGraph,
  ProjectedDeaths,
  Section,
} from '../../components';
import {Line, NearestDataProvider, Points} from '../../components/graph';
import {useComponentId, useContentRect} from '../../components/util';
import {getStateData, getStatesWithData} from '../../lib/data';
import {getDate, today} from '../../lib/date';
import {stateLabels} from '../../lib/controls';

const {useCallback, useRef, useState} = React;

const getDistancing = ({distancing}) => distancing;
const getCumulativePcr = ({cumulativePcr}) => cumulativePcr;
const getCurrentlyInfected = ({currentlyInfected}) => currentlyInfected;
const getCurrentlyInfectious = ({currentlyInfectious}) => currentlyInfectious;
const getCurrentlyCritical = ({currentlyCritical}) => currentlyCritical;
const getProjectedCurrentlyCritical = ({currentlyCritical}) =>
  currentlyCritical.percentile50;
const getProjectedCurrentlyCriticalLCI = ({currentlyCritical}) =>
  currentlyCritical.percentile10;
const getProjectedCurrentlyCriticalUCI = ({currentlyCritical}) =>
  currentlyCritical.percentile90;

export default ({data, states}) => {
  const {
    query: {state},
    push,
  } = useRouter();
  const [scenario, setScenario] = useState('scenario1');
  const controlRef = useRef(null);
  const controlRect = useContentRect(controlRef, {width: 896, height: 126});

  const sizeRef = useRef(null);
  const {width} = useContentRect(sizeRef, {width: 896, height: 360});
  const height = width > 600 ? 360 : 256;

  if (!data) {
    return <Layout noPad>Missing data for {state}</Layout>;
  }

  const scenarioSummary = data.scenarios[scenario].summary;

  const handleStateSelect = (e) => {
    push(`/state/${e.target.value}`);
  };

  const socialDistancingGradientId = useComponentId('socialDistancingGradient');

  return (
    <NearestDataProvider
      x={getDate}
      data={data.scenarios[scenario].timeSeriesData}
      initial={today}
    >
      <Layout>
        <Head>
          <title>{states[state]} COVID model forecast</title>
          <meta
            name="Description"
            content={`A projection of COVID 19 cases in ${states[state]} under various scenarios of social distancing.`}
          />
        </Head>
        <style jsx>{`
          .sticky,
          .sticky-overlay,
          .sticky-inlay {
            position: sticky;
            top: 0;
            background: white;
            z-index: 2;
          }
          .sticky-overlay,
          .sticky-inlay {
            display: none;
          }
          .sticky-overlay,
          .sticky-overlay-shadow {
            height: 42px;
          }
          .sticky-overlay {
            z-index: 1;
            margin-bottom: -42px;
          }
          .sticky-overlay-shadow {
            box-shadow: 0 2px rgba(0, 0, 0, 0.04);
          }
          .controls {
            padding-top: var(--spacing-01);
          }
          .sticky-inlay {
            background: transparent;
            z-index: 1;
            margin-bottom: var(--spacing-02);
          }
          .text-jumbo {
            padding-top: 96px;
            margin-bottom: -64px;
          }
        `}</style>
        <style jsx>{`
          .sticky-overlay,
          .sticky-inlay {
            top: calc(${controlRect.height}px);
          }
        `}</style>
        <div className="flex flex-col justify-center">
          <div className="sticky" ref={controlRef}>
            <Section>
              <div className="controls">
                <Controls
                  state={state}
                  states={states}
                  scenario={scenario}
                  setScenario={setScenario}
                />
              </div>
            </Section>
          </div>
          <div className="sticky-overlay">
            <Section>
              <div className="sticky-overlay-shadow" />
            </Section>
          </div>
          <div>
            <div className="sticky-inlay">
              <Section>
                <span className="section-label">Based on these inputs</span>
              </Section>
            </div>
            <Section>
              <div className="text-jumbo">Model inputs</div>
              <div ref={sizeRef}>
                <div className="section-heading">Social distancing</div>
                <p className="paragraph">
                  On the left axis social distance of 100% means no contact with
                  others, which yields an R0 (basic reproduction number) for the
                  virus of zero, since it cannot find new hosts. The
                  zero-percent distance is the un-inhibited reproduction number
                  which is thought to be around 3.1.
                </p>
                <DistancingGraph
                  scenario={scenario}
                  data={data}
                  x={getDate}
                  y={getDistancing}
                  leftLabel="distancing"
                  rightLabel="R0"
                  width={width}
                  height={height}
                />
              </div>
              <DemographicParameters data={data} />
              <ModelFitParameters data={data} />
            </Section>
          </div>
          <div>
            <div className="sticky-inlay">
              <Section>
                <span className="section-label">The model projects</span>
              </Section>
            </div>
            <Section>
              <div className="text-jumbo">Projections</div>
              <div>
                <div className="section-heading">Case progression curve</div>
                <p className="paragraph">
                  We show the current number of infected and infectious
                  individuals as well as the cumulative number of expected PCR
                  confirmations. If less than 20% of the population is infected
                  and the number of active infections is reduced to a small
                  fraction of the population we consider the epidemic contained,
                  and place a grey box on the plot.
                </p>
                <PopulationGraph
                  scenario={scenario}
                  data={data}
                  x={getDate}
                  xLabel="people"
                  width={width}
                  height={height}
                >
                  <PercentileLine
                    y={getCurrentlyInfected}
                    color="var(--color-blue-02)"
                  />
                  <PercentileLine
                    y={getCurrentlyInfectious}
                    color="var(--color-magenta-01)"
                  />
                  <PercentileLine
                    y={getCumulativePcr}
                    color="var(--color-yellow-02)"
                  />
                </PopulationGraph>
                <Legend>
                  <LegendRow
                    y={getCurrentlyInfected}
                    fill="var(--color-blue-02)"
                    label="Currently infected"
                  />
                  <LegendRow
                    y={getCurrentlyInfectious}
                    fill="var(--color-magenta-01)"
                    label="Currently infectious"
                  />
                  <LegendRow
                    y={getCumulativePcr}
                    fill="var(--color-yellow-02)"
                    label="Cumulative PCR"
                  />
                </Legend>
              </div>
              <ProjectedDeaths
                data={data}
                scenario={scenario}
                state={state}
                width={width}
                height={height}
              />
              <HospitalCapacity
                data={data}
                scenario={scenario}
                state={state}
                width={width}
                height={height}
              />
              <div>
                <div className="section-heading">ICU Occupancy</div>
                <p className="paragraph">
                  Note: we assign a higher probability of fatality in the case
                  the ICU capacity is over-shot. This can be seen in countries
                  like Italy where the fatlity rate is substantially higher even
                  controlling for the age distriubtion.
                </p>
                <OccupancyGraph
                  scenario={scenario}
                  data={data}
                  x={getDate}
                  y={getProjectedCurrentlyCritical}
                  y0={getProjectedCurrentlyCriticalLCI}
                  y1={getProjectedCurrentlyCriticalUCI}
                  cutoff={data.icuBeds}
                  xLabel="people"
                  cutoffLabel="ICU capacity"
                  width={width}
                  height={height}
                />
                <Legend>
                  <LegendRow
                    y={getCurrentlyCritical}
                    fill="var(--color-blue-02)"
                    label="Currently in need of ICU care"
                  />
                </Legend>
              </div>
              <OutcomeSummary data={scenarioSummary} />
            </Section>
          </div>
        </div>
      </Layout>
    </NearestDataProvider>
  );
};

export const getStaticProps = ({params: {state}}) => {
  const data = getStateData(state);

  return {
    props: {
      data,
      states: getStatesWithData(),
    },
  };
};

export const getStaticPaths = (_ctx) => {
  return {
    paths: getStatesWithData().map((state) => ({
      params: {state},
    })),
    fallback: false,
  };
};
