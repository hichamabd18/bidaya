// نموذج «المكتبة» — معرّفات ثابتة لمقالات المحتوى (توجيه، بحث، توليد ساكن).
// المحتوى نفسه لا يُغيَّر؛ تُبنى المعرّفات من مواضع ثابتة في البيانات.

import { MODULE_2_HIJRI_SEASONS } from './data/seasons.ts';
import { MODULE_3_CONTEXTUAL } from './data/contextual.ts';
import { MODULE_4_SOUL_RULES, MODULE_4_DHIKR_RULES } from './data/rules.ts';
import { MODULE_BIDAYA_ENTRIES } from './data/bidaya.ts';
import { MODULE_HEARTS_ENTRIES } from './data/hearts.ts';

export type LibraryKind = 'month' | 'ctx' | 'soul' | 'dhikr' | 'bidaya' | 'heart';

export interface LibraryEntry {
  id: string;
  kind: LibraryKind;
  group: string; // القسم المعروض في الفهرس والبحث
  title: string;
  scripture?: string;
  sections: { label: string; text: string }[];
  source?: string;
}

export function monthActId(monthNumber: number, actIndex: number): string {
  return `month-${monthNumber}-${actIndex}`;
}

export function contextualId(catIndex: number, itemIndex: number): string {
  return `ctx-${catIndex}-${itemIndex}`;
}

export function libraryEntries(): LibraryEntry[] {
  const entries: LibraryEntry[] = [];

  // ١) بداية الهداية للإمام الغزالي (الطاعات | اجتناب المعاصي | الآداب)
  MODULE_BIDAYA_ENTRIES.forEach((item) => {
    entries.push({
      id: item.id,
      kind: 'bidaya',
      group: item.group,
      title: item.title,
      scripture: item.scripture,
      sections: item.sections,
      source: item.source,
    });
  });

  // ٢) أعمال القلوب ومنازل السائرين (الإكسير للإمام ابن القيم)
  MODULE_HEARTS_ENTRIES.forEach((item) => {
    entries.push({
      id: item.id,
      kind: 'heart',
      group: item.group,
      title: item.title,
      scripture: item.scripture,
      sections: item.sections,
      source: item.source,
    });
  });

  // ٣) أصول سياسة النفس
  MODULE_4_SOUL_RULES.forEach((rule) => {
    entries.push({
      id: `soul-${rule.rule_id}`,
      kind: 'soul',
      group: 'أصول سياسة النفس',
      title: rule.title,
      sections: [
        { label: 'القاعدة', text: rule.rule_content },
        { label: 'التطبيق في سياسة النفس', text: rule.soul_governance_application },
      ],
    });
  });

  // ٤) فقه الأذكار والدعاء
  MODULE_4_DHIKR_RULES.forEach((rule) => {
    entries.push({
      id: `dhikr-${rule.rule_id}`,
      kind: 'dhikr',
      group: 'فقه الأذكار',
      title: rule.title,
      sections: [{ label: 'القاعدة', text: rule.content }],
    });
  });

  // ٥) الأدعية والأذكار السياقية
  MODULE_3_CONTEXTUAL.forEach((category, ci) => {
    category.items.forEach((item, ii) => {
      entries.push({
        id: contextualId(ci, ii),
        kind: 'ctx',
        group: category.category_name,
        title: item.situation,
        scripture: item.text,
        sections: [
          { label: 'السنة العملية', text: item.sunnah_act },
          { label: 'الفضل والأثر', text: item.reward },
          { label: 'المقصد التربوي', text: item.spiritual_and_educational_facet },
        ],
        source: item.source,
      });
    });
  });

  // ٦) وظائف المواسم والشهور الهجرية
  MODULE_2_HIJRI_SEASONS.months.forEach((month) => {
    month.acts_and_functions.forEach((act, ai) => {
      entries.push({
        id: monthActId(month.month_number, ai),
        kind: 'month',
        group: `وظائف ${month.name}`,
        title: act.act_name,
        scripture: act.dhikr_dua,
        sections: [
          { label: 'التفصيل', text: act.details },
          ...(act.reward ? [{ label: 'الفضل والأثر', text: act.reward }] : []),
          { label: 'المقصد التعبدي وتزكية النفس', text: act.spiritual_and_educational_facet },
        ],
        source: act.evidence,
      });
    });
  });

  return entries;
}

export function findLibraryEntry(id: string): LibraryEntry | undefined {
  return libraryEntries().find((entry) => entry.id === id);
}

/** مجموعات فهرس المكتبة — سياقية ثم قواعد الفقه */
export function libraryGroups(): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const entry of libraryEntries()) {
    counts.set(entry.group, (counts.get(entry.group) ?? 0) + 1);
  }
  return [...counts.entries()].map(([name, count]) => ({ name, count }));
}

export function entriesByGroup(group: string): LibraryEntry[] {
  return libraryEntries().filter((entry) => entry.group === group);
}
