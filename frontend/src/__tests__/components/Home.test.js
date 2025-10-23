import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../../pages/Home';
import { AuthContext } from '../../context/Auth';

// Mock the API
jest.mock('../../Interceptor/apiCall', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
}));

const { api } = require('../../Interceptor/apiCall');

// Mock the components
jest.mock('../../components/home/post/Card', () => ({
  __esModule: true,
  default: () => <div data-testid="post-card">Post Card</div>
}));

jest.mock('../../components/home/rightbar/Right', () => ({
  __esModule: true,
  default: () => <div data-testid="right-bar">Right Bar</div>
}));

jest.mock('../../components/home/stories/StoryContainer', () => ({
  __esModule: true,
  default: () => <div data-testid="story-container">Story Container</div>
}));

jest.mock('../../assets/Spinner', () => ({
  Spinner: () => <div data-testid="spinner">Loading...</div>
}));

describe('Home Component', () => {
  const mockContextValue = {
    auth: { _id: '123', username: 'testuser' },
    handleActive: jest.fn(),
    newpost: null
  };

  const renderHome = (stories = []) => {
    return render(
      <BrowserRouter>
        <AuthContext.Provider value={mockContextValue}>
          <Home stories={stories} />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders Home component without crashing', () => {
    api.get = jest.fn().mockResolvedValue({ data: [] });
    renderHome();
    expect(screen.getByTestId('story-container')).toBeInTheDocument();
    expect(screen.getByTestId('right-bar')).toBeInTheDocument();
  });

  test('displays loading spinner when fetching posts', () => {
    api.get = jest.fn().mockImplementation(() => new Promise(() => {}));
    renderHome();
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  test('displays "No posts to see" message when there are no posts', async () => {
    api.get = jest.fn().mockResolvedValue({ data: [] });
    renderHome();
    
    await waitFor(() => {
      expect(screen.getByText(/No posts to see/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('renders posts when API returns data', async () => {
    const mockPosts = [
      {
        _id: '1',
        owner: 'user1',
        files: [{ link: 'image1.jpg' }],
        likes: [],
        saved: [],
        caption: 'Test post 1',
        comments: [],
        createdAt: new Date()
      }
    ];
    
    api.get = jest.fn().mockResolvedValue({ data: mockPosts });
    renderHome();
    
    await waitFor(() => {
      expect(screen.getByTestId('post-card')).toBeInTheDocument();
    });
  });

  test('handles API error gracefully', async () => {
    api.get = jest.fn().mockRejectedValue(new Error('API Error'));
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    renderHome();
    
    await waitFor(() => {
      expect(screen.getByText(/No posts to see/i)).toBeInTheDocument();
    });
    
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  test('handles non-array API response', async () => {
    api.get = jest.fn().mockResolvedValue({ data: { error: 'Something went wrong' } });
    renderHome();
    
    await waitFor(() => {
      expect(screen.getByText(/No posts to see/i)).toBeInTheDocument();
    });
  });

  test('calls handleActive with "home" on mount', async () => {
    api.get = jest.fn().mockResolvedValue({ data: [] });
    renderHome();
    
    await waitFor(() => {
      expect(mockContextValue.handleActive).toHaveBeenCalledWith('home');
    });
  });
});
