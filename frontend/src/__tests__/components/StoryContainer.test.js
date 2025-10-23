import React from 'react';
import { render, screen } from '@testing-library/react';
import StoryContainer from '../../../components/home/stories/StoryContainer';

// Mock Story component and its dependencies
jest.mock('../../../Interceptor/apiCall', () => ({
  api: {
    get: jest.fn(),
  }
}));

jest.mock('../../../components/home/stories/Story', () => ({
  __esModule: true,
  default: () => <div data-testid="story-item">Story</div>
}));

describe('StoryContainer Component', () => {
  test('renders without crashing with empty array', () => {
    render(<StoryContainer stories={[]} />);
    expect(screen.getByText(/Nothing to see here/i)).toBeInTheDocument();
  });

  test('renders stories when provided', () => {
    const mockStories = [
      [{ id: '1', owner: 'user1' }],
      [{ id: '2', owner: 'user2' }]
    ];
    
    render(<StoryContainer stories={mockStories} />);
    const stories = screen.getAllByTestId('story-item');
    expect(stories).toHaveLength(2);
  });

  test('handles undefined stories prop gracefully', () => {
    render(<StoryContainer stories={undefined} />);
    expect(screen.queryByTestId('story-item')).not.toBeInTheDocument();
  });

  test('handles non-array stories prop gracefully', () => {
    render(<StoryContainer stories={{ invalid: 'data' }} />);
    expect(screen.queryByTestId('story-item')).not.toBeInTheDocument();
  });
});
