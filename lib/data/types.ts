// Shared content types — لم يتغير المحتوى، فقط التنظيم
export interface DailyItem {
  id: string;
  title: string;
  act_description: string;
  dhikr_dua: string;
  alternative_dhikr?: string;
  reward_virtue: string;
  spiritual_and_educational_facet: string;
  source: string;
}

export interface DailyStage {
  stage_id: string;
  period_name: string;
  stage_objective: string;
  items: DailyItem[];
}

export interface MonthFunctionItem {
  act_name: string;
  details: string;
  reward?: string;
  dhikr_dua?: string;
  spiritual_and_educational_facet: string;
  evidence: string;
}

export interface MonthData {
  month_number: number;
  name: string;
  title: string;
  acts_and_functions: MonthFunctionItem[];
}

export interface SeasonSolar {
  season_name: string;
  spiritual_concept_and_functions: string;
  educational_facet: string;
}

export interface ContextualDuaItem {
  situation: string;
  sunnah_act: string;
  text: string;
  reward: string;
  spiritual_and_educational_facet: string;
  source: string;
}

export interface ContextualCategory {
  category_name: string;
  items: ContextualDuaItem[];
}

export interface SoulRule {
  rule_id: string;
  title: string;
  rule_content: string;
  soul_governance_application: string;
}

export interface DhikrRule {
  rule_id: string;
  title: string;
  content: string;
}

export interface HabitItem {
  habit_name: string;
  target: string;
  evaluation_criterion: string;
}
