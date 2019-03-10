export default (caption, checked = false) => `<input 
  type="radio" 
  id="filter-${caption.toLowerCase()}" 
  name="filter" 
  value="${caption.toLowerCase()}" 
  ${checked ? `checked` : ``}>
  <label class="trip-filter__item" 
  for="filter-${caption.toLowerCase()}">${caption}</label>`;
