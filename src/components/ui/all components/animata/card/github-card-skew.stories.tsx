import GithubCardSkew from "./github-card-skew";
import { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Card/Github Card Skew",
  component: GithubCardSkew,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof GithubCardSkew>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {},
};
