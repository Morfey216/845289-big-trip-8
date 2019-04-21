const FILTER_CAPTIONS = [
  `Everything`,
  `Future`,
  `Past`
];

const createFilters = (captions) => {
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
  const allFilters = createFilters(FILTER_CAPTIONS);
  allFilters[0].checked = true;
  return allFilters;
};
