import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  addons: [],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  staticDirs: ["../public"],
  stories: ["../src/**/*.stories.@(ts|tsx)"],
};

export default config;
