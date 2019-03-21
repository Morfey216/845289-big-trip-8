const Keycode = {
  ESC: 27
};

export default (evt, action) => {
  if (evt.keyCode === Keycode.ESC) {
    evt.preventDefault();
    action();
  }
};
