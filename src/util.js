const Keycode = {
  ESC: 27
};

const isEscEvent = (evt, action) => {
  if (evt.keyCode === Keycode.ESC) {
    evt.preventDefault();
    action();
  }
};

const createItems = (captions) => {
  const items = [];
  for (const caption of captions) {
    items.push({
      caption,
      checked: false
    });
  }
  return items;
};


const getControlItems = (captions) => {
  const allItems = createItems(captions);
  allItems[0].checked = true;
  return allItems;
};

export {isEscEvent, getControlItems};
