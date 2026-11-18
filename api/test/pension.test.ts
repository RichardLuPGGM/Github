import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ageOn, annualAccrual, contributionSplit, pensionableSalary, projectPension } from '../src/domain/pension.ts';

test('pensionable salary subtracts the franchise', () => {
  assert.equal(pensionableSalary(52_000, 1), 34_455);
});

test('pensionable salary applies the part-time factor', () => {
  assert.equal(pensionableSalary(46_000, 0.6), 17_073);
});

test('pensionable salary is capped at the salary cap', () => {
  assert.equal(pensionableSalary(150_000, 1), 120_255);
});

test('pensionable salary is never negative (salary below franchise)', () => {
  assert.equal(pensionableSalary(16_000, 0.9), 0);
});

test('pensionable salary rejects invalid part-time factors', () => {
  assert.throws(() => pensionableSalary(40_000, 0), RangeError);
  assert.throws(() => pensionableSalary(40_000, 1.2), RangeError);
});

test('annual accrual is 1.75% of pensionable salary', () => {
  assert.equal(annualAccrual(34_455), 602.96);
});

test('contribution split is 60% employer / 40% employee', () => {
  assert.deepEqual(contributionSplit(10_000), { total: 2_700, employer: 1_620, employee: 1_080 });
});

test('age is calculated in whole years', () => {
  assert.equal(ageOn('1972-04-15', '2026-11-18'), 54);
  assert.equal(ageOn('1979-12-20', '2026-11-18'), 46);
});

test('projection at the standard retirement age adds future accrual', () => {
  const result = projectPension({
    birthDate: '1972-04-15', fullTimeSalary: 52_000, partTimeFactor: 1, accruedToDate: 5_000, asOf: '2026-11-18',
  });
  assert.equal(result.yearsToRetirement, 14);
  assert.equal(result.futureAccrual, 8_441.44);
  assert.equal(result.projectedAnnualPension, 13_441.44);
  assert.equal(result.retirementDate, '2040-04-15');
});

test('projection at age 63 stops accrual and applies the simple early-retirement reduction', () => {
  const result = projectPension({
    birthDate: '1972-04-15', fullTimeSalary: 52_000, partTimeFactor: 1, accruedToDate: 5_000,
    asOf: '2026-11-18', retirementAge: 63,
  });
  assert.equal(result.yearsToRetirement, 9);
  assert.equal(result.futureAccrual, 5_426.64);
  assert.equal(result.earlyRetirementReduction, 0.325);
  assert.equal(result.unreducedAnnualPension, 10_426.64);
  assert.equal(result.projectedAnnualPension, 7_037.98);
});

test('projection accepts the earliest age and does not apply the reduction at age 68', () => {
  const early = projectPension({
    birthDate: '1972-04-15', fullTimeSalary: 52_000, partTimeFactor: 1, accruedToDate: 5_000,
    asOf: '2026-11-18', retirementAge: 60,
  });
  assert.equal(early.yearsToRetirement, 6);
  assert.equal(early.earlyRetirementReduction, 0.52);

  const standard = projectPension({
    birthDate: '1972-04-15', fullTimeSalary: 52_000, partTimeFactor: 1, accruedToDate: 5_000,
    asOf: '2026-11-18', retirementAge: 68,
  });
  assert.equal(standard.earlyRetirementReduction, 0);
  assert.equal(standard.projectedAnnualPension, standard.unreducedAnnualPension);
});

test('projection rejects retirement ages outside the allowed range or below the current age', () => {
  const base = {
    birthDate: '1972-04-15', fullTimeSalary: 52_000, partTimeFactor: 1, accruedToDate: 0, asOf: '2026-11-18',
  };
  assert.throws(() => projectPension({ ...base, retirementAge: 59 }), /between 60 and 68/);
  assert.throws(() => projectPension({ ...base, retirementAge: 69 }), /between 60 and 68/);
  assert.throws(() => projectPension({ ...base, retirementAge: 63.5 }), /whole number/);
  assert.throws(
    () => projectPension({ ...base, birthDate: '1960-01-01', retirementAge: 63 }),
    /below the member's current age/,
  );
});
