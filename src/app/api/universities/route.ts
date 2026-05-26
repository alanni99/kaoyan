import { mockUniversities } from '@/lib/mock-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword') || '';
  const province = searchParams.get('province') || '';
  const type = searchParams.get('type') || '';
  const level = searchParams.get('level') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');

  let data = [...mockUniversities];

  if (keyword) {
    data = data.filter(u => u.name.includes(keyword));
  }
  if (province) {
    data = data.filter(u => u.province === province);
  }
  if (type) {
    data = data.filter(u => u.type === type);
  }
  if (level) {
    data = data.filter(u => u.level === level);
  }

  data.sort((a, b) => (a.ranking || 999) - (b.ranking || 999));

  const total = data.length;
  const from = (page - 1) * pageSize;
  const to = from + pageSize;
  const paginatedData = data.slice(from, to);

  return Response.json({
    data: paginatedData,
    total,
    page,
    pageSize,
  });
}
