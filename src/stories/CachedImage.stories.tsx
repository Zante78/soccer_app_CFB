import type { Meta, StoryObj } from '@storybook/react';
import { CachedImage } from '../components/common/CachedImage';
import { User } from 'lucide-react';

const meta = {
  title: 'Common/CachedImage',
  component: CachedImage,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CachedImage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2',
    alt: 'Ein Fußballplatz',
    className: 'w-64 h-64 object-cover rounded-lg',
  },
};

export const WithFallback: Story = {
  args: {
    src: 'https://invalid-url.com/image.jpg',
    alt: 'Fehlerhaftes Bild',
    className: 'w-64 h-64 object-cover rounded-lg',
    fallback: (
      <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <User className="w-12 h-12 text-gray-400" />
      </div>
    ),
  },
};