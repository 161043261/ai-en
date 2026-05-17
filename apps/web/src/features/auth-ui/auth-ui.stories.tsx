import type { Meta, StoryObj } from "@storybook/react-vite";
import { StorybookServices } from "../../app/storybook-services";
import { LoginForm } from "./login-form";

const meta = {
  title: "Features/Auth",
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Login: Story = {
  render: () => (
    <div className="card max-w-md bg-base-100 shadow-xl">
      <div className="card-body">
        <StorybookServices>
          <LoginForm close={() => undefined} setMode={() => undefined} />
        </StorybookServices>
      </div>
    </div>
  ),
};
