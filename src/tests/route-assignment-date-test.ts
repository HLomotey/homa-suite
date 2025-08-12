import { supabase } from '@/integration/supabase';
import { 
  createRouteAssignment, 
  updateRouteAssignment, 
  fetchRouteAssignmentById, 
  deleteRouteAssignment,
  createRouteExecutionLog,
  fetchRouteExecutionLogsByAssignment
} from '@/hooks/transport/routeApi';

/**
 * Test script to verify date field persistence in route assignments
 * 
 * This script tests:
 * 1. Creating a route assignment with date fields
 * 2. Verifying the date fields are correctly persisted
 * 3. Updating the route assignment with new date fields
 * 4. Creating a route execution log with date/time fields
 * 5. Cleaning up test data
 */

async function testRouteAssignmentDatePersistence() {
  console.log('Starting route assignment date persistence test...');
  
  try {
    // Test data
    const testData = {
      combinedRouteId: '1', // Replace with an actual combined route ID from your database
      vehicleId: '1',       // Replace with an actual vehicle ID from your database
      driverId: '1',        // Replace with an actual driver ID from your database
      startDate: '2025-09-01',
      endDate: '2025-09-30',
      notes: 'Test route assignment for date persistence verification'
    };
    
    // Step 1: Create a route assignment
    console.log('Creating test route assignment...');
    const createdAssignment = await createRouteAssignment(
      testData.combinedRouteId,
      testData.vehicleId,
      testData.driverId,
      testData.startDate,
      testData.endDate,
      testData.notes
    );
    
    console.log('Created assignment:', createdAssignment);
    console.log('Assignment ID:', createdAssignment.id);
    
    // Step 2: Verify the date fields were correctly persisted
    console.log('Verifying date fields persistence...');
    const fetchedAssignment = await fetchRouteAssignmentById(createdAssignment.id);
    
    console.log('Fetched assignment:', fetchedAssignment);
    console.log('Start date:', fetchedAssignment.startDate);
    console.log('End date:', fetchedAssignment.endDate);
    
    // Verify dates match
    if (fetchedAssignment.startDate !== testData.startDate) {
      throw new Error(`Start date mismatch! Expected: ${testData.startDate}, Got: ${fetchedAssignment.startDate}`);
    }
    
    if (fetchedAssignment.endDate !== testData.endDate) {
      throw new Error(`End date mismatch! Expected: ${testData.endDate}, Got: ${fetchedAssignment.endDate}`);
    }
    
    console.log('✅ Date fields correctly persisted in create operation');
    
    // Step 3: Update the route assignment with new dates
    const updatedData = {
      startDate: '2025-10-01',
      endDate: '2025-10-31'
    };
    
    console.log('Updating route assignment with new dates...');
    const updatedAssignment = await updateRouteAssignment(
      createdAssignment.id,
      testData.vehicleId,
      testData.driverId,
      updatedData.startDate,
      updatedData.endDate,
      'scheduled',
      testData.notes
    );
    
    console.log('Updated assignment:', updatedAssignment);
    
    // Verify updated dates
    if (updatedAssignment.startDate !== updatedData.startDate) {
      throw new Error(`Updated start date mismatch! Expected: ${updatedData.startDate}, Got: ${updatedAssignment.startDate}`);
    }
    
    if (updatedAssignment.endDate !== updatedData.endDate) {
      throw new Error(`Updated end date mismatch! Expected: ${updatedData.endDate}, Got: ${updatedAssignment.endDate}`);
    }
    
    console.log('✅ Date fields correctly persisted in update operation');
    
    // Step 4: Create a route execution log with date/time fields
    const executionLogData = {
      executionDate: '2025-10-05',
      startTime: '08:30',
      endTime: '10:45',
      status: 'completed' as const,
      notes: 'Test execution log'
    };
    
    console.log('Creating test route execution log...');
    const createdLog = await createRouteExecutionLog(
      createdAssignment.id,
      executionLogData.executionDate,
      executionLogData.startTime,
      executionLogData.status,
      executionLogData.notes,
      undefined,
      executionLogData.endTime
    );
    
    console.log('Created execution log:', createdLog);
    
    // Verify execution log date fields
    if (createdLog.executionDate !== executionLogData.executionDate) {
      throw new Error(`Execution date mismatch! Expected: ${executionLogData.executionDate}, Got: ${createdLog.executionDate}`);
    }
    
    if (createdLog.startTime !== executionLogData.startTime) {
      throw new Error(`Start time mismatch! Expected: ${executionLogData.startTime}, Got: ${createdLog.startTime}`);
    }
    
    if (createdLog.endTime !== executionLogData.endTime) {
      throw new Error(`End time mismatch! Expected: ${executionLogData.endTime}, Got: ${createdLog.endTime}`);
    }
    
    console.log('✅ Date/time fields correctly persisted in execution log');
    
    // Fetch execution logs to verify
    const fetchedLogs = await fetchRouteExecutionLogsByAssignment(createdAssignment.id);
    console.log(`Fetched ${fetchedLogs.length} execution logs`);
    
    if (fetchedLogs.length === 0) {
      throw new Error('No execution logs found for the assignment');
    }
    
    // Step 5: Clean up test data
    console.log('Cleaning up test data...');
    await deleteRouteAssignment(createdAssignment.id);
    console.log('Test data cleaned up');
    
    console.log('✅ Route assignment date persistence test completed successfully');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testRouteAssignmentDatePersistence();
