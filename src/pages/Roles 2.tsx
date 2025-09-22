import React from 'react';
import { useParams } from 'react-router-dom';
import { RoleList } from '@/components/roles/RoleList';
import { RoleDetail } from '@/components/roles/RoleDetail';

export default function Roles() {
  const { roleId } = useParams<{ roleId: string }>();
  
  // If roleId is provided, show the role detail page, otherwise show the list
  return roleId ? <RoleDetail /> : <RoleList />;
}
