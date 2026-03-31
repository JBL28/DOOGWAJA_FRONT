import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";

describe("testing library smoke", () => {
  it("can import testing library", () => {
    expect(render).toBeDefined();
  });
});
