const FILTER_CAPTIONS = [
  `Everything`,
  `Future`,
  `Past`
];

const createFilter = (captions) => {
  const filters = [];
  for (const caption of captions) {
    filters.push({
      caption,
      checked: false
    });
  }
  return filters;
};


export default () => {
  const allFilters = createFilter(FILTER_CAPTIONS);
  allFilters[0].checked = true;
  return allFilters;
};
