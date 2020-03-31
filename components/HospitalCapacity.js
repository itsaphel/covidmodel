import * as React from 'react';
import {OccupancyGraph} from './OccupancyGraph';
import {Points} from './graph';
import {stateLabels} from '../lib/controls';
import {getDate} from '../lib/date';
import {formatDate, formatPercent1, formatNumber} from '../lib/format';
import {getFirstExceedsThreshold} from '../lib/summary';

const getConfirmedHospitalizations = ({currentlyHospitalized}) =>
  currentlyHospitalized.confirmed;
const getProjectedCurrentlyHospitalized = ({currentlyHospitalized}) =>
  currentlyHospitalized.projected;
const getProjectedCurrentlyHospitalizedLCI = ({currentlyHospitalized}) =>
  currentlyHospitalized.lci;
const getProjectedCurrentlyHospitalizedUCI = ({currentlyHospitalized}) =>
  currentlyHospitalized.uci;

export const HospitalCapacity = ({data, scenario, state, width, height}) => {
  const hospitalCapacity = (1 - data.bedUtilization) * data.staffedBeds;
  const hospitalExceedsCapacity = getFirstExceedsThreshold(
    data[scenario].timeSeriesData,
    getProjectedCurrentlyHospitalized,
    hospitalCapacity
  );
  const stateName = stateLabels[state];
  const hospitalCapacityHeading = hospitalExceedsCapacity ? (
    <>
      {stateName} will{' '}
      <span className="text-red">exceed hospital capacity</span> on{' '}
      {formatDate(getDate(hospitalExceedsCapacity))}
    </>
  ) : (
    <>
      {stateName} will stay{' '}
      <span className="text-green">below hospital capacity</span>
    </>
  );
  return (
    <div>
      <div className="section-heading">{hospitalCapacityHeading}</div>
      <p className="paragraph">
        We estimate the hospital capacity for COVID-19 patients by taking{' '}
        <span className="definition">
          <span className="definition-label">the number of available beds</span>
          &nbsp;
          <span className="definition-data">
            {formatNumber(data.staffedBeds)}
          </span>
        </span>{' '}
        and discounting for that hospital system’s{' '}
        <span className="definition">
          <span className="definition-label">typical occupancy rate</span>&nbsp;
          <span className="definition-data">
            {formatPercent1(data.bedUtilization)}
          </span>
        </span>
        .
      </p>
      <OccupancyGraph
        scenario={scenario}
        data={data}
        x={getDate}
        y={getProjectedCurrentlyHospitalized}
        y0={getProjectedCurrentlyHospitalizedLCI}
        y1={getProjectedCurrentlyHospitalizedUCI}
        cutoff={hospitalCapacity}
        xLabel="people"
        cutoffLabel="Hospital capacity"
        width={width}
        height={height}
      >
        <Points y={getConfirmedHospitalizations} fill="var(--color-gray-03)" />
      </OccupancyGraph>
    </div>
  );
};
