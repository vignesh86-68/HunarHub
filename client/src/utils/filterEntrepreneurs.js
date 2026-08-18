export const filterEntrepreneurs = (entrepreneurs, filters = {}) => {
  const normalizedSearch = (filters.search || '').trim().toLowerCase();
  const normalizedCategory = (filters.category || '').trim().toLowerCase();
  const normalizedLocation = (filters.location || '').trim().toLowerCase();

  return entrepreneurs.filter((entrepreneur) => {
    const businessName = (entrepreneur.businessName || '').toLowerCase();
    const ownerName = (entrepreneur.ownerName || entrepreneur.user?.name || '').toLowerCase();
    const category = (entrepreneur.skillCategory || '').toLowerCase();
    const location = (entrepreneur.location || '').toLowerCase();

    const matchesSearch = !normalizedSearch || businessName.includes(normalizedSearch) || ownerName.includes(normalizedSearch);
    const matchesCategory = !normalizedCategory || category === normalizedCategory;
    const matchesLocation = !normalizedLocation || location.includes(normalizedLocation);

    return matchesSearch && matchesCategory && matchesLocation;
  });
};
