import { mockMajors } from '@/lib/mock-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const degreeType = searchParams.get('degreeType') || '';
  const discipline = searchParams.get('discipline') || '';
  const parentId = searchParams.get('parentId') || '';
  const level = searchParams.get('level') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '30');

  let data = [...mockMajors];

  if (keyword) {
    data = data.filter(m => m.name.includes(keyword));
  }
  if (category) {
    data = data.filter(m => m.category === category);
  }
  if (degreeType) {
    data = data.filter(m => m.degree_type === degreeType);
  }
  if (discipline) {
    data = data.filter(m => m.first_level_discipline === discipline);
  }
  if (parentId) {
    data = data.filter(m => m.parent_id === parseInt(parentId));
  }
  if (level === 'parent') {
    data = data.filter(m => m.parent_id === null);
  } else if (level === 'child') {
    data = data.filter(m => m.parent_id !== null);
  }

  data.sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    if (a.degree_type !== b.degree_type) return a.degree_type.localeCompare(b.degree_type);
    return a.code.localeCompare(b.code);
  });

  const total = data.length;
  const from = (page - 1) * pageSize;
  const to = from + pageSize;
  const paginatedData = data.slice(from, to);

  const parentMajors = mockMajors.filter(m => m.parent_id === null);
  const uniqueCategories = [...new Set(parentMajors.map(m => m.category))];
  const uniqueDisciplines = [...new Set(parentMajors.map(m => m.first_level_discipline))];

  return Response.json({
    data: paginatedData,
    total,
    page,
    pageSize,
    filters: {
      categories: uniqueCategories,
      disciplines: uniqueDisciplines,
    },
  });
}
