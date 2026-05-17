import { sidebarsExamples } from "../website/.vitepress/config";

export default {
  load() {
    return {
      sidebarsExamples: sidebarsExamples(),
    };
  },
};
