/**
 * Test script for maintenance transaction CRUD operations
 * Run this script to verify that all fields are being saved correctly
 */

import { supabase } from '../integration/supabase/client';
import { FrontendMaintenanceTransaction } from '../integration/supabase/types/maintenance-transaction';

/**
 * Test maintenance transaction CRUD operations directly using Supabase
 */
async function testMaintenanceTransactionCRUD() {
  try {
    console.log('=== Starting Maintenance Transaction CRUD Test ===');
    
    // Get a valid vehicle ID and maintenance type ID from the database
    const { data: vehicles } = await supabase.from('vehicles').select('id').limit(1);
    const { data: maintenanceTypes } = await supabase.from('maintenance_types').select('id').limit(1);
    
    if (!vehicles || vehicles.length === 0 || !maintenanceTypes || maintenanceTypes.length === 0) {
      console.error('No vehicles or maintenance types found in the database');
      return;
    }
    
    const vehicleId = vehicles[0].id;
    const maintenanceTypeId = maintenanceTypes[0].id;
    
    // Create a new maintenance transaction
    const newTransaction = {
      vehicle_id: vehicleId,
      maintenance_type_id: maintenanceTypeId,
      date: '2025-08-11',
      issue: 'Test Issue',
      amount: 100.50,
      notes: 'Test Notes',
      performed_by: 'Test Technician',
      status: 'Completed',
      receipt_url: 'https://example.com/receipt.pdf'
    };
    
    console.log('Creating new maintenance transaction with data:', newTransaction);
    
    // Insert the transaction
    const { data: createdData, error: createError } = await supabase
      .from('maintenance_transactions')
      .insert(newTransaction)
      .select()
      .single();
    
    if (createError) {
      console.error('Error creating maintenance transaction:', createError);
      return;
    }
    
    console.log('Created transaction:', createdData);
    
    // Verify all fields were saved
    console.log('=== Verifying Created Transaction Fields ===');
    console.log('vehicle_id:', createdData.vehicle_id === newTransaction.vehicle_id);
    console.log('maintenance_type_id:', createdData.maintenance_type_id === newTransaction.maintenance_type_id);
    console.log('date:', createdData.date === newTransaction.date);
    console.log('issue:', createdData.issue === newTransaction.issue);
    console.log('amount:', createdData.amount === newTransaction.amount);
    console.log('notes:', createdData.notes === newTransaction.notes);
    console.log('performed_by:', createdData.performed_by === newTransaction.performed_by);
    console.log('status:', createdData.status === newTransaction.status);
    console.log('receipt_url:', createdData.receipt_url === newTransaction.receipt_url);
    
    // Update the transaction
    const updateData = {
      issue: 'Updated Test Issue',
      amount: 200.75,
      notes: 'Updated Test Notes',
      status: 'In Progress'
    };
    
    console.log('Updating transaction with data:', updateData);
    
    // Update the transaction
    const { data: updatedData, error: updateError } = await supabase
      .from('maintenance_transactions')
      .update(updateData)
      .eq('id', createdData.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating maintenance transaction:', updateError);
      return;
    }
    
    console.log('Updated transaction:', updatedData);
    
    // Verify updated fields
    console.log('=== Verifying Updated Transaction Fields ===');
    console.log('issue:', updatedData.issue === updateData.issue);
    console.log('amount:', updatedData.amount === updateData.amount);
    console.log('notes:', updatedData.notes === updateData.notes);
    console.log('status:', updatedData.status === updateData.status);
    
    // Fetch the transaction to verify persistence
    console.log('Fetching transaction by ID:', createdData.id);
    
    const { data: fetchedData, error: fetchError } = await supabase
      .from('maintenance_transactions')
      .select('*')
      .eq('id', createdData.id)
      .single();
    
    if (fetchError) {
      console.error('Error fetching maintenance transaction:', fetchError);
      return;
    }
    
    console.log('Fetched transaction:', fetchedData);
    
    // Delete the transaction
    console.log('Deleting transaction:', createdData.id);
    
    const { error: deleteError } = await supabase
      .from('maintenance_transactions')
      .delete()
      .eq('id', createdData.id);
    
    if (deleteError) {
      console.error('Error deleting maintenance transaction:', deleteError);
      return;
    }
    
    console.log('Transaction deleted successfully');
    console.log('=== Maintenance Transaction CRUD Test Completed Successfully ===');
  } catch (error) {
    console.error('Error in maintenance transaction CRUD test:', error);
  }
}

// Run the test
testMaintenanceTransactionCRUD();

export {};
