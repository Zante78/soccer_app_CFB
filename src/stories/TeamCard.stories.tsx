import type { Meta, StoryObj } from '@storybook/react';
import { TeamCard } from '../components/team/TeamCard';

const meta = {
  title: 'Team/TeamCard',
  component: TeamCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TeamCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockTeam = {
  id: '1',
  name: 'FC Beispiel',
  category: 'U19',
  season: '2023/24',
  photo_url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2',
  colors: {
    primary: '#ff0000',
    secondary: '#ffffff'
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const Default: Story = {
  args: {
    team: mockTeam,
    onClick: () => console.log('Team clicked'),
    onEdit: () => console.log('Edit clicked'),
    onDelete: () => console.log('Delete clicked')
  },
};

export const WithoutPhoto: Story = {
  args: {
    team: { ...mockTeam, photo_url: undefined },
    onClick: () => console.log('Team clicked'),
    onEdit: () => console.log('Edit clicked'),
    onDelete: () => console.log('Delete clicked')
  },
};