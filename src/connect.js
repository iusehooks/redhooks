import React from "react";
import { useStore } from "./store";

/**
 * `connect` is a HOC which allows to a React class Component to use the store.
 *  It maps and passes a prop named redhooks to the React class Component which has been applied to.
 */

export default Comp => props => {
  const redhooks = useStore();
  return <Comp {...props} redhooks={redhooks} />;
};
