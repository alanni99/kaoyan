import { mockMajors, mockUniversityMajors, mockUniversities, mockAdmissionData } from '@/lib/mock-data';

interface UniversityMajorResult {
  university_major_id: number;
  university_id: number;
  university_name: string;
  province: string;
  city: string;
  university_type: string;
  university_level: string;
  region: string;
  is_self_marking: string;
  major_id: number;
  major_name: string;
  college_name: string | null;
  direction: string | null;
  english_type: string | null;
  math_type: string | null;
  study_mode: string | null;
  exam_subjects: string | null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const majorId = parseInt(id);

  if (isNaN(majorId)) {
    return Response.json({ error: '无效的专业ID' }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const region = searchParams.get('region') || '';
  const level = searchParams.get('level') || '';
  const englishType = searchParams.get('englishType') || '';
  const mathType = searchParams.get('mathType') || '';
  const studyMode = searchParams.get('studyMode') || '';
  const sort = searchParams.get('sort') || 'name';
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');

  const major = mockMajors.find(m => m.id === majorId);
  if (!major) {
    return Response.json({ error: '专业不存在' }, { status: 404 });
  }

  const parentMajor = major.parent_id ? mockMajors.find(m => m.id === major.parent_id) : null;
  const childMajors = mockMajors.filter(m => m.parent_id === majorId);

  const relatedMajorIds = [majorId, ...childMajors.map(m => m.id)];

  let universityMajors = mockUniversityMajors.filter(um => relatedMajorIds.includes(um.major_id));

  if (englishType) {
    universityMajors = universityMajors.filter(um => um.english_type === englishType);
  }
  if (mathType) {
    universityMajors = universityMajors.filter(um => um.math_type === mathType);
  }
  if (studyMode) {
    universityMajors = universityMajors.filter(um => um.study_mode === studyMode);
  }

  const universitiesMap: Record<number, any> = {};
  mockUniversities.forEach(u => {
    universitiesMap[u.id] = u;
  });

  const results = universityMajors
    .map(um => {
      const university = universitiesMap[um.university_id];
      if (!university) return null;
      
      if (region && university.region !== region) return null;
      if (level && university.type !== level) return null;

      const childMajor = childMajors.find(cm => cm.id === um.major_id);
      const majorName = childMajor ? childMajor.name : major.name;

      return {
        university_major_id: um.id,
        university_id: um.university_id,
        university_name: university.name,
        province: university.province,
        city: university.city,
        university_type: university.type,
        university_level: university.level,
        region: university.region,
        is_self_marking: university.is_self_marking,
        major_id: um.major_id,
        major_name: majorName,
        college_name: um.college_name,
        direction: um.direction,
        english_type: um.english_type,
        math_type: um.math_type,
        study_mode: um.study_mode,
        exam_subjects: um.exam_subjects,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null) as UniversityMajorResult[];

  const sortedResults = results.sort((a, b) => {
    if (!a || !b) return 0;
    switch (sort) {
      case 'level': {
        const levelOrder: Record<string, number> = { '985': 1, '211': 2, '双一流': 3, '普通': 4, '科研院所': 5 };
        const aLevel = levelOrder[a.university_type] || 99;
        const bLevel = levelOrder[b.university_type] || 99;
        return aLevel - bLevel;
      }
      case 'region': {
        return (a.region || 'A').localeCompare(b.region || 'A');
      }
      default: {
        return a.university_name.localeCompare(b.university_name, 'zh-CN'); 
      }
    }
  });

  const total = sortedResults.length;
  const from = (page - 1) * pageSize;
  const to = from + pageSize;
  const paginatedResults = sortedResults.slice(from, to);

  const admissionStats = mockAdmissionData
    .filter(a => relatedMajorIds.includes(a.major_id))
    .sort((a, b) => b.year - a.year)
    .map(a => ({
      year: a.year,
      score_line_total: a.score_line_total,
      enrolled_count: a.enrolled_count,
      applied_count: a.applied_count
    }));

  const allUmForFilters = mockUniversityMajors.filter(um => relatedMajorIds.includes(um.major_id));
  const englishTypes = [...new Set(allUmForFilters.map(um => um.english_type).filter(Boolean))] as string[];
  const mathTypes = [...new Set(allUmForFilters.map(um => um.math_type).filter(Boolean))] as string[];
  const studyModes = [...new Set(allUmForFilters.map(um => um.study_mode).filter(Boolean))] as string[];

  return Response.json({
    major: {
      ...major,
      parent: parentMajor,
      children: childMajors,
    },
    universities: paginatedResults,
    total,
    page,
    pageSize,
    admissionStats,
    filters: {
      englishTypes,
      mathTypes,
      studyModes,
      regions: ['A', 'B'],
      levels: ['985', '211', '双一流', '普通'],
    },
  });
}
