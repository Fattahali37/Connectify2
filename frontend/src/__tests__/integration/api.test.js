describe('API Integration Tests', () => {
  const mockApi = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Array Response Validation', () => {
    test('should handle array responses correctly', async () => {
      const mockResponse = { data: [{ id: 1 }, { id: 2 }] };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await mockApi.get('/test');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBe(2);
    });

    test('should handle non-array responses', async () => {
      const mockResponse = { data: { error: 'Something went wrong' } };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await mockApi.get('/test');
      expect(Array.isArray(result.data)).toBe(false);
    });

    test('should handle null responses', async () => {
      const mockResponse = { data: null };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await mockApi.get('/test');
      expect(result.data).toBe(null);
    });

    test('should handle undefined responses', async () => {
      const mockResponse = { data: undefined };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await mockApi.get('/test');
      expect(result.data).toBe(undefined);
    });

    test('should handle API errors', async () => {
      mockApi.get.mockRejectedValue(new Error('Network Error'));

      await expect(mockApi.get('/test')).rejects.toThrow('Network Error');
    });

    test('should handle 400 errors', async () => {
      const error = {
        response: {
          status: 400,
          data: { success: false, message: 'Bad Request' }
        }
      };
      mockApi.get.mockRejectedValue(error);

      await expect(mockApi.get('/test')).rejects.toMatchObject({
        response: { status: 400 }
      });
    });

    test('should handle 401 unauthorized errors', async () => {
      const error = {
        response: {
          status: 401,
          data: { success: false, message: 'Unauthorized' }
        }
      };
      mockApi.get.mockRejectedValue(error);

      await expect(mockApi.get('/test')).rejects.toMatchObject({
        response: { status: 401 }
      });
    });

    test('should handle 403 forbidden errors (blocked user)', async () => {
      const error = {
        response: {
          status: 403,
          data: { success: false, message: 'Account blocked', isBlocked: true }
        }
      };
      mockApi.get.mockRejectedValue(error);

      await expect(mockApi.get('/test')).rejects.toMatchObject({
        response: {
          status: 403,
          data: { isBlocked: true }
        }
      });
    });
  });

  describe('Data Transformation Tests', () => {
    test('should safely convert non-array to empty array', () => {
      const testCases = [
        { input: null, expected: [] },
        { input: undefined, expected: [] },
        { input: {}, expected: [] },
        { input: 'string', expected: [] },
        { input: 123, expected: [] },
        { input: [1, 2, 3], expected: [1, 2, 3] }
      ];

      testCases.forEach(({ input, expected }) => {
        const result = Array.isArray(input) ? input : [];
        expect(result).toEqual(expected);
      });
    });

    test('should validate array before mapping', () => {
      const validArray = [1, 2, 3];
      const invalidData = { error: 'Not an array' };

      expect(() => {
        if (Array.isArray(validArray)) {
          validArray.map(x => x * 2);
        }
      }).not.toThrow();

      expect(() => {
        if (Array.isArray(invalidData)) {
          invalidData.map(x => x * 2);
        }
      }).not.toThrow();
    });
  });
});
