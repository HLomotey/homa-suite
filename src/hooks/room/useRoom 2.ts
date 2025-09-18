/**
 * Room hooks for Supabase integration
 * These hooks provide data fetching and state management for room data
 */

import { useState, useEffect, useCallback } from "react";
import {
  FrontendRoom,
  RoomStatus,
  RoomType
} from "../../integration/supabase/types";
import * as roomApi from "./api";

/**
 * Hook for fetching all rooms
 * @returns Object containing rooms data, loading state, error state, and refetch function
 */
export const useRooms = () => {
  const [rooms, setRooms] = useState<FrontendRoom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await roomApi.fetchRooms();
      setRooms(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { rooms, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching a single room by ID
 * @param id Room ID
 * @returns Object containing room data, loading state, error state, and refetch function
 */
export const useRoom = (id: string) => {
  const [room, setRoom] = useState<FrontendRoom | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await roomApi.fetchRoomById(id);
      setRoom(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { room, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching rooms by property ID
 * @param propertyId Property ID to filter by
 * @returns Object containing rooms data, loading state, error state, and refetch function
 */
export const useRoomsByProperty = (propertyId: string) => {
  const [rooms, setRooms] = useState<FrontendRoom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!propertyId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await roomApi.fetchRoomsByPropertyId(propertyId);
      setRooms(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { rooms, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching rooms by status
 * @param status Room status to filter by
 * @returns Object containing rooms data, loading state, error state, and refetch function
 */
export const useRoomsByStatus = (status: RoomStatus) => {
  const [rooms, setRooms] = useState<FrontendRoom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await roomApi.fetchRoomsByStatus(status);
      setRooms(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { rooms, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching rooms by type
 * @param type Room type to filter by
 * @returns Object containing rooms data, loading state, error state, and refetch function
 */
export const useRoomsByType = (type: RoomType) => {
  const [rooms, setRooms] = useState<FrontendRoom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await roomApi.fetchRoomsByType(type);
      setRooms(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { rooms, loading, error, refetch: fetchData };
};

/**
 * Hook for creating a new room
 * @returns Object containing create function, loading state, and error state
 */
export const useCreateRoom = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [createdRoom, setCreatedRoom] = useState<FrontendRoom | null>(null);

  const create = useCallback(
    async (roomData: Omit<FrontendRoom, "id">) => {
      try {
        setLoading(true);
        setError(null);
        const data = await roomApi.createRoom(roomData);
        setCreatedRoom(data);
        return data;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { create, loading, error, createdRoom };
};

/**
 * Hook for updating a room
 * @returns Object containing update function, loading state, and error state
 */
export const useUpdateRoom = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [updatedRoom, setUpdatedRoom] = useState<FrontendRoom | null>(null);

  const update = useCallback(
    async (
      id: string,
      roomData: Partial<Omit<FrontendRoom, "id">>
    ) => {
      try {
        setLoading(true);
        setError(null);
        const data = await roomApi.updateRoom(id, roomData);
        setUpdatedRoom(data);
        return data;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { update, loading, error, updatedRoom };
};

/**
 * Hook for deleting a room
 * @returns Object containing delete function, loading state, and error state
 */
export const useDeleteRoom = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isDeleted, setIsDeleted] = useState<boolean>(false);

  const deleteRoom = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await roomApi.deleteRoom(id);
      setIsDeleted(true);
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteRoom, loading, error, isDeleted };
};

/**
 * Hook for updating room status
 * @returns Object containing update function, loading state, and error state
 */
export const useUpdateRoomStatus = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [updatedRoom, setUpdatedRoom] = useState<FrontendRoom | null>(null);

  const updateStatus = useCallback(
    async (id: string, status: RoomStatus) => {
      try {
        setLoading(true);
        setError(null);
        const data = await roomApi.updateRoomStatus(id, status);
        setUpdatedRoom(data);
        return data;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { updateStatus, loading, error, updatedRoom };
};

/**
 * Hook for updating room occupants
 * @returns Object containing update function, loading state, and error state
 */
export const useUpdateRoomOccupants = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [updatedRoom, setUpdatedRoom] = useState<FrontendRoom | null>(null);

  const updateOccupants = useCallback(
    async (id: string, occupants: number) => {
      try {
        setLoading(true);
        setError(null);
        const data = await roomApi.updateRoomOccupants(id, occupants);
        setUpdatedRoom(data);
        return data;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { updateOccupants, loading, error, updatedRoom };
};

/**
 * Hook for bulk deleting multiple rooms
 * @returns Object containing bulkDelete function, loading state, and error state
 */
export const useBulkDeleteRooms = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [results, setResults] = useState<{ success: string[]; errors: string[] }>({ success: [], errors: [] });

  const bulkDelete = useCallback(async (ids: string[]) => {
    try {
      setLoading(true);
      setError(null);
      const result = await roomApi.bulkDeleteRooms(ids);
      setResults(result);
      return result;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { bulkDelete, loading, error, results };
};
