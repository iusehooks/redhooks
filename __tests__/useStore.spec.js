import { useStore } from "../src/store";

describe("useStore", () => {
  it("should throw if not called within a function component", () => {
    expect(() => useStore()).toThrow();
  });
});
