/**
 * Room module index file
 * Exports all room-related API functions and hooks
 */

// Re-export API functions
export {
  fetchRooms,
  fetchRoomById,
  fetchRoomsByPropertyId,
  fetchRoomsByStatus,
  fetchRoomsByType,
  createRoom,
  updateRoom,
  deleteRoom,
  updateRoomStatus,
  updateRoomOccupants
} from './api';

// Re-export hooks
export {
  useRooms,
  useRoom,
  useRoomsByProperty,
  useRoomsByStatus,
  useRoomsByType,
  useCreateRoom,
  useUpdateRoom,
  useDeleteRoom,
  useUpdateRoomStatus,
  useUpdateRoomOccupants
} from './useRoom';
