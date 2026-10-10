export interface MonthlyPulseStat {
  month: string;
  label: string;
  labelTh: string;
  avgPulse: number;
  avgSys: number;
  avgDia: number;
  count: number;
}

export const MOM_MONTHLY_DATA: MonthlyPulseStat[] = [
  { month: '2025-10', label: 'Oct 25', labelTh: 'ต.ค. 25', avgPulse: 81, avgSys: 104, avgDia: 66, count: 52 },
  { month: '2025-11', label: 'Nov 25', labelTh: 'พ.ย. 25', avgPulse: 83, avgSys: 104, avgDia: 66, count: 47 },
  { month: '2025-12', label: 'Dec 25', labelTh: 'ธ.ค. 25', avgPulse: 80, avgSys: 104, avgDia: 65, count: 48 },
  { month: '2026-01', label: 'Jan 26', labelTh: 'ม.ค. 26', avgPulse: 84, avgSys: 104, avgDia: 66, count: 52 },
  { month: '2026-02', label: 'Feb 26', labelTh: 'ก.พ. 26', avgPulse: 84, avgSys: 103, avgDia: 65, count: 54 },
  { month: '2026-03', label: 'Mar 26', labelTh: 'มี.ค. 26', avgPulse: 83, avgSys: 103, avgDia: 66, count: 58 },
  { month: '2026-04', label: 'Apr 26', labelTh: 'เม.ย. 26', avgPulse: 84, avgSys: 103, avgDia: 65, count: 54 },
  { month: '2026-05', label: 'May 26', labelTh: 'พ.ค. 26', avgPulse: 88, avgSys: 103, avgDia: 65, count: 49 },
  { month: '2026-06', label: 'Jun 26', labelTh: 'มิ.ย. 26', avgPulse: 84, avgSys: 102, avgDia: 66, count: 51 },
  { month: '2026-07', label: 'Jul 26', labelTh: 'ก.ค. 26', avgPulse: 85, avgSys: 100, avgDia: 65, count: 48 },
  { month: '2026-08', label: 'Aug 26', labelTh: 'ส.ค. 26', avgPulse: 83, avgSys: 100, avgDia: 65, count: 53 },
  { month: '2026-09', label: 'Sep 26', labelTh: 'ก.ย. 26', avgPulse: 83, avgSys: 101, avgDia: 65, count: 55 },
  { month: '2026-10', label: 'Oct 26', labelTh: 'ต.ค. 26', avgPulse: 84, avgSys: 102, avgDia: 66, count: 18 },
];
