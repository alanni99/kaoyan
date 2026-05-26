import { mockUniversities, mockUniversityMajors, mockMajors, mockAdmissionData } from '@/lib/mock-data';

export async function POST(request: Request) {
  const { universityIds } = await request.json();

  if (!universityIds || !Array.isArray(universityIds) || universityIds.length === 0) {
    return Response.json({ error: '请提供院校ID列表' }, { status: 400 });
  }

  if (universityIds.length > 3) {
    return Response.json({ error: '最多对比3所院校' }, { status: 400 });
  }

  const ids = universityIds.map((id: any) => parseInt(id)).filter((id: number) => !isNaN(id));

  const universities = mockUniversities.filter(u => ids.includes(u.id));
  const uniMajors = mockUniversityMajors.filter(um => ids.includes(um.university_id));

  const majorMap: Record<number, any> = {};
  mockMajors.forEach(m => {
    majorMap[m.id] = m;
  });

  const enrichedMajors = uniMajors.map(um => {
    const major = majorMap[um.major_id];
    return {
      ...um,
      majors: major || null,
    };
  });

  const admissions = mockAdmissionData
    .filter(a => ids.includes(a.university_id))
    .sort((a, b) => a.year - b.year);

  const enrichedAdmissions = admissions.map(a => {
    const major = majorMap[a.major_id];
    return {
      ...a,
      majors: major || null,
    };
  });

  return Response.json({
    universities,
    majors: enrichedMajors,
    admissions: enrichedAdmissions,
  });
}
