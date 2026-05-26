import { mockAdmissionData, mockUniversities, mockMajors } from '@/lib/mock-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const universityId = searchParams.get('universityId') || '';
  const majorId = searchParams.get('majorId') || '';

  if (!universityId && !majorId) {
    return Response.json({ error: '请提供院校ID或专业ID' }, { status: 400 });
  }

  let data = [...mockAdmissionData];

  if (universityId) {
    data = data.filter(a => a.university_id === parseInt(universityId));
  }
  if (majorId) {
    data = data.filter(a => a.major_id === parseInt(majorId));
  }

  data.sort((a, b) => a.year - b.year);

  const uniMap: Record<number, any> = {};
  mockUniversities.forEach(u => {
    uniMap[u.id] = { name: u.name, province: u.province, type: u.type };
  });

  const majorMap: Record<number, any> = {};
  mockMajors.forEach(m => {
    majorMap[m.id] = m;
  });

  const parentMap: Record<number, any> = {};
  mockMajors.filter(m => m.parent_id === null).forEach(m => {
    parentMap[m.id] = { name: m.name, code: m.code };
  });

  const enriched = data.map(a => {
    const major = majorMap[a.major_id];
    return {
      ...a,
      universities: uniMap[a.university_id] || null,
      majors: major ? {
        ...major,
        parent_name: major.parent_id ? parentMap[major.parent_id]?.name || null : null,
        parent_code: major.parent_id ? parentMap[major.parent_id]?.code || null : null,
      } : null,
    };
  });

  return Response.json({ data: enriched });
}
