import { mockUniversities, mockUniversityMajors, mockMajors, mockAdmissionData } from '@/lib/mock-data';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const universityId = parseInt(id);

  if (!universityId || isNaN(universityId)) {
    return Response.json({ error: '缺少院校ID' }, { status: 400 });
  }

  const university = mockUniversities.find(u => u.id === universityId);
  if (!university) {
    return Response.json({ error: '院校不存在' }, { status: 404 });
  }

  const uniMajors = mockUniversityMajors.filter(um => um.university_id === universityId);
  
  const majorMap: Record<number, any> = {};
  mockMajors.forEach(m => {
    majorMap[m.id] = m;
  });

  const parentMajorMap: Record<number, any> = {};
  mockMajors.filter(m => m.parent_id === null).forEach(m => {
    parentMajorMap[m.id] = { name: m.name, code: m.code };
  });

  const enrichedMajors = uniMajors.map(um => {
    const major = majorMap[um.major_id];
    return {
      id: um.id,
      major_id: um.major_id,
      college_name: um.college_name,
      direction: um.direction,
      majors: major ? {
        ...major,
        parent_name: major.parent_id ? parentMajorMap[major.parent_id]?.name || null : null,
        parent_code: major.parent_id ? parentMajorMap[major.parent_id]?.code || null : null,
      } : null,
    };
  });

  const admissions = mockAdmissionData
    .filter(a => a.university_id === universityId)
    .sort((a, b) => b.year - a.year);

  const enrichedAdmissions = admissions.map(a => {
    const major = majorMap[a.major_id];
    return {
      ...a,
      majors: major ? {
        name: major.name,
        code: major.code,
        category: major.category,
        degree_type: major.degree_type,
        parent_id: major.parent_id,
        parent_name: major.parent_id ? parentMajorMap[major.parent_id]?.name || null : null,
        parent_code: major.parent_id ? parentMajorMap[major.parent_id]?.code || null : null,
      } : null,
    };
  });

  return Response.json({
    university,
    majors: enrichedMajors,
    admissions: enrichedAdmissions,
  });
}
