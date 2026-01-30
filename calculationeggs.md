We confirmed the meaning of standards.eggs:

- standards[week].eggs is NOT “eggs per hen per week”.
- It is egg production percentage (Hen-Day Egg Production, HDEP %) for that AGE week.

Correct calculation for a FULL 7-day week:
eggsPeriod = hensHoused _ (standard.eggs / 100) _ 7

Also: the table Period like "2026.26" is ISO calendar year-week.
standards.week is flock AGE in weeks.
So we MUST map calendar week -> flock ageWeek using flock housing date (or hatch date, whichever is used in the current app).

Algorithm:

1. For each calendar period (ISO year-week) get periodStartDate and periodEndDate (7 days).
2. Compute ageDays = differenceInDays(periodStartDate, flock.housingDate).
3. ageWeek = floor(ageDays / 7) (confirm if +1 offset is needed to match existing app)
4. Find standard row by that ageWeek: standards.find(s => s.week === ageWeek)
5. eggsPeriod = hensHoused _ (standard.eggs / 100) _ 7
6. Round to integer for display (the UI shows whole eggs).

Important: eggsNoWeek / eggsNoHD are 0 for layers in many datasets and should NOT be used for this table.
Use ONLY standards.eggs for this output.

Please implement exactly like above and add a small unit test:
hensHoused=28500 and standard.eggs=55 => eggsPeriod=109725 (UI may show 109726 due to rounding).
