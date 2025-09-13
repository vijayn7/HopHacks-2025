import { getAllEvents, getEventById, signInToEvent, signOutFromEvent } from '../lib/apiService';
import { supabase } from '../lib/supabase';
import { authService } from '../lib/authService';

jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

jest.mock('../lib/authService', () => ({
  authService: {
    getCurrentUserId: jest.fn(),
  },
}));

const mockedSupabase = supabase as unknown as { from: jest.Mock };
const mockedAuth = authService as unknown as { getCurrentUserId: jest.Mock };

describe('apiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getAllEvents retrieves events with organization data', async () => {
    const mockLimit = jest.fn().mockResolvedValue({ data: [{ id: 1 }], error: null });
    const mockSelect = jest.fn().mockReturnValue({ limit: mockLimit });
    mockedSupabase.from.mockReturnValue({ select: mockSelect });

    const result = await getAllEvents();

    expect(mockedSupabase.from).toHaveBeenCalledWith('events');
    expect(mockSelect).toHaveBeenCalledWith(`
      *,
      organizations (
        id,
        name,
        email,
        phone,
        verified
      )
    `);
    expect(mockLimit).toHaveBeenCalledWith(100);
    expect(result).toEqual({ data: [{ id: 1 }], error: null });
  });

  test('getEventById queries event by id', async () => {
    const mockSingle = jest.fn().mockResolvedValue({ data: { id: 'abc' }, error: null });
    const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    mockedSupabase.from.mockReturnValue({ select: mockSelect });

    const result = await getEventById('abc');

    expect(mockedSupabase.from).toHaveBeenCalledWith('events');
    expect(mockEq).toHaveBeenCalledWith('id', 'abc');
    expect(mockSingle).toHaveBeenCalled();
    expect(result).toEqual({ data: { id: 'abc' }, error: null });
  });

  test('signInToEvent inserts join for event', async () => {
    const mockSingle = jest.fn().mockResolvedValue({ data: { id: 'join1' }, error: null });
    const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
    const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });
    mockedSupabase.from.mockReturnValue({ insert: mockInsert });

    const result = await signInToEvent('event1');

    expect(mockedSupabase.from).toHaveBeenCalledWith('joins');
    expect(mockInsert).toHaveBeenCalledWith({ event_id: 'event1' });
    expect(mockSingle).toHaveBeenCalled();
    expect(result).toEqual({ data: { id: 'join1' }, error: null });
  });

  test('signOutFromEvent updates join record with checkout', async () => {
    mockedAuth.getCurrentUserId.mockResolvedValue('user1');
    const mockSingle = jest.fn().mockResolvedValue({ data: { id: 'join1' }, error: null });
    const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
    const mockEq2 = jest.fn().mockReturnValue({ select: mockSelect });
    const mockEq1 = jest.fn().mockReturnValue({ eq: mockEq2 });
    const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq1 });
    mockedSupabase.from.mockReturnValue({ update: mockUpdate });

    const result = await signOutFromEvent('event1');

    expect(mockedSupabase.from).toHaveBeenCalledWith('joins');
    expect(mockUpdate).toHaveBeenCalled();
    expect(mockEq1).toHaveBeenCalledWith('event_id', 'event1');
    expect(mockEq2).toHaveBeenCalledWith('user_id', 'user1');
    expect(mockSingle).toHaveBeenCalled();
    expect(result).toEqual({ data: { id: 'join1' }, error: null });
  });
});
