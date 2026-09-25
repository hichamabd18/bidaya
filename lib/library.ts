// نموذج «المكتبة» — معرّفات ثابتة لمقالات المحتوى (توجيه، بحث، توليد ساكن).
// المحتوى نفسه لا يُغيَّر؛ تُبنى المعرّفات من مواضع ثابتة في البيانات.

import { MODULE_2_HIJRI_SEASONS } from '@/lib/data/seasons';
import { MODULE_3_CONTEXTUAL } from '@/lib/data/contextual';
import { MODULE_4_SOUL_RULES, MODULE_4_DHIKR_RULES } from '@/lib/data/rules';

export type LibraryKind = 'month' | 'ctx' | 'soul' | 'dhikr';

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

  MODULE_4_DHIKR_RULES.forEach((rule) => {
    entries.push({
      id: `dhikr-${rule.rule_id}`,
      kind: 'dhikr',
      group: 'فقه الأذكار',
      title: rule.title,
      sections: [{ label: 'القاعدة', text: rule.content }],
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
