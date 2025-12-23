import { describe, it, expect } from "vitest";
import { createMarkdownParser } from "@wemd/core";

describe("MarkdownParser", () => {
  const parser = createMarkdownParser();

  it("renders headers with span", () => {
    const input = "# Hello World";
    const output = parser.render(input);
    // markdown-it-span renders: <h1><span class="prefix"></span><span class="content">Title</span><span class="suffix"></span></h1>
    expect(output).toContain('<span class="content">Hello World</span>');
  });

  it("renders math blocks correctly", () => {
    const input = "$$E=mc^2$$";
    const output = parser.render(input);
    expect(output).toContain('class="block-equation"');
  });

  it("renders image flow", () => {
    // Regex requires comma between images: <![a](b),![c](d)>
    const input = "<![img1](1.png),![img2](2.png)>";
    const output = parser.render(input);
    expect(output).toContain("imageflow-layer1");
    expect(output).toContain('<img alt="img1" src="1.png"');
    expect(output).toContain('<img alt="img2" src="2.png"');
  });
});
