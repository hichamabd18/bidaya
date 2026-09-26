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

export type LibraryCategoryId = 'all' | 'bidaya' | 'hearts' | 'contextual' | 'seasons';

export interface LibraryCategoryDef {
  id: Exclude<LibraryCategoryId, 'all'>;
  title: string;
  shortTitle: string;
  badge: string;
  description: string;
  groupNames: string[];
}

export const LIBRARY_CATEGORIES: LibraryCategoryDef[] = [
  {
    id: 'bidaya',
    title: 'بداية الهداية',
    shortTitle: 'بداية الهداية',
    badge: 'الإمام الغزالي',
    description: 'فقه الطاعات واجتناب المعاصي والآداب والمعاشرة مع الخلق',
    groupNames: [
      'بداية الهداية: فقه الطاعات',
      'بداية الهداية: اجتناب المعاصي',
      'بداية الهداية: الآداب والمعاشرة',
    ],
  },
  {
    id: 'hearts',
    title: 'أعمال القلوب والتزكية',
    shortTitle: 'القلوب والتزكية',
    badge: 'ابن القيم وأئمة السلوك',
    description: 'منازل السائرين من الإكسير وأصول سياسة النفس وفقه الأذكار',
    groupNames: [
      'أعمال القلوب ومنازل السائرين',
      'أصول سياسة النفس',
      'فقه الأذكار',
    ],
  },
  {
    id: 'contextual',
    title: 'السنن والأذكار السياقية',
    shortTitle: 'السنن السياقية',
    badge: 'سنن الأحوال',
    description: 'سنن النبي ﷺ وأذكاره في تقلبات المعاش والسفر والمعاملات والكرب',
    groupNames: [
      'آداب المعاملات واللقاء والمجالسة',
      'الكرب والهموم والديون والأحوال النفسية',
      'آداب السفر والتنقل والمواضع',
      'سنن يومية عامة وآداب العبادة',
      'سنن اللباس والزينة واستعمال الطيب',
      'الرقى والطب النبوي وعيادة المريض والجنائز',
      'الآيات الكونية والظواهر البيئية',
    ],
  },
  {
    id: 'seasons',
    title: 'وظائف شهور العام',
    shortTitle: 'وظائف الشهور',
    badge: 'ابن رجب الحنبلي',
    description: 'وظائف المواسم والشهور الهجرية وأعمالها التعبدية المستخلصة من لطائف المعارف',
    groupNames: [
      'وظائف المحرم',
      'وظائف صفر',
      'وظائف ربيع الأول',
      'وظائف ربيع الآخر',
      'وظائف جمادى الأولى',
      'وظائف جمادى الآخرة',
      'وظائف رجب',
      'وظائف شعبان',
      'وظائف رمضان',
      'وظائف شوال',
      'وظائف ذو القعدة',
      'وظائف ذو الحجة',
    ],
  },
];

export function cleanGroupTitle(groupName: string): string {
  if (groupName.startsWith('بداية الهداية: ')) {
    return groupName.replace('بداية الهداية: ', '');
  }
  if (groupName.startsWith('وظائف ')) {
    return groupName.replace('وظائف ', '');
  }
  return groupName;
}

export function groupUnitLabel(groupName: string, count: number): string {
  if (groupName.includes('أعمال القلوب')) return count === 1 ? 'منزلة واحدة' : count === 2 ? 'منزلتان' : count <= 10 ? `${count} منازل` : `${count} منزلة`;
  if (groupName.includes('سياسة النفس') || groupName.includes('فقه الأذكار')) return count === 1 ? 'قاعدة واحدة' : count === 2 ? 'قاعدتان' : count <= 10 ? `${count} قواعد` : `${count} قاعدة`;
  if (groupName.startsWith('وظائف ')) return count === 1 ? 'وظيفة واحدة' : count === 2 ? 'وظيفتان' : count <= 10 ? `${count} وظائف` : `${count} وظيفة`;
  if (groupName.includes('سنن') || groupName.includes('آداب') || groupName.includes('الكرب')) return count === 1 ? 'سنة واحدة' : count === 2 ? 'سنتان' : count <= 10 ? `${count} سنن` : `${count} سنة`;
  return count === 1 ? 'موضوع واحد' : count === 2 ? 'موضوعان' : count <= 10 ? `${count} مواضيع` : `${count} موضوعاً`;
}

