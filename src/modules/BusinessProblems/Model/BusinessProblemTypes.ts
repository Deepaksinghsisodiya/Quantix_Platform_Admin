export interface VisualMeterData {
  iconKey: string;
  legacyText: string;
  quantixText: string;
}

export interface BusinessProblem {
  businessProblemId: string;
  id?: string;
  siteVariant: string; // "Enterprise" | "Restaurant" | "Retail"
  cardKey: string;
  shortTabLabel: string;
  iconKey: string;
  tag: string;
  severity: string; // "CRITICAL" | "HIGH RISK" | "BLINDSPOT"
  title: string;
  description: string;
  impact: string;
  visualMeter: VisualMeterData;
  fixes: string[];
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SaveBusinessProblemDto {
  siteVariant: string;
  cardKey: string;
  shortTabLabel: string;
  iconKey: string;
  tag: string;
  severity: string;
  title: string;
  description: string;
  impact: string;
  visualMeterIconKey: string;
  legacyText: string;
  quantixText: string;
  fixes: string[];
  sortOrder: number;
  isActive: boolean;
}
