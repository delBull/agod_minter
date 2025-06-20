import type { Meta, StoryObj } from '@storybook/react';
import InvestmentTicket from '../components/InvestmentTicket';

const meta = {
  title: 'Components/InvestmentTicket',
  component: InvestmentTicket,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof InvestmentTicket>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultArgs = {
  transactionId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  investmentAmountMXN: 5000,
  investmentAmountETH: 0.071,
  investmentInfo: "Pandora's Box Investment",
  transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  walletAddress: '0xAbCdEfGhIjKlMnOpQrStUvWxYz1234567890',
};

export const Default: Story = {
  args: {
    ...defaultArgs,
  },
};

export const OnIOS: Story = {
    args: {
      ...defaultArgs,
      forceWalletOS: 'iOS',
    },
};

export const OnAndroid: Story = {
    args: {
      ...defaultArgs,
      forceWalletOS: 'Android',
    },
};