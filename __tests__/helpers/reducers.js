export const counterReducer = (state = 0, { type }) => {
  switch (type) {
    case "INCREMENT":
      return state + 1;
    case "DECREMENT":
      return state - 1;
    default:
      return state;
  }
};

export const todoReducer = (state = [], { type, payload }) => {
  switch (type) {
    case "ADD_TODO":
      return [...state, payload];
    default:
      return state;
  }
};

export const genericReducer = (state = { a: 1 }, { type, payload }) => {
  switch (type) {
    case "DO_SOMETHING":
      return { ...state, payload };
    default:
      return state;
  }
};

export const plainReducersObj = {
  genericReducer,
  todoReducer,
  counterReducer
};
