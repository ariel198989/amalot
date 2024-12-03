import LiveScore from "./live-score";
import { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Widget/Live Score",
  component: LiveScore,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof LiveScore>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {},
};
