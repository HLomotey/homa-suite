/**
 * Hook to fetch rooms assigned to a staff member
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAssignmentsByStaff } from "../assignment";
import { FrontendAssignment } from "../../integration/supabase/types";

/**
 * Interface for room data extracted from assignments
 */
export interface StaffRoom {
  roomId: string;
  roomName: string;
  propertyId: string;
  propertyName: string;
}

/**
 * Hook for fetching rooms assigned to a staff member
 * @param staffId Staff ID to fetch rooms for
 * @returns Object containing rooms data, loading state, and error state
 */
export const useStaffRooms = (staffId: string) => {
  // Use the assignments hook to fetch all assignments for this staff
  const { 
    assignments, 
    loading: assignmentsLoading, 
    error: assignmentsError,
    refetch: refetchAssignments
  } = useAssignmentsByStaff(staffId);
  
  // Extract unique rooms from assignments
  const rooms = useMemo(() => {
    if (!assignments) return [];
    
    // Create a map to store unique rooms by roomId
    const roomMap = new Map<string, StaffRoom>();
    
    // Process each assignment
    assignments.forEach(assignment => {
      // Only process assignments with valid room data
      if (assignment.roomId && assignment.roomName) {
        // Add to map if not already present
        if (!roomMap.has(assignment.roomId)) {
          roomMap.set(assignment.roomId, {
            roomId: assignment.roomId,
            roomName: assignment.roomName,
            propertyId: assignment.propertyId || "",
            propertyName: assignment.propertyName || ""
          });
        }
      }
    });
    
    // Convert map to array
    return Array.from(roomMap.values());
  }, [assignments]);
  
  // Extract unique property IDs from rooms
  const propertyIds = useMemo(() => {
    return [...new Set(rooms.map(room => room.propertyId).filter(Boolean))];
  }, [rooms]);

  return {
    rooms,
    propertyIds,
    loading: assignmentsLoading,
    error: assignmentsError,
    refetch: refetchAssignments
  };
};
