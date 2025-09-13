import { getAllEvents, getEventById } from '../lib/apiService';
import { supabase } from '../lib/supabase';

jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

const mockedSupabase = supabase as unknown as { from: jest.Mock };

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
});
