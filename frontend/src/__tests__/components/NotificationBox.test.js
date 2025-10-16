import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { NotificationBox } from '../../../components/dialog/NotificationBox';

// Mock apiCall module
jest.mock('../../../Interceptor/apiCall', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
}));

jest.mock('../../../components/notification/Notification', () => ({
  Notification: () => <div data-testid="notification-item">Notification</div>
}));
jest.mock('../../../assets/Spinner', () => ({
  Spinner: () => <div data-testid="spinner">Loading...</div>
}));

const { api } = require('../../../Interceptor/apiCall');

describe('NotificationBox Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders NotificationBox without crashing', () => {
    api.get = jest.fn().mockResolvedValue({ data: [] });
    render(<NotificationBox />);
  });

  test('displays loading spinner initially', () => {
    api.get = jest.fn().mockImplementation(() => new Promise(() => {}));
    render(<NotificationBox />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  test('displays "Nothing to see here" when no notifications', async () => {
    api.get = jest.fn().mockResolvedValue({ data: [] });
    render(<NotificationBox />);
    
    await waitFor(() => {
      expect(screen.getByText(/Nothing to see here/i)).toBeInTheDocument();
    });
  });

  test('renders notifications when API returns data', async () => {
    const mockNotifications = [
      {
        _id: '1',
        user: 'user1',
        content: 'liked your post',
        NotificationType: 1,
        seen: false,
        time: new Date()
      },
      {
        _id: '2',
        user: 'user2',
        content: 'commented on your post',
        NotificationType: 2,
        seen: true,
        time: new Date()
      }
    ];
    
    api.get = jest.fn().mockResolvedValue({ data: mockNotifications });
    render(<NotificationBox />);
    
    await waitFor(() => {
      const notifications = screen.getAllByTestId('notification-item');
      expect(notifications).toHaveLength(2);
    });
  });

  test('handles API error gracefully', async () => {
    api.get = jest.fn().mockRejectedValue(new Error('API Error'));
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    render(<NotificationBox />);
    
    await waitFor(() => {
      expect(screen.getByText(/Nothing to see here/i)).toBeInTheDocument();
    });
    
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  test('handles non-array response from API', async () => {
    api.get = jest.fn().mockResolvedValue({ data: { error: 'Invalid response' } });
    render(<NotificationBox />);
    
    await waitFor(() => {
      expect(screen.getByText(/Nothing to see here/i)).toBeInTheDocument();
    });
  });
});
